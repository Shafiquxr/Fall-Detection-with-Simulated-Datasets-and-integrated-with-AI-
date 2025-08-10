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
      <path d="M12 2.5c-3.04 0-5.5 2.46-5.5 5.5 0 1.29.45 2.47 1.2 3.4-1.29 1.93-2.2 4.49-2.2 7.6h13c0-3.11-.91-5.67-2.2-7.6.75-.93 1.2-2.11 1.2-3.4 0-3.04-2.46-5.5-5.5-5.5z" />
      <path d="M10 16c-2.48 0-4.5 2.02-4.5 4.5h9c0-2.48-2.02-4.5-4.5-4.5z" />
      <path d="M14.5 9.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5z" />
      <path d="M9.5 9.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5z" />
    </svg>
  );
}
