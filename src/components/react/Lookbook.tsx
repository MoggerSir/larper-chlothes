import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface LookbookProps {
  imageSrc: string;
  lines: string[];
}

export function Lookbook({ imageSrc, lines }: LookbookProps) {
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const lineEls = section.querySelectorAll<HTMLElement>("[data-line]");
    const visual = section.querySelector<HTMLElement>("[data-lookbook-visual]");
    const image = section.querySelector<HTMLImageElement>("[data-lookbook-image]");
    const progress = section.querySelector<HTMLElement>("[data-lookbook-progress]");
    if (!visual) return;

    const headerBar = document.querySelector<HTMLElement>(".site-header__bar");
    const setHeaderDark = (active: boolean) => {
      headerBar?.classList.toggle("is-dark-section", active);
    };

    const context = gsap.context(() => {
      // Only the visual is pinned. The copy remains part of the document, so
      // wheel, trackpad and touch gestures retain their native distance and
      // never get trapped by a snap point.
      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        pin: visual,
        pinSpacing: false,
        pinReparent: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onEnter: () => setHeaderDark(true),
        onEnterBack: () => setHeaderDark(true),
        onLeave: () => setHeaderDark(false),
        onLeaveBack: () => setHeaderDark(false),
      });

      if (image) {
        gsap.fromTo(
          image,
          { scale: 1.07 },
          {
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top bottom",
              end: "bottom top",
              scrub: 1,
            },
          },
        );
      }

      if (progress) {
        gsap.fromTo(
          progress,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: "bottom bottom",
              scrub: 0.25,
            },
          },
        );
      }

      lineEls.forEach((line) => {
        const beat = line.closest<HTMLElement>("[data-lookbook-beat]");
        if (!beat) return;
        const counter = beat.querySelector<HTMLElement>(".lookbook__counter");
        const accent = beat.querySelector<HTMLElement>(".lookbook__accent");
        gsap
          .timeline({
            scrollTrigger: {
              trigger: beat,
              start: "top 80%",
              end: "center 52%",
              scrub: 0.45,
            },
          })
          .fromTo(counter, { opacity: 0, x: -18 }, { opacity: 1, x: 0, ease: "none" }, 0)
          .fromTo(
            line,
            { opacity: 0.16, y: 42, scale: 0.975 },
            { opacity: 1, y: 0, scale: 1, ease: "none" },
            0,
          )
          .fromTo(
            accent,
            { scaleX: 0, opacity: 0 },
            { scaleX: 1, opacity: 1, ease: "none" },
            0.18,
          );
      });
    });

    return () => {
      setHeaderDark(false);
      context.revert();
    };
  }, [lines]);

  return (
    <section className="lookbook" ref={sectionRef} id="nosotros">
      <div className="lookbook__visual" data-lookbook-visual>
        <div className="lookbook__image">
          <img
            src={imageSrc}
            alt="Editorial Larper Chlothes"
            loading="lazy"
            decoding="async"
            data-lookbook-image
          />
        </div>
        <div className="lookbook__overlay" />
        <div className="lookbook__effects" aria-hidden="true">
          <span className="lookbook__orb lookbook__orb--one" />
          <span className="lookbook__orb lookbook__orb--two" />
          <svg className="lookbook__trace" viewBox="0 0 1440 900" preserveAspectRatio="none">
            <path d="M-40 680 L310 520 L515 590 L805 300 L1480 150" />
            <path d="M-40 742 L325 582 L528 650 L828 362 L1480 215" />
          </svg>
          <span className="lookbook__cross lookbook__cross--left" />
          <span className="lookbook__cross lookbook__cross--right" />
        </div>
        <div className="lookbook__rail" aria-hidden="true">
          <span>MANIFIESTO</span>
          <i><b data-lookbook-progress /></i>
          <span>04</span>
        </div>
      </div>
      <div className="lookbook__copy">
        {lines.map((line, i) => (
          <div className="lookbook__beat" data-lookbook-beat key={i}>
            <span className="lookbook__counter" aria-hidden="true">
              {String(i + 1).padStart(2, "0")} / {String(lines.length).padStart(2, "0")}
            </span>
            <p className="lookbook__line" data-line>
              {line}
            </p>
            <span className="lookbook__accent" aria-hidden="true" />
          </div>
        ))}
      </div>
    </section>
  );
}
