export default function BrandLogo() {
  return (
    <a href="#home" className="brand-logo" aria-label="Tokunaga-X home">
      <svg
        className="brand-logo-svg"
        viewBox="0 0 300 56"
        role="img"
        aria-labelledby="brandLogoTitle"
      >
        <title id="brandLogoTitle">Tokunaga-X</title>
        <defs>
          <linearGradient id="brandGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0ea5e9" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>

        <rect
          x="3"
          y="9"
          width="36"
          height="36"
          rx="10"
          className="brand-logo-badge"
        />
        <path
          d="M11 20h20M21 20v14M27 23l8 8M35 23l-8 8"
          className="brand-logo-mark"
        />
        <text x="51" y="34" className="brand-logo-wordmark">
          Tokunaga-X
        </text>
      </svg>
    </a>
  );
}
