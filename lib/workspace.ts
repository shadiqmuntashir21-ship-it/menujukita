import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { sql } from "@/lib/db";

export async function requireWorkspace() {
  const { data: session } = await auth.getSession();
  if (!session?.user) redirect("/auth/sign-in");
  const db = sql();
  const jar=await cookies();
  const preferred=jar.get("menujukita_active_wedding")?.value||"";

  if(preferred){
    const rows=await db`
      SELECT w.*,m.role,m.can_view_budget,l.status license_status
      FROM weddings w
      JOIN wedding_members m ON m.wedding_id=w.id
      JOIN licenses l ON l.wedding_id=w.id
      WHERE w.id=${preferred}
        AND m.auth_user_id=${session.user.id}
        AND m.status='active'
        AND w.status='active'
        AND l.status='active'
      LIMIT 1
    `;
    if(rows[0]) return {db,session,wedding:rows[0] as any};
  }

  const rows=await db`
    SELECT w.*,m.role,m.can_view_budget,l.status license_status
    FROM weddings w
    JOIN wedding_members m ON m.wedding_id=w.id
    JOIN licenses l ON l.wedding_id=w.id
    WHERE m.auth_user_id=${session.user.id}
      AND m.status='active'
      AND w.status='active'
      AND l.status='active'
    ORDER BY CASE m.role WHEN 'owner' THEN 0 WHEN 'partner' THEN 1 WHEN 'collaborator' THEN 2 ELSE 3 END,w.created_at DESC
    LIMIT 1
  `;
  if(rows[0]) return {db,session,wedding:rows[0] as any};

  const blocked=await db`
    SELECT w.id,l.status license_status
    FROM weddings w
    JOIN wedding_members m ON m.wedding_id=w.id
    LEFT JOIN licenses l ON l.wedding_id=w.id
    WHERE m.auth_user_id=${session.user.id}
      AND m.status='active'
      AND w.status='active'
    ORDER BY w.created_at DESC
    LIMIT 1
  `;
  if(blocked[0])redirect("/license-status");
  redirect("/onboarding");
}

export function canViewBudget(wedding:any){
  return ["owner","partner"].includes(String(wedding.role))||Boolean(wedding.can_view_budget);
}

export async function requireEditor(){
  const ctx=await requireWorkspace();
  if(!["owner","partner","collaborator"].includes(String(ctx.wedding.role)))throw new Error("Read-only workspace");
  return ctx;
}

export async function requireBudgetAccess(){
  const ctx=await requireEditor();
  if(!canViewBudget(ctx.wedding))throw new Error("Budget access denied");
  return ctx;
}
