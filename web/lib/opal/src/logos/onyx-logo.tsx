import type { IconProps } from "@opal/types";

const SvgOnyxLogo = ({ size = 32, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <rect width="100" height="100" rx="14" fill="#000000" />

    <image
      href="/binaLogo.png"
      x="10"
      y="10"
      width="80"
      height="80"
      preserveAspectRatio="xMidYMid meet"
    />
  </svg>
);

export default SvgOnyxLogo;