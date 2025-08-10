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
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M12 11.13a3.5 3.5 0 0 0-3.5 3.5c0 2.25 2.5 4.02 3.5 4.87 1-.85 3.5-2.62 3.5-4.87a3.5 3.5 0 0 0-3.5-3.5z" />
    </svg>
  );
}
