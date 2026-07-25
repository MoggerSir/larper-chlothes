import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";

import { registerOrganicEasings } from "./easings";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
registerOrganicEasings();

/**
 * Wraps the page in ScrollSmoother so section-to-section scrolling carries
 * momentum instead of snapping frame-to-scroll-position. `effects: true`
 * activates per-element `data-speed` / `data-lag` parallax so layered
 * elements (headline vs. image vs. backdrop) drift at different organic
 * rates within the same scroll gesture — this is what gives the scroll its
 * "complex, layered" feel rather than a single uniform smoothing pass.
 *
 * Respects prefers-reduced-motion by skipping smoothing entirely.
 */
export function initSmoothScroll(): ScrollSmoother | null {
  if (typeof window === "undefined") return null;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return null;

  document.documentElement.classList.add("has-smooth-scroll");

  return ScrollSmoother.create({
    wrapper: "#smooth-wrapper",
    content: "#smooth-content",
    smooth: 1.4,
    smoothTouch: 0.1,
    effects: true,
    normalizeScroll: true,
  });
}
