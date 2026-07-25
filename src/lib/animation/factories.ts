import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { EASE, registerOrganicEasings } from "./easings";

gsap.registerPlugin(ScrollTrigger);
registerOrganicEasings();

/**
 * Animation factory module.
 *
 * Every exported `create*` function takes DOM references and returns a live
 * GSAP instance (Tween | Timeline | ScrollTrigger), so callers never touch
 * gsap.to/from directly — animation tuning (curves, durations, triggers)
 * stays centralized here instead of scattered across components.
 */

export interface RevealOptions {
  y?: number;
  duration?: number;
  delay?: number;
  stagger?: number;
  start?: string;
  once?: boolean;
}

export function createRevealAnimation(
  trigger: Element,
  targets: gsap.TweenTarget,
  opts: RevealOptions = {},
): gsap.core.Tween {
  const {
    y = 56,
    duration = 1.15,
    delay = 0,
    stagger = 0,
    start = "top 84%",
    once = true,
  } = opts;

  return gsap.from(targets, {
    y,
    opacity: 0,
    duration,
    delay,
    stagger,
    ease: EASE.out,
    scrollTrigger: {
      trigger,
      start,
      toggleActions: once ? "play none none none" : "play none none reverse",
    },
  });
}

export function createStaggerReveal(
  trigger: Element,
  targets: gsap.TweenTarget,
  opts: RevealOptions = {},
): gsap.core.Tween {
  return createRevealAnimation(trigger, targets, { stagger: 0.09, ...opts });
}

/**
 * Character/word split entrance for headline-scale text. Splits are done
 * manually with a wrap span (no SplitText dependency) to keep markup
 * predictable for SEO — the factory just animates whatever line nodes are
 * handed to it.
 */
export function createTextLinesReveal(
  trigger: Element,
  lines: Element[],
  opts: RevealOptions = {},
): gsap.core.Tween {
  const { duration = 1.1, delay = 0, stagger = 0.08, start = "top 85%" } = opts;
  return gsap.from(lines, {
    yPercent: 115,
    opacity: 0,
    duration,
    delay,
    stagger,
    ease: EASE.out,
    scrollTrigger: {
      trigger,
      start,
      toggleActions: "play none none none",
    },
  });
}

export interface ParallaxOptions {
  speed?: number; // -1..1, negative drifts opposite to scroll
  scrub?: number | boolean;
}

export function createParallaxLayer(
  trigger: Element,
  target: gsap.TweenTarget,
  opts: ParallaxOptions = {},
): gsap.core.Tween {
  const { speed = 0.3, scrub = 0.6 } = opts;
  return gsap.to(target, {
    yPercent: speed * 100,
    ease: "none",
    scrollTrigger: {
      trigger,
      start: "top bottom",
      end: "bottom top",
      scrub,
    },
  });
}

export interface PinnedSectionOptions {
  end?: string | (() => string | number);
  scrub?: number | boolean;
  pinSpacing?: boolean;
  onEnter?: () => void;
  onEnterBack?: () => void;
  onLeave?: () => void;
  onLeaveBack?: () => void;
}

export function createPinnedSection(
  trigger: Element,
  opts: PinnedSectionOptions = {},
): ScrollTrigger {
  const { end = "+=120%", scrub = 1, pinSpacing = true } = opts;
  return ScrollTrigger.create({
    trigger,
    start: "top top",
    end,
    pin: true,
    pinSpacing,
    scrub,
    anticipatePin: 1,
  });
}

export function createPinnedTimeline(
  trigger: Element,
  opts: PinnedSectionOptions = {},
): gsap.core.Timeline {
  const {
    end = "+=120%",
    scrub = 1,
    onEnter,
    onEnterBack,
    onLeave,
    onLeaveBack,
  } = opts;
  return gsap.timeline({
    scrollTrigger: {
      trigger,
      start: "top top",
      end,
      pin: true,
      pinReparent: true,
      scrub,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onEnter,
      onEnterBack,
      onLeave,
      onLeaveBack,
    },
    defaults: { ease: EASE.inOut },
  });
}

export interface HoverLiftOptions {
  lift?: number;
  scale?: number;
  duration?: number;
}

export function createHoverLift(el: HTMLElement, opts: HoverLiftOptions = {}) {
  const { lift = 10, scale = 1.015, duration = 0.55 } = opts;
  const enter = () =>
    gsap.to(el, { y: -lift, scale, duration, ease: EASE.overshoot });
  const leave = () =>
    gsap.to(el, { y: 0, scale: 1, duration: duration * 0.8, ease: EASE.out });

  el.addEventListener("pointerenter", enter);
  el.addEventListener("pointerleave", leave);

  return () => {
    el.removeEventListener("pointerenter", enter);
    el.removeEventListener("pointerleave", leave);
  };
}

export interface MarqueeOptions {
  speed?: number; // px per second baseline
  direction?: 1 | -1;
}

/**
 * Infinite ticker whose base speed reacts to scroll velocity — dragging the
 * page down/up organically speeds the marquee up in that direction and it
 * eases back to its resting pace via `organicSoft`, rather than scrolling at
 * a flat, disconnected rate.
 */
export function createMarquee(track: HTMLElement, opts: MarqueeOptions = {}) {
  const { speed = 40, direction = -1 } = opts;
  const width = track.scrollWidth / 2;
  const baseDuration = width / speed;

  const tween = gsap.to(track, {
    x: direction * width,
    duration: baseDuration,
    ease: "none",
    repeat: -1,
  });

  const st = ScrollTrigger.create({
    trigger: track,
    start: "top bottom",
    end: "bottom top",
    onUpdate: (self) => {
      // Speeds up in either scroll direction but never reverses/stalls the
      // tween itself — a negative timeScale would snap the loop backwards.
      const velocity = Math.abs(self.getVelocity()) / 1000;
      const targetScale = gsap.utils.clamp(0.4, 3.5, 1 + velocity);
      gsap.to(tween, {
        timeScale: targetScale,
        duration: 0.8,
        ease: EASE.soft,
        overwrite: true,
      });
    },
  });

  return () => {
    tween.kill();
    st.kill();
  };
}

export function refresh() {
  ScrollTrigger.refresh();
}
