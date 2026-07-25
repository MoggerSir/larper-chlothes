import { useState } from "react";

import { Icon, type IconName } from "./Icon";
import type { ProductDetailsData } from "./ProductDetailsModal";

export interface ProductCardData extends ProductDetailsData {}

interface ProductCardProps {
  product: ProductCardData;
  onOpen: (product: ProductCardData) => void;
}

const TAG_ICON: Record<string, IconName> = {
  NUEVO: "sparks",
  LIMITADA: "crown",
  "MAS VENDIDA": "medal",
  RESTOCK: "package",
};

/**
 * Presentational unit produced by ProductGrid's render loop — kept dumb on
 * purpose (no data fetching, no animation wiring) so the grid factory stays
 * the single place that decides how cards enter/behave.
 */
export function ProductCard({ product, onOpen }: ProductCardProps) {
  const [saved, setSaved] = useState(false);
  const tagIcon = TAG_ICON[product.tag] ?? "sparks";

  return (
    <article
      className="product-card"
      data-reveal
      role="button"
      tabIndex={0}
      aria-label={`Ver detalles de ${product.name}`}
      onClick={() => onOpen(product)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen(product);
        }
      }}
    >
      <div className="product-card__frame">
        <div className="product-card__badges">
          <span className="product-card__index eyebrow">{product.index}</span>
          <span className="product-card__tag">
            <Icon name={tagIcon} size={11} strokeWidth={1.8} />
            {product.tag}
          </span>
        </div>

        <button
          type="button"
          className={`product-card__save ${saved ? "is-saved" : ""}`}
          aria-pressed={saved}
          aria-label={saved ? `Quitar ${product.name} de guardados` : `Guardar ${product.name}`}
          onClick={(event) => {
            event.stopPropagation();
            setSaved((v) => !v);
          }}
        >
          <Icon name="heart" size={14} strokeWidth={saved ? 0 : 1.6} className={saved ? "is-filled" : ""} />
        </button>

        <div className="product-card__media">
          <img className="product-card__img product-card__img--flat" src={product.flatSrc} alt={product.name} loading="lazy" />
          <img
            className="product-card__img product-card__img--model"
            src={product.modelSrc}
            alt={`${product.name} puesta por modelo`}
            loading="lazy"
          />
        </div>

        <button type="button" className="product-card__add" aria-label={`Ver detalles de ${product.name}`}>
          <Icon name="plus" size={16} />
        </button>
      </div>

      <div className="product-card__meta">
        <div>
          <p className="product-card__name">{product.name}</p>
          <p className="product-card__label">
            {product.label} · {product.colorway}
          </p>
        </div>
        <p className="product-card__price">{product.priceLabel}</p>
      </div>
    </article>
  );
}
