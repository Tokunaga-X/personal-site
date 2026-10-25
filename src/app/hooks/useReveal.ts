import { useEffect } from "react";

const EASING = "cubic-bezier(0.16, 1, 0.3, 1)";

export function useReveal(language: string) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          observer.unobserve(el);
          if (el.dataset.revealed === "true") return;
          el.dataset.revealed = "true";
          el.animate(
            [
              { opacity: 0.8, transform: "translateY(14px)" },
              { opacity: 1, transform: "translateY(0)" },
            ],
            { duration: 540, easing: EASING, fill: "both" }
          );
        });
      },
      { threshold: 0.08 }
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [language]);
}
