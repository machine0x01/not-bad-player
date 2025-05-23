import { SVGProps } from "react";

export function BaselinePause(props: SVGProps<SVGSVGElement>) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="1em"
        height="1em"
        {...props}
      >
        <path fill="currentColor" d="M6 19h4V5H6zm8-14v14h4V5z"></path>
      </svg>
    )
  }
  