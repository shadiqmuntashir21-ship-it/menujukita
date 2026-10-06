import type {HTMLAttributes,ImgHTMLAttributes} from "react";

export function BrandIcon({className="",...props}:HTMLAttributes<HTMLSpanElement>){
  return <span className={`brand-icon ${className}`.trim()} {...props}><img src="/icon-192.png" alt="" aria-hidden="true"/></span>;
}

export function BrandLogo({className="",alt="MenujuKita Wedding Planner",...props}:ImgHTMLAttributes<HTMLImageElement>){
  return <img className={`brand-logo ${className}`.trim()} src="/menujukita-logo.png" alt={alt} {...props}/>;
}
