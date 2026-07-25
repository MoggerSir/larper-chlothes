import { useEffect, useRef } from "react";

import { createMarquee } from "../../lib/animation/factories";

export interface ProductStripItem {
  id: string;
  index: string;
  name: string;
  priceLabel: string;
  flatSrc: string;
}

interface ProductStripProps {
  items: ProductStripItem[];
  speed?: number;
}

/**
 * Continuous filmstrip of the full catalog — the same infinite-scroll,
 * velocity-reactive factory used elsewhere (createMarquee), just fed
 * garment thumbnails instead of text, so every piece in the collection is
 * visible at a glance before the shop grid.
 */
export function ProductStrip({ items, speed = 55 }: ProductStripProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!trackRef.current) return;
    const cleanup = createMarquee(trackRef.current, { speed });
    return cleanup;
  }, [speed]);

  const loop = [...items, ...items];

  return (
    <div className="product-strip">
      <div className="product-strip__track" ref={trackRef}>
        {loop.map((item, i) => (
          <a className="product-strip__item" href="#tienda" key={`${item.id}-${i}`}>
            <span className="product-strip__thumb">
              <span className="product-strip__index eyebrow">{item.index}</span>
              <img src={item.flatSrc} alt={item.name} loading="lazy" />
            </span>
            <span className="product-strip__caption">
              <span className="product-strip__name">{item.name}</span>
              <span className="product-strip__price">{item.priceLabel}</span>
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
