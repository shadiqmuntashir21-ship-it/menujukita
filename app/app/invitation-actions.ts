"use server";
import {revalidatePath} from "next/cache";
import {requireWorkspace} from "@/lib/workspace";
import {recordActivity} from "@/lib/activity";
export async function saveInvitationSettings(form:FormData){
 const {db,wedding,session}=await requireWorkspace();
 const theme=String(form.get("theme")||"sage"),headline=String(form.get("headline")||"").trim().slice(0,180),story=String(form.get("story")||"").trim().slice(0,1000),note=String(form.get("note")||"").trim().slice(0,700);
 const publish=form.get("published")==="yes";
 if(!["sage","ivory","rose"].includes(theme))throw Error("Tema tidak valid");
 if(publish){
  const publicEvents=await db`SELECT id FROM wedding_events WHERE wedding_id=${wedding.id} AND is_public=true AND event_date IS NOT NULL LIMIT 1`;
  if(!publicEvents[0])throw Error("Lengkapi minimal satu acara publik dengan tanggal sebelum membagikan undangan.");
 }
 await db`INSERT INTO wedding_invitation_pages(wedding_id,theme,headline,story,note,published,updated_by)
 VALUES(${wedding.id},${theme},${headline},${story},${note},${publish},${session.user.id})
 ON CONFLICT(wedding_id) DO UPDATE SET theme=EXCLUDED.theme,headline=EXCLUDED.headline,story=EXCLUDED.story,note=EXCLUDED.note,published=EXCLUDED.published,updated_by=EXCLUDED.updated_by,updated_at=now()`;
 await recordActivity(db,wedding.id,session.user.id,"invitation_updated","invitation",String(wedding.id),{published:publish});
 revalidatePath("/app");
}
