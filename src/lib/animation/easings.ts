import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";

gsap.registerPlugin(CustomEase);

let registered = false;

/**
 * Curated organic easing curves, registered once as named GSAP eases.
 *
 * Rationale (why these specific curves, not the defaults):
 * - `organicOut`  — expo-out (0.16,1,0.3,1). Snaps to speed instantly, then
 *   decelerates for a long tail. Matches how physical objects settle, so
 *   content reveals read as "arriving" rather than being mechanically
 *   interpolated. Used for scroll-reveals and the hero entrance.
 * - `organicInOut` — a slightly asymmetric S-curve (0.65,0,0.35,1) rather than
 *   the symmetric power2.inOut default. The eye is more sensitive to the
 *   deceleration half of a motion than the acceleration half, so biasing the
 *   curve toward a softer exit avoids the "robotic" feel of symmetric eases.
 *   Used for pinned/scrubbed section transitions.
 * - `organicOvershoot` — a restrained back-out (0.34,1.56,0.64,1). Small
 *   overshoot reads as tactile/alive without becoming cartoonish — reserved
 *   for micro-interactions (hover, tap) where the user just triggered motion
 *   and expects an immediate, lively response.
 * - `organicSoft` — a gentler expo-out (0.22,1,0.36,1) for large/heavy
 *   elements (full-bleed images, pinned panels) where a hard snap would feel
 *   out of place against their visual weight.
 */
export function registerOrganicEasings() {
  if (registered) return;
  registered = true;

  CustomEase.create("organicOut", "0.16, 1, 0.3, 1");
  CustomEase.create("organicInOut", "0.65, 0, 0.35, 1");
  CustomEase.create("organicOvershoot", "0.34, 1.56, 0.64, 1");
  CustomEase.create("organicSoft", "0.22, 1, 0.36, 1");
}

export const EASE = {
  out: "organicOut",
  inOut: "organicInOut",
  overshoot: "organicOvershoot",
  soft: "organicSoft",
} as const;
