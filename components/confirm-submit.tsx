"use client";
import type {MouseEvent,ReactNode} from "react";
export default function ConfirmSubmit({children,message,className="text-danger"}:{children:ReactNode;message:string;className?:string}){
  function guard(e:MouseEvent<HTMLButtonElement>){if(!window.confirm(message)){e.preventDefault();e.stopPropagation()}}
  return <button type="submit" className={className} onClick={guard}>{children}</button>;
}
