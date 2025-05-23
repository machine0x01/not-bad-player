import { SVGProps } from "react";

export function BaselinePlayArrow(props: SVGProps<SVGSVGElement>) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="1em"
        height="1em"
        {...props}
      >
        <path fill="currentColor" d="M8 5v14l11-7z"></path>
      </svg>
    )
  }
  