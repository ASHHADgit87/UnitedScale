interface BrandLogoProps {
  className?: string;
}

export function BrandLogo({
  className = "h-20 w-auto object-contain",
}: BrandLogoProps) {
  return (
    <>
      <img
        src="/logo-light.png"
        alt="United Scale"
        className={`${className} dark:hidden`}
      />
      <img
        src="/logo-dark.png"
        alt="United Scale"
        className={`${className} hidden dark:block`}
      />
    </>
  );
}
