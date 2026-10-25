type BrandLogoProps = {
  label: string;
};

export default function BrandLogo({ label }: BrandLogoProps) {
  return (
    <a href="#hero" className="wordmark" aria-label={label}>
      Yuchao
    </a>
  );
}
