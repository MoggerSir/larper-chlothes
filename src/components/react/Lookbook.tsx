import { useEffect, useRef } from "react";

import { EASE, registerOrganicEasings } from "../../lib/animation/easings";
import { createPinnedTimeline } from "../../lib/animation/factories";

registerOrganicEasings();

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
    const image = section.querySelector<HTMLElement>("[data-lookbook-image]");

    // Drive the navbar theme from this exact pinned ScrollTrigger. Using a
    // second position-based trigger ends too early because the visible
    // section is only 100vh while its pinned journey spans several viewports.
    const headerBar = document.querySelector<HTMLElement>(".site-header__bar");
    const setHeaderDark = (active: boolean) => {
      headerBar?.classList.toggle("is-dark-section", active);
    };

    const tl = createPinnedTimeline(section, {
      // Give every phrase almost a full viewport of travel, then settle the
      // scroll on the nearest text beat. Disabling inertia prevents a fast
      // wheel/touch gesture from casually skipping several messages.
      end: () => `+=${Math.round(window.innerHeight * lineEls.length * 0.92)}`,
      scrub: 0.85,
      snap: {
        snapTo: "labelsDirectional",
        duration: { min: 0.28, max: 0.68 },
        delay: 0.06,
        ease: "power2.inOut",
        inertia: false,
      },
      onEnter: () => setHeaderDark(true),
      onEnterBack: () => setHeaderDark(true),
      onLeave: () => setHeaderDark(false),
      onLeaveBack: () => setHeaderDark(false),
    });

    if (image) {
      tl.fromTo(image, { scale: 1.12 }, { scale: 1, ease: EASE.soft, duration: 1 }, 0);
    }

    lineEls.forEach((line, i) => {
      tl.addLabel(`message-${i + 1}`, i);
      const at = i;
      tl.to(line, { opacity: 1, y: 0, duration: 0.5 }, at)
        .to(line, { opacity: i === lineEls.length - 1 ? 1 : 0, y: -18, duration: 0.5 }, at + 0.7);
    });

    return () => {
      setHeaderDark(false);
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, [lines]);

  return (
    <section className="lookbook" ref={sectionRef} id="nosotros">
      <div className="lookbook__image" data-lookbook-image>
        <img src={imageSrc} alt="Editorial Larper Chlothes" />
      </div>
      <div className="lookbook__overlay" />
      <div className="lookbook__copy">
        {lines.map((line, i) => (
          <p className="lookbook__line" data-line key={i}>
            {line}
          </p>
        ))}
      </div>
    </section>
  );
}
