import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { createRevealAnimation } from "../../lib/animation/factories";
import { EASE } from "../../lib/animation/easings";
import { Icon } from "./Icon";

gsap.registerPlugin(ScrollTrigger);

interface EditorialProps {
  imageSrc: string;
  index: string;
  name: string;
  colorway: string;
  priceLabel: string;
}

export function Editorial({ imageSrc, index, name, colorway, priceLabel }: EditorialProps) {
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const copy = section.querySelectorAll("[data-reveal]");
    const image = section.querySelector<HTMLElement>("[data-editorial-image]");
    const progress = section.querySelector<HTMLElement>("[data-editorial-progress]");
    const anim = createRevealAnimation(section, copy, { y: 32, stagger: 0.1 });

    const media = gsap.matchMedia();
    media.add(
      {
        desktop: "(min-width: 62rem)",
        mobile: "(max-width: 61.999rem)",
        reduce: "(prefers-reduced-motion: reduce)",
      },
      (context) => {
        if (!image || context.conditions?.reduce) return;
        const isDesktop = context.conditions?.desktop;
        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: isDesktop ? "top 78%" : "top 88%",
            end: isDesktop ? "bottom 18%" : "bottom 12%",
            scrub: 1.15,
            invalidateOnRefresh: true,
          },
        });
        timeline.fromTo(
          image,
          {
            yPercent: isDesktop ? 5 : 3,
            scale: isDesktop ? 0.94 : 0.96,
            rotate: -0.65,
          },
          {
            yPercent: isDesktop ? -5 : -3,
            scale: 1,
            rotate: 0,
            ease: EASE.soft,
          },
          0,
        );
        if (progress) {
          timeline.fromTo(
            progress,
            { scaleY: 0, transformOrigin: "top" },
            { scaleY: 1, ease: "none" },
            0,
          );
        }
        return () => {
          timeline.scrollTrigger?.kill();
          timeline.kill();
        };
      },
    );

    return () => {
      media.revert();
      anim.scrollTrigger?.kill();
      anim.kill();
    };
  }, []);

  return (
    <section className="editorial" ref={sectionRef}>
      <div className="editorial__image">
        <div className="editorial__image-glow" aria-hidden="true" />
        <span className="editorial__image-index" aria-hidden="true">{index}</span>
        <span className="editorial__corner editorial__corner--tl" aria-hidden="true" />
        <span className="editorial__corner editorial__corner--br" aria-hidden="true" />
        <img
          src={imageSrc}
          alt={name}
          data-editorial-image
          loading="lazy"
          decoding="async"
        />
        <div className="editorial__scroll-rail" aria-hidden="true">
          <span data-editorial-progress />
        </div>
        <p className="editorial__scroll-label" aria-hidden="true">
          Scroll to inspect
        </p>
      </div>
      <div className="editorial__copy">
        <span className="eyebrow editorial__eyebrow" data-reveal>
          <Icon name="crown" size={13} strokeWidth={1.6} />
          Benefits · featured item {index}
        </span>
        <h2 className="editorial__title" data-reveal>
          {name}
        </h2>
        <p className="editorial__desc" data-reveal>
          This {colorway.toLowerCase()} piece is comfortable and useful in cool
          weather. It gives a quality garment another period of use. The store
          checks every item's condition and presents its history clearly. This
          system helps students buy distinctive clothes at a fair price.
        </p>
        <div className="editorial__row" data-reveal>
          <span className="editorial__price">{priceLabel}</span>
          <a href="#products" className="pill-btn pill-btn--solid">
            View products
            <Icon name="arrowUpRight" size={14} />
          </a>
        </div>
      </div>
    </section>
  );
}
