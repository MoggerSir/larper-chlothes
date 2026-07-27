import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { EASE, registerOrganicEasings } from "../../lib/animation/easings";
import { Icon } from "./Icon";
import { Logo } from "./Logo";

gsap.registerPlugin(ScrollTrigger);
registerOrganicEasings();

const NAV_LINKS = [
  { label: "Home", href: "#top" },
  { label: "Inventory", href: "#inventory" },
  { label: "Products", href: "#products" },
  { label: "About Us", href: "#nosotros" },
  { label: "Benefits", href: "#benefits" },
  { label: "Contact", href: "#contacto" },
];

export function Header() {
  const barRef = useRef<HTMLDivElement | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    // Keep the navigation visibly glassy at every scroll position while it
    // morphs from a wide top bar into a more compact floating capsule.
    const tween = gsap.fromTo(
      bar,
      {
        "--bar-inset": "0.7rem",
        "--bar-radius": "1.15rem",
        "--bar-bg": "rgba(249,247,241,0.62)",
        "--bar-border": "rgba(255,255,255,0.72)",
        "--bar-shadow": "0 12px 40px rgba(14,14,16,0.08)",
        "--bar-pad-b": "1.15rem",
      } as gsap.TweenVars,
      {
        "--bar-inset": "0.9rem",
        "--bar-radius": "1.3rem",
        "--bar-bg": "rgba(249,247,241,0.78)",
        "--bar-border": "rgba(255,255,255,0.82)",
        "--bar-shadow": "0 18px 50px rgba(14,14,16,0.13)",
        "--bar-pad-b": "0.7rem",
        ease: EASE.inOut,
        scrollTrigger: {
          trigger: document.body,
          start: "top top",
          end: "220 top",
          scrub: 0.5,
        },
      } as gsap.TweenVars,
    );

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = menuOpen ? "hidden" : "";
  }, [menuOpen]);

  return (
    <header className="site-header">
      <div ref={barRef} className="site-header__bar">
        <Logo />

        <nav className="site-header__nav" aria-label="Main navigation">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="site-header__utility">
          <span className="site-header__id eyebrow">campus · id 003.201</span>
          <a href="#products" className="site-header__bag" aria-label="Shopping bag">
            <Icon name="bag" size={18} />
          </a>
          <button
            type="button"
            className="site-header__toggle"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <Icon name={menuOpen ? "close" : "menu"} size={20} />
          </button>
        </div>
      </div>

      <div className={`site-header__mobile ${menuOpen ? "is-open" : ""}`}>
        <nav aria-label="Mobile navigation">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
