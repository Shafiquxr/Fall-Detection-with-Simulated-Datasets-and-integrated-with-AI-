import type { SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M4 14.88V7.12a2 2 0 0 1 2.43-1.85l6.32 1.26a2 2 0 0 1 1.57 1.85v7.76a2 2 0 0 1-2.43 1.85l-6.32-1.26a2 2 0 0 1-1.57-1.85Z" />
      <path d="m4 9 16-3" />
      <path d="m20 15-16 3" />
    </svg>
  );
}
