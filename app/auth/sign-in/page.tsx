import SignInForm from "./form";
export default async function Page({searchParams}:{searchParams:Promise<{next?:string}>}){const q=await searchParams;return <SignInForm next={q.next||"/app"}/>}
