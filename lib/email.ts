export const ADMIN_EMAIL=process.env.ADMIN_EMAIL||"temandigital26@gmail.com";
export const EMAIL_FROM=process.env.EMAIL_FROM||"Teman Digital <transaksi@dailyn.my.id>";
export const APP_URL=process.env.APP_URL||"https://menujukita-da4n.vercel.app";

type MailInput={to:string|string[];subject:string;text:string;html:string;idempotencyKey?:string};

export async function sendMail(input:MailInput){
  const key=process.env.RESEND_API_KEY;
  if(!key)throw new Error("RESEND_API_KEY belum dikonfigurasi");
  const res=await fetch("https://api.resend.com/emails",{
    method:"POST",
    headers:{
      "authorization":`Bearer ${key}`,
      "content-type":"application/json",
      ...(input.idempotencyKey?{"Idempotency-Key":input.idempotencyKey}:{})
    },
    body:JSON.stringify({
      from:EMAIL_FROM,
      to:Array.isArray(input.to)?input.to:[input.to],
      reply_to:[ADMIN_EMAIL],
      subject:input.subject,
      text:input.text,
      html:input.html
    }),
    cache:"no-store"
  });
  const data=await res.json().catch(()=>({})) as any;
  if(!res.ok)throw new Error(data?.message||data?.error||`Email gagal dikirim (${res.status})`);
  return String(data?.id||"");
}

export function mailShell(title:string,body:string,button?:{label:string;url:string}){
 return `<!doctype html><html><body style="margin:0;background:#f5f0e9;font-family:Arial,sans-serif;color:#292d2a"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:32px 12px"><tr><td align="center"><table role="presentation" width="620" cellspacing="0" cellpadding="0" style="max-width:620px;background:#fff;border-radius:24px;overflow:hidden"><tr><td style="padding:34px 36px;background:#33473e;color:#fff"><div style="font-size:12px;letter-spacing:.14em">MENUJUKITA · TEMAN DIGITAL</div><h1 style="margin:10px 0 0;font-family:Georgia,serif;font-weight:500;font-size:32px">${title}</h1></td></tr><tr><td style="padding:34px 36px;line-height:1.65;font-size:14px">${body}${button?`<p style="margin:28px 0 0"><a href="${button.url}" style="display:inline-block;background:#33473e;color:#fff;text-decoration:none;padding:13px 20px;border-radius:999px;font-weight:700">${button.label}</a></p>`:""}<p style="margin:34px 0 0;color:#777;font-size:12px">Teman Digital<br><b>Bangun Lebih Baik. Tumbuh Lebih Cepat.</b></p></td></tr></table></td></tr></table></body></html>`;
}
