import * as React from 'react';

function SvgCheckSolid(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8 16A8 8 0 108 0a8 8 0 000 16zm-1.333-4.873a.65.65 0 00.92 0l5.27-5.27a.65.65 0 10-.92-.92l-4.81 4.811-2.343-2.342a.65.65 0 00-.92.919l2.803 2.802z"
        fill="#81CB5F"
      />
    </svg>
  );
}

export default SvgCheckSolid;
