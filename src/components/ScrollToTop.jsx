import { useEffect, useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { hash, pathname, search } = useLocation();

  useEffect(() => {
    if (!("scrollRestoration" in window.history)) {
      return undefined;
    }

    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";

    return () => {
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, []);

  useLayoutEffect(() => {
    if (hash) {
      const frame = window.requestAnimationFrame(() => {
        const target = document.getElementById(hash.slice(1));
        if (target) {
          target.scrollIntoView();
          return;
        }

        window.scrollTo({ left: 0, top: 0, behavior: "auto" });
      });

      return () => window.cancelAnimationFrame(frame);
    }

    window.scrollTo({ left: 0, top: 0, behavior: "auto" });

    return undefined;
  }, [hash, pathname, search]);

  return null;
}
