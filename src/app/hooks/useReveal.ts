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

    const stack = document.getElementById("stack");
    const stackItems = stack
      ? Array.from(stack.querySelectorAll<HTMLElement>(".stack-list li"))
      : [];
    let stackObserver: IntersectionObserver | null = null;
    if (stack && stackItems.length) {
      stackObserver = new IntersectionObserver(
        (entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) return;
          stackObserver?.disconnect();
          stackItems.forEach((el, index) => {
            el.animate(
              [
                { opacity: 0.8, transform: "translateY(10px)" },
                { opacity: 1, transform: "translateY(0)" },
              ],
              { duration: 540, easing: EASING, delay: index * 60, fill: "both" }
            );
          });
        },
        { threshold: 0.08 }
      );
      stackObserver.observe(stack);
    }

    return () => {
      observer.disconnect();
      stackObserver?.disconnect();
    };
  }, [language]);
}
