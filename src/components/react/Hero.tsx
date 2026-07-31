import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";

import { EASE, registerOrganicEasings } from "../../lib/animation/easings";
import { Icon } from "./Icon";
import { ProductDetailsModal, type ProductDetailsData } from "./ProductDetailsModal";

// three.js + @react-three/fiber + drei are the single heaviest chunk on the
// site (~240KB gzipped). Loading it lazily lets the hero paint immediately
// with a flat product photo, then upgrade to the interactive 3D viewer once
// that chunk arrives instead of blocking first paint on it.
const HeroScene = lazy(() =>
  import("./HeroScene").then((mod) => ({ default: mod.HeroScene })),
);

registerOrganicEasings();

export interface HeroSlide {
  id: string;
  index: string;
  name: string;
  colorway: string;
  priceLabel: string;
  tag: string;
  description: string;
  model3dSrc: string;
  cardSrc: string;
  modelImageSrc: string;
  label: string;
  category: string;
  sizes: string[];
  colors: string[];
}

export function Hero({ slides }: { slides: HeroSlide[] }) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const modelStageRef = useRef<HTMLDivElement | null>(null);
  const ethosRef = useRef<HTMLDivElement | null>(null);
  const cardRef = useRef<HTMLElement | null>(null);
  const transitionRef = useRef<gsap.core.Timeline | null>(null);
  const transitionDirectionRef = useRef(1);
  const hasChangedRef = useRef(false);
  const [index, setIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [interactionNonce, setInteractionNonce] = useState(0);
  const slide = slides[index];
  const modelSources = useMemo(() => slides.map((item) => item.model3dSrc), [slides]);
  const closeDetails = useCallback(() => setDetailsOpen(false), []);
  const detailsProduct: ProductDetailsData = {
    id: slide.id,
    index: slide.index,
    name: slide.name,
    label: slide.label,
    category: slide.category,
    tag: slide.tag,
    colorway: slide.colorway,
    priceLabel: slide.priceLabel,
    description: slide.description,
    flatSrc: slide.cardSrc,
    modelSrc: slide.modelImageSrc,
    sizes: slide.sizes,
    colors: slide.colors,
  };

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!hasChangedRef.current || reducedMotion) {
      hasChangedRef.current = true;
      return;
    }
    const ethos = ethosRef.current;
    const card = cardRef.current;
    if (!ethos || !card) return;
    const direction = transitionDirectionRef.current;
    const context = gsap.context(() => {
      gsap.set([ethos, card], { opacity: 1, filter: "blur(0px)" });
      gsap.set(card, { clearProps: "transform,translate" });
      gsap
        .timeline({ defaults: { ease: EASE.out } })
        .fromTo(
          ethos,
          { opacity: 0, x: direction * -26, y: 12, filter: "blur(4px)" },
          { opacity: 1, x: 0, y: 0, filter: "blur(0px)", duration: 0.72, force3D: true },
          0,
        )
        .fromTo(
          ethos.children,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.55, stagger: 0.055 },
          0.15,
        )
        .fromTo(
          card,
          { opacity: 0, filter: "blur(5px)" },
          { opacity: 1, filter: "blur(0px)", duration: 0.7 },
          0.06,
        )
        .fromTo(
          card.querySelector(".hero__card-image"),
          { scale: 1.06 },
          { scale: 1, duration: 0.9, ease: EASE.soft },
          0.08,
        )
        .fromTo(
          card.querySelectorAll(".hero__card-row, .hero__card-info, .hero__card-cta"),
          { opacity: 0, x: direction * 16, y: 8 },
          { opacity: 1, x: 0, y: 0, duration: 0.55, stagger: 0.07, force3D: true },
          0.24,
        );
    }, rootRef);
    return () => context.revert();
  }, [index, reducedMotion]);

  useEffect(() => {
    if (!rootRef.current) return;
    const root = rootRef.current;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const context = gsap.context(() => {
      const words = gsap.utils.toArray<HTMLElement>("[data-hero-word]");
      const content = gsap.utils.toArray<HTMLElement>("[data-hero-fade]");
      const intro = root.querySelector<HTMLElement>("[data-hero-intro]");

      if (prefersReducedMotion) {
        gsap.set([words, content], { clearProps: "all", autoAlpha: 1 });
        gsap.set(intro, { autoAlpha: 0 });
        root.classList.remove("hero--entering");
        return;
      }

      // Opacity + transforms stay on the compositor. Animating CSS filters on
      // these enormous glyphs forced a costly full repaint on every frame.
      gsap.set(words, { autoAlpha: 0, yPercent: 112, rotateX: -8 });
      gsap.set(content, { autoAlpha: 0, y: 30 });

      const timeline = gsap.timeline({
        delay: 0.12,
        onComplete: () => {
          root.classList.remove("hero--entering");
          gsap.set([words, content], { clearProps: "visibility" });
        },
      });

      // Act I — let the visual pulse complete before any typography appears.
      timeline
        .fromTo(
          intro,
          { autoAlpha: 0, scale: 1.08 },
          { autoAlpha: 1, scale: 1, duration: 0.42, ease: "sine.out" },
          0,
        )
        .fromTo(
          "[data-hero-intro-ring]",
          { scale: 0.18, opacity: 0, rotate: -14 },
          {
            scale: 1,
            opacity: 0.72,
            rotate: 0,
            duration: 1.08,
            stagger: 0.13,
            ease: "sine.out",
          },
          0.06,
        )
        .to(
          "[data-hero-intro-line]",
          { scaleX: 1, duration: 0.78, ease: "power3.inOut" },
          0.2,
        )
        .to(intro, { autoAlpha: 0, scale: 1.035, duration: 0.62, ease: "sine.inOut" }, 1.18)
        // Act II — the name gets its own uninterrupted beat.
        .to(
          words,
          {
            autoAlpha: 1,
            yPercent: 0,
            rotateX: 0,
            duration: 0.82,
            stagger: 0.08,
            ease: "power3.out",
            force3D: true,
          },
          1.68,
        )
        .to(
          words,
          {
            yPercent: -2.4,
            scale: 1.008,
            duration: 0.12,
            stagger: 0.035,
            ease: "power2.out",
          },
          2.58,
        )
        .to(
          words,
          {
            yPercent: 0,
            scale: 1,
            duration: 0.3,
            stagger: 0.035,
            ease: "back.out(2.2)",
          },
          2.7,
        );

      // Act III — information and product card enter only after the title.
      timeline.to(
        content,
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.78,
          stagger: 0.08,
          ease: "power3.out",
          force3D: true,
        },
        3.15,
      )
        .to(
          content,
          {
            y: -5,
            scale: 1.008,
            duration: 0.12,
            stagger: 0.035,
            ease: "power2.out",
          },
          4.18,
        )
        .to(
          content,
          {
            y: 0,
            scale: 1,
            duration: 0.32,
            stagger: 0.035,
            ease: "back.out(2)",
          },
          4.3,
        )
        .to({}, { duration: 0.01 }, 6.7);
    }, rootRef);
    return () => context.revert();
  }, []);

  const goTo = (next: number) => {
    const target = (next + slides.length) % slides.length;
    if (target === index || transitionRef.current) return;

    const stage = modelStageRef.current;
    if (!stage || reducedMotion) {
      setIndex(target);
      return;
    }

    const direction = target > index || (index === slides.length - 1 && target === 0) ? 1 : -1;
    transitionDirectionRef.current = direction;
    const timeline = gsap.timeline({
      onComplete: () => {
        transitionRef.current = null;
      },
    });
    transitionRef.current = timeline;
    timeline
      .to(stage, {
        opacity: 0,
        xPercent: direction * -12,
        scale: 0.88,
        rotate: direction * -2,
        filter: "blur(5px)",
        duration: 0.52,
        ease: EASE.inOut,
        force3D: true,
        onComplete: () => setIndex(target),
      })
      .to(
        ethosRef.current,
        {
          opacity: 0,
          x: direction * -18,
          y: -8,
          filter: "blur(4px)",
          duration: 0.4,
          ease: EASE.inOut,
          force3D: true,
        },
        0,
      )
      .to(
        cardRef.current,
        {
          opacity: 0,
          filter: "blur(5px)",
          duration: 0.38,
          ease: EASE.inOut,
        },
        0.03,
      )
      .set(stage, {
        xPercent: direction * 13,
        scale: 1.08,
        rotate: direction * 2,
      })
      .to(stage, {
        opacity: 1,
        xPercent: 0,
        scale: 1,
        rotate: 0,
        filter: "blur(0px)",
        duration: 0.82,
        ease: EASE.out,
        force3D: true,
      });
  };

  useEffect(() => {
    if (detailsOpen || reducedMotion || slides.length < 2) return;

    const advance = () => {
      if (document.hidden) return;
      goTo(index + 1);
    };
    const timer = window.setTimeout(advance, 12_000);
    const handleVisibility = () => {
      // If the timer elapsed in a background tab, begin a fresh 12-second
      // period when the user returns instead of changing immediately.
      if (!document.hidden) setInteractionNonce((value) => value + 1);
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [index, detailsOpen, interactionNonce, reducedMotion, slides.length]);

  return (
    <section
      className="hero hero--entering"
      id="top"
      ref={rootRef}
    >
      <div className="hero__intro-fx" data-hero-intro aria-hidden="true">
        <span className="hero__intro-ring hero__intro-ring--outer" data-hero-intro-ring />
        <span className="hero__intro-ring hero__intro-ring--inner" data-hero-intro-ring />
        <i className="hero__intro-line" data-hero-intro-line />
      </div>
      <div className="hero__type" aria-hidden="true">
        <span className="hero__word" data-hero-word>LARPER</span>
        <span className="hero__word" data-hero-word>CLOTHES</span>
      </div>
      <h1 className="visually-hidden">
        Welcome to my store! Larper's campus closet sells second-hand clothes.
      </h1>

      <div className="hero__model">
        <div className="hero__model-stage" ref={modelStageRef}>
          <Suspense
            fallback={
              <img
                className="hero__model-placeholder"
                src={slide.modelImageSrc}
                alt={slide.name}
                decoding="async"
              />
            }
          >
            <HeroScene
              modelSrc={slide.model3dSrc}
              preloadSources={modelSources}
              reducedMotion={reducedMotion}
              paused={detailsOpen}
              entranceDelay={4.82}
              onOpenDetails={() => setDetailsOpen(true)}
              onUserInteraction={() => setInteractionNonce((value) => value + 1)}
            />
          </Suspense>
        </div>
        <div className="hero__mobile-stage-meta" aria-hidden="true">
          <span>LOOK {slide.index}</span>
          <span>{slide.tag}</span>
        </div>
        <div className="hero__mobile-carousel" role="tablist" aria-label="Featured clothes" data-hero-fade>
          <button className="hero__nav-btn" type="button" onClick={() => goTo(index - 1)} aria-label="Previous item">
            <Icon name="arrowLeft" size={16} />
          </button>
          <div className="hero__dots">
            {slides.map((item, itemIndex) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={itemIndex === index}
                aria-label={item.name}
                className={`hero__dot ${itemIndex === index ? "is-active" : ""}`}
                onClick={() => goTo(itemIndex)}
              />
            ))}
          </div>
          <button className="hero__nav-btn" type="button" onClick={() => goTo(index + 1)} aria-label="Next item">
            <Icon name="arrowRight" size={16} />
          </button>
        </div>
        <button
          key={slide.id}
          type="button"
          className="hero__mobile-summary"
          data-hero-fade
          onClick={() => setDetailsOpen(true)}
          aria-label={`View details for ${slide.name}`}
        >
          <span className="hero__mobile-thumb">
            <img src={slide.cardSrc} alt="" />
          </span>
          <span className="hero__mobile-product">
            <small>{slide.label}</small>
            <strong>{slide.name}</strong>
            <span>{slide.priceLabel} MXN</span>
          </span>
          <span className="hero__mobile-open">
            <Icon name="arrowUpRight" size={16} />
          </span>
        </button>
      </div>

      <div className="hero__ethos" data-hero-fade ref={ethosRef}>
        <span className="hero__ethos-icon"><Icon name="ring" size={22} strokeWidth={1.3} /></span>
        <p className="hero__ethos-title">Welcome to my store!<br />Larper's campus closet.</p>
        <p className="hero__ethos-copy">{slide.description.split(".")[0]}.</p>
      </div>

      <article className="hero__card" data-hero-fade ref={cardRef}>
        <div className="hero__card-image">
          <img src={slide.cardSrc} alt={slide.name} />
          <span className="hero__card-index">{slide.index}</span>
        </div>
        <div className="hero__card-row">
          <span className="eyebrow">{slide.tag}</span>
          <span className="hero__card-color">{slide.colorway}</span>
        </div>
        <div className="hero__card-info">
          <p className="hero__card-name">{slide.name}</p>
          <p className="hero__card-price">{slide.priceLabel} MXN</p>
        </div>
        <button
          type="button"
          className="pill-btn pill-btn--solid hero__card-cta"
          onClick={() => setDetailsOpen(true)}
        >
          View item <Icon name="arrowUpRight" size={14} />
        </button>
      </article>

      <div className="hero__carousel" data-hero-fade>
        <button className="hero__nav-btn" type="button" onClick={() => goTo(index - 1)} aria-label="Previous item">
          <Icon name="arrowLeft" size={16} />
        </button>
        <div className="hero__dots" role="tablist" aria-label="Featured clothes">
          {slides.map((item, itemIndex) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={itemIndex === index}
              aria-label={item.name}
              className={`hero__dot ${itemIndex === index ? "is-active" : ""}`}
              onClick={() => goTo(itemIndex)}
            />
          ))}
        </div>
        <button className="hero__nav-btn" type="button" onClick={() => goTo(index + 1)} aria-label="Next item">
          <Icon name="arrowRight" size={16} />
        </button>
      </div>
      <ProductDetailsModal product={detailsOpen ? detailsProduct : null} onClose={closeDetails} />
    </section>
  );
}
