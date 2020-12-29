import * as React from 'react';

function SvgCondition(props: React.SVGProps<SVGSVGElement>) {
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
        opacity={0.01}
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 16h16V0H0v16z"
        fill="#CCC"
      />
      <mask
        id="condition_svg__a"
        maskUnits="userSpaceOnUse"
        x={0}
        y={0}
        width={16}
        height={16}
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M0 16h16V0H0v16z"
          fill="#fff"
        />
      </mask>
      <g mask="url(#condition_svg__a)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M7.043 3.491a.615.615 0 01-.734.467c-.258-.055-1.019-.117-1.4.25-.26.248-.252.346-.222.708.028.344.066.813-.19 1.412-.258.591-.623.893-.89 1.115l-.003.001c-.286.237-.373.309-.373.661 0 .35.086.42.37.655l.003.003c.269.222.635.524.892 1.116.257.601.22 1.071.19 1.414-.029.363-.037.46.222.71.382.366 1.142.304 1.403.248a.617.617 0 01.265 1.202 3.548 3.548 0 01-.729.073c-.533 0-1.25-.116-1.792-.636-.68-.653-.63-1.255-.595-1.695v-.002c.024-.285.042-.509-.094-.826-.138-.319-.318-.467-.544-.654l-.003-.002C2.473 9.424 2 9.035 2 8.104c0-.932.474-1.324.82-1.61h.002c.227-.188.407-.337.545-.656.135-.314.117-.538.093-.822v-.002c-.036-.44-.084-1.042.595-1.695.923-.886 2.361-.599 2.521-.563.332.073.54.402.467.734zm6.13 3.002l.002.001c.348.287.825.679.825 1.61 0 .932-.475 1.322-.822 1.606l-.001.002c-.23.187-.41.335-.55.658-.135.315-.117.539-.094.824.036.44.086 1.042-.595 1.696-.541.52-1.258.636-1.792.636-.377 0-.662-.058-.728-.072a.616.616 0 01.266-1.203c.259.056 1.018.119 1.401-.248.26-.249.251-.347.222-.71-.029-.343-.067-.812.19-1.41.258-.598.629-.902.899-1.123v-.001l.003-.002c.292-.239.37-.304.37-.652 0-.35-.087-.422-.374-.658l-.001-.001c-.27-.221-.638-.524-.896-1.114-.255-.596-.217-1.075-.188-1.424.03-.383.038-.475-.228-.705-.377-.327-1.174-.277-1.423-.234a.616.616 0 01-.218-1.21c.157-.028 1.557-.257 2.447.514.737.638.686 1.271.648 1.733-.023.294-.042.526.092.837.137.314.317.462.545.65z"
          fill="#999"
        />
      </g>
    </svg>
  );
}

export default SvgCondition;
