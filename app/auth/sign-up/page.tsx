import SignUpForm from "./form";
export default async function Page({searchParams}:{searchParams:Promise<{next?:string}>}){const q=await searchParams;return <SignUpForm next={q.next||"/onboarding"}/>}
