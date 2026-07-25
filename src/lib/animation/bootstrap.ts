import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { initSmoothScroll } from "./smoothScroll";

function bootstrap() {
  const smoother = initSmoothScroll();
  let sectionJumpActive = false;
  window.addEventListener("product-modal:toggle", ((event: CustomEvent<{ open: boolean }>) => {
    smoother?.paused(event.detail.open);
  }) as EventListener);

  // Keep every hash link inside the landing page. Native anchor jumps do not
  // know about ScrollSmoother's transformed content and can update the URL
  // without moving the visual viewport, so one delegated handler owns all
  // internal navigation (desktop nav, mobile menu, logo and footer).
  document.addEventListener("click", (event) => {
    const origin = event.target;
    if (!(origin instanceof Element)) return;
    const anchor = origin.closest<HTMLAnchorElement>('a[href^="#"]');
    if (!anchor) return;

    const hash = anchor.getAttribute("href");
    if (!hash || hash === "#") {
      event.preventDefault();
      return;
    }

    const target = document.getElementById(decodeURIComponent(hash.slice(1)));
    event.preventDefault();
    if (!target) return;

    window.requestAnimationFrame(() => {
      const lookbook = document.getElementById("nosotros");
      const jumpLayer = document.getElementById("section-jump");
      const currentY = smoother?.scrollTop() ?? window.scrollY;
      const targetY = smoother
        ? smoother.offset(target, target.id === "top" ? "top top" : "top 88px")
        : target.getBoundingClientRect().top + window.scrollY;
      const lookbookTrigger = lookbook
        ? ScrollTrigger.getAll().find((item) => item.trigger === lookbook && Boolean(item.pin))
        : undefined;
      const lookbookStart = lookbookTrigger?.start ??
        (lookbook ? lookbook.getBoundingClientRect().top + currentY : Number.POSITIVE_INFINITY);
      const lookbookEnd = lookbookTrigger?.end ??
        (lookbook ? lookbookStart + lookbook.offsetHeight : Number.POSITIVE_INFINITY);
      const crossesPinnedLookbook =
        target.id !== "nosotros" &&
        ((currentY < lookbookStart - 20 && targetY > lookbookEnd + 20) ||
          (currentY > lookbookEnd + 20 && targetY < lookbookStart - 20));

      const performScroll = (smooth: boolean) => {
        if (smoother) {
          smoother.scrollTo(
            target,
            smooth,
            target.id === "top" ? "top top" : "top 88px",
          );
        } else if (smooth) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          target.scrollIntoView({ behavior: "auto", block: "start" });
        }
      };

      if (
        crossesPinnedLookbook &&
        jumpLayer &&
        !sectionJumpActive &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        sectionJumpActive = true;
        const mark = jumpLayer.querySelector(".section-jump__mark");
        const line = jumpLayer.querySelector(".section-jump__mark i");
        gsap
          .timeline({
            onComplete: () => {
              sectionJumpActive = false;
              gsap.set(jumpLayer, { display: "none" });
            },
          })
          .set(jumpLayer, { display: "grid", opacity: 1, clipPath: "inset(0 0 100% 0)" })
          .set(mark, { opacity: 0, y: 18 })
          .set(line, { scaleX: 0 })
          .to(jumpLayer, {
            clipPath: "inset(0 0 0% 0)",
            duration: 0.48,
            ease: "power3.inOut",
          })
          .to(mark, { opacity: 1, y: 0, duration: 0.32, ease: "power2.out" }, 0.22)
          .to(line, { scaleX: 1, duration: 0.42, ease: "power2.inOut" }, 0.3)
          .call(() => {
            performScroll(false);
            ScrollTrigger.update();
          })
          .to(mark, { opacity: 0, y: -12, duration: 0.24, ease: "power2.in" }, "+=0.12")
          .to(jumpLayer, {
            clipPath: "inset(100% 0 0 0)",
            duration: 0.55,
            ease: "power3.inOut",
          });
      } else if (!sectionJumpActive) {
        performScroll(!crossesPinnedLookbook);
      }

      // The landing remains a single location; section navigation should not
      // look like a route change or leave stale hashes such as #guia-tallas.
      window.history.replaceState(
        window.history.state,
        "",
        `${window.location.pathname}${window.location.search}`,
      );
    });
  });

  document.documentElement.classList.add("is-ready");

  // Images inside astro:assets load lazily; layout shifts as they resolve
  // would otherwise leave ScrollTrigger start/end offsets stale.
  const images = Array.from(document.images).filter((img) => !img.complete);
  if (images.length === 0) return;

  let pending = images.length;
  const onSettle = () => {
    pending -= 1;
    if (pending <= 0) ScrollTrigger.refresh();
  };
  images.forEach((img) => {
    img.addEventListener("load", onSettle, { once: true });
    img.addEventListener("error", onSettle, { once: true });
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootstrap);
} else {
  bootstrap();
}
