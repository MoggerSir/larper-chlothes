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

      lineEls.forEach((line) => {
        const beat = line.closest<HTMLElement>("[data-lookbook-beat]");
        if (!beat) return;
        gsap.fromTo(
          line,
          { opacity: 0.22, y: 34, scale: 0.985 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: beat,
              start: "top 78%",
              end: "center 54%",
              scrub: 0.45,
            },
          },
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
          </div>
        ))}
      </div>
    </section>
  );
}
