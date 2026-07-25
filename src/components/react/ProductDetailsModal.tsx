import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { Icon } from "./Icon";

export interface ProductDetailsData {
  id: string;
  index: string;
  name: string;
  label: string;
  category: string;
  tag: string;
  colorway: string;
  priceLabel: string;
  description: string;
  flatSrc: string;
  modelSrc: string;
  sizes: string[];
  colors: string[];
}

interface ProductDetailsModalProps {
  product: ProductDetailsData | null;
  onClose: () => void;
}

export function ProductDetailsModal({ product, onClose }: ProductDetailsModalProps) {
  const [activeImage, setActiveImage] = useState<"flat" | "model">("flat");
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [closing, setClosing] = useState(false);
  const [visible, setVisible] = useState(false);
  const closingRef = useRef(false);
  const closeTimerRef = useRef<number | null>(null);
  const openFrameRef = useRef<number | null>(null);
  const secondOpenFrameRef = useRef<number | null>(null);

  const requestClose = useCallback(() => {
    if (closingRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onClose();
      return;
    }
    closingRef.current = true;
    setClosing(true);
    setVisible(false);
    if (openFrameRef.current !== null) window.cancelAnimationFrame(openFrameRef.current);
    if (secondOpenFrameRef.current !== null) window.cancelAnimationFrame(secondOpenFrameRef.current);
    closeTimerRef.current = window.setTimeout(onClose, 480);
  }, [onClose]);

  useEffect(() => {
    if (!product) return;
    closingRef.current = false;
    setClosing(false);
    setVisible(false);
    openFrameRef.current = window.requestAnimationFrame(() => {
      secondOpenFrameRef.current = window.requestAnimationFrame(() => setVisible(true));
    });
    setActiveImage("flat");
    setSize("");
    setColor(product.colors[0] ?? "");
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    const previousOverscroll = document.body.style.overscrollBehavior;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";
    window.dispatchEvent(new CustomEvent("product-modal:toggle", { detail: { open: true } }));
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") requestClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
      document.body.style.overscrollBehavior = previousOverscroll;
      window.dispatchEvent(new CustomEvent("product-modal:toggle", { detail: { open: false } }));
      window.removeEventListener("keydown", handleKey);
      if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current);
      if (openFrameRef.current !== null) window.cancelAnimationFrame(openFrameRef.current);
      if (secondOpenFrameRef.current !== null) window.cancelAnimationFrame(secondOpenFrameRef.current);
    };
  }, [product, requestClose]);

  if (!product || typeof document === "undefined") return null;

  return createPortal(
    <div className={`product-modal ${visible ? "is-open" : ""} ${closing ? "is-closing" : ""}`} role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) requestClose();
    }}>
      <section
        className="product-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-modal-title"
      >
        <button
          className="product-modal__close"
          type="button"
          onClick={requestClose}
          aria-label="Cerrar detalle"
          autoFocus
        >
          <Icon name="close" size={19} />
        </button>

        <div className="product-modal__gallery">
          <div className="product-modal__main-image">
            <img
              key={activeImage}
              src={activeImage === "flat" ? product.flatSrc : product.modelSrc}
              alt={activeImage === "flat" ? product.name : `${product.name} puesta por modelo`}
            />
            <span className="product-modal__image-label">
              {activeImage === "flat" ? "Vista de producto" : "Vista editorial"}
            </span>
          </div>
          <div className="product-modal__thumbs" aria-label="Vistas del producto">
            <button
              type="button"
              className={activeImage === "flat" ? "is-active" : ""}
              onClick={() => setActiveImage("flat")}
              aria-label="Ver prenda"
            >
              <img src={product.flatSrc} alt="" />
            </button>
            <button
              type="button"
              className={activeImage === "model" ? "is-active" : ""}
              onClick={() => setActiveImage("model")}
              aria-label="Ver prenda puesta"
            >
              <img src={product.modelSrc} alt="" />
            </button>
          </div>
        </div>

        <div className="product-modal__content">
          <div className="product-modal__eyebrow">
            <span>{product.tag}</span>
            <span>OBJETO {product.index}</span>
          </div>
          <h2 id="product-modal-title">{product.name}</h2>
          <p className="product-modal__label">{product.label} · {product.category}</p>
          <p className="product-modal__price">{product.priceLabel} <small>MXN</small></p>
          <p className="product-modal__description">{product.description}</p>

          <fieldset className="product-modal__options">
            <legend>Color disponible</legend>
            <div className="product-modal__choice-row">
              {product.colors.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={color === item ? "is-selected" : ""}
                  onClick={() => setColor(item)}
                >
                  <i aria-hidden="true" />
                  {item}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="product-modal__options">
            <legend>
              Talla <a href="#guia-tallas">Guía de tallas</a>
            </legend>
            <div className="product-modal__size-row">
              {product.sizes.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={size === item ? "is-selected" : ""}
                  onClick={() => setSize(item)}
                  aria-pressed={size === item}
                >
                  {item}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="product-modal__stock">
            <span />
            En existencia · envío en 2–4 días hábiles
          </div>

          <button className="product-modal__buy" type="button" disabled={!size}>
            <span>{size ? "Añadir a la bolsa" : "Selecciona una talla"}</span>
            <span>{product.priceLabel}</span>
          </button>

          <div className="product-modal__assurances">
            <p><Icon name="truck" size={16} /> Envíos a todo México</p>
            <p><Icon name="shieldCheck" size={16} /> Compra protegida</p>
          </div>
        </div>
      </section>
    </div>,
    document.body,
  );
}
