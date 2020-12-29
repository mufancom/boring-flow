import * as React from 'react';

function SvgCut(props: React.SVGProps<SVGSVGElement>) {
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
        d="M13.179 9.36c-.797-1.39-2.76-1.958-4.292-1.705l2.698-4.737c.122-.253.06-.568-.184-.695-.246-.126-.552-.063-.675.19l-2.76 4.926-2.758-4.926c-.123-.19-.43-.316-.675-.127-.245.127-.306.442-.184.695l2.698 4.737c-1.471-.316-3.495.316-4.23 1.705-.86 1.58.122 3.537 1.593 4.61.123.064.246.127.43.127h.122a.956.956 0 00.49-.379L7.968 9.36l2.514 4.421c.123.19.306.316.49.379h.123c.184 0 .307-.063.43-.126 1.532-1.137 2.513-3.095 1.655-4.674zm-8.462 3.663c-.981-.82-1.655-2.147-1.104-3.158.43-.82 1.595-1.263 2.637-1.263.307 0 .613.063.92.126l-2.453 4.295zm6.5 0L8.825 8.792c1.104-.38 2.944.063 3.557 1.136.49.885-.184 2.211-1.165 3.095z"
        fill="#666"
      />
    </svg>
  );
}

export default SvgCut;
