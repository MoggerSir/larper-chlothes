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
  const [activeImage, setActiveImage] = useState<"flat" | "model">("model");
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [closing, setClosing] = useState(false);
  const [visible, setVisible] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const closingRef = useRef(false);
  const viewerOpenRef = useRef(false);
  const dragRef = useRef({ active: false, x: 0, y: 0 });
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const pinchDistanceRef = useRef(0);
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

  const openViewer = () => {
    viewerOpenRef.current = true;
    setViewerOpen(true);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const closeViewer = () => {
    viewerOpenRef.current = false;
    dragRef.current.active = false;
    pointersRef.current.clear();
    pinchDistanceRef.current = 0;
    setViewerOpen(false);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const changeZoom = (amount: number) => {
    setZoom((current) => {
      const next = Math.min(4, Math.max(1, Number((current + amount).toFixed(2))));
      if (next === 1) setPan({ x: 0, y: 0 });
      return next;
    });
  };

  useEffect(() => {
    if (!product) return;
    closingRef.current = false;
    setClosing(false);
    setVisible(false);
    openFrameRef.current = window.requestAnimationFrame(() => {
      secondOpenFrameRef.current = window.requestAnimationFrame(() => setVisible(true));
    });
    setActiveImage("model");
    viewerOpenRef.current = false;
    setViewerOpen(false);
    setZoom(1);
    setPan({ x: 0, y: 0 });
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
      if (event.key !== "Escape") return;
      if (viewerOpenRef.current) closeViewer();
      else requestClose();
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
          aria-label="Close product details"
          autoFocus
        >
          <Icon name="close" size={19} />
        </button>

        <div className="product-modal__gallery">
          <header className="product-modal__campaign-head" aria-hidden="true">
            <p>SECOND LIFE / ONE OF ONE</p>
            <strong>WORN<br /><i>AGAIN.</i></strong>
          </header>
          <div
            className="product-modal__main-image"
            role="button"
            tabIndex={0}
            aria-label={`Open a detailed view of ${product.name}`}
            onClick={openViewer}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openViewer();
              }
            }}
          >
            <img
              key={activeImage}
              src={activeImage === "flat" ? product.flatSrc : product.modelSrc}
              alt={activeImage === "flat" ? product.name : `${product.name} worn by a model`}
            />
            <span className="product-modal__image-label">
              {activeImage === "flat" ? "Product view" : "Worn view"} · enlarge
            </span>
          </div>
          <div className="product-modal__callouts" aria-hidden="true">
            <div className="product-modal__callout product-modal__callout--top">
              <i />
              <p><strong>{product.category}</strong><span>Selected construction.<br />Ready for another story.</span></p>
            </div>
            <div className="product-modal__callout product-modal__callout--bottom">
              <i />
              <p><strong>{product.colorway}</strong><span>Original character.<br />No two pieces alike.</span></p>
            </div>
          </div>
          <div className="product-modal__thumbs" aria-label="Product views">
            <button
              type="button"
              className={activeImage === "flat" ? "is-active" : ""}
              onClick={() => setActiveImage("flat")}
              aria-label="View the item"
            >
              <img src={product.flatSrc} alt="" />
            </button>
            <button
              type="button"
              className={activeImage === "model" ? "is-active" : ""}
              onClick={() => setActiveImage("model")}
              aria-label="View the item worn"
            >
              <img src={product.modelSrc} alt="" />
            </button>
          </div>
        </div>

        <div className="product-modal__content">
          <div className="product-modal__eyebrow">
            <span>{product.tag}</span>
            <span>ITEM {product.index}</span>
          </div>
          <div className="product-modal__priority">
            <h2 id="product-modal-title">{product.name}</h2>
            <p className="product-modal__label">{product.label} · {product.category}</p>
            <p className="product-modal__price">{product.priceLabel} <small>MXN</small></p>
          </div>

          <aside className="product-modal__why">
            <p>WHY THIS PIECE</p>
            <ul>
              <li><Icon name="shieldCheck" size={17} /><span><strong>Inspected</strong>Quality checked by our team</span></li>
              <li><Icon name="ring" size={17} /><span><strong>One of one</strong>Only this piece is available</span></li>
              <li><Icon name="truck" size={17} /><span><strong>Campus ready</strong>Local and nationwide delivery</span></li>
            </ul>
          </aside>

          <fieldset className="product-modal__options product-modal__options--size">
            <legend>
              Available size <a href="#size-guide">Size guide</a>
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

          <fieldset className="product-modal__options">
            <legend>Available color</legend>
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

          <p className="product-modal__description">{product.description}</p>

          <div className="product-modal__stock">
            <span />
            In stock · ships in 2–4 business days
          </div>

          <button className="product-modal__buy" type="button" disabled={!size}>
            <span>{size ? "Add to bag" : "Select a size"}</span>
            <span>{product.priceLabel}</span>
          </button>

          <p className="product-modal__closing-line">ONE PIECE. ANOTHER CHAPTER.</p>
        </div>
      </section>
      {viewerOpen && (
        <div
          className="product-viewer"
          role="dialog"
          aria-modal="true"
          aria-label={`Detailed image of ${product.name}`}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeViewer();
          }}
        >
          <img
            className="product-viewer__ambient-image"
            src={activeImage === "flat" ? product.flatSrc : product.modelSrc}
            alt=""
            aria-hidden="true"
          />
          <button
            type="button"
            className="product-viewer__mobile-close"
            onClick={closeViewer}
            aria-label="Close detailed image"
          >
            <Icon name="close" size={20} />
          </button>
          <div className="product-viewer__topbar">
            <div>
              <span>{product.name}</span>
              <small>{Math.round(zoom * 100)}%</small>
            </div>
            <div className="product-viewer__controls">
              <button type="button" onClick={() => changeZoom(-0.35)} disabled={zoom <= 1} aria-label="Zoom out">−</button>
              <output aria-live="polite">{Math.round(zoom * 100)}%</output>
              <button type="button" onClick={() => changeZoom(0.35)} disabled={zoom >= 4} aria-label="Zoom in">+</button>
              <button type="button" onClick={() => {
                setZoom(1);
                setPan({ x: 0, y: 0 });
              }}>Reset</button>
              <button type="button" onClick={closeViewer} aria-label="Close detailed image">
                <Icon name="close" size={18} />
              </button>
            </div>
          </div>
          <div
            className={`product-viewer__viewport ${zoom > 1 ? "is-zoomed" : ""}`}
            onWheel={(event) => {
              event.preventDefault();
              changeZoom(event.deltaY < 0 ? 0.25 : -0.25);
            }}
            onDoubleClick={() => {
              if (zoom > 1) {
                setZoom(1);
                setPan({ x: 0, y: 0 });
              } else {
                setZoom(2);
              }
            }}
            onPointerDown={(event) => {
              pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
              event.currentTarget.setPointerCapture(event.pointerId);
              if (pointersRef.current.size === 2) {
                const [first, second] = Array.from(pointersRef.current.values());
                if (!first || !second) return;
                pinchDistanceRef.current = Math.hypot(second.x - first.x, second.y - first.y);
                dragRef.current.active = false;
              } else if (zoom > 1) {
                dragRef.current = { active: true, x: event.clientX, y: event.clientY };
              }
            }}
            onPointerMove={(event) => {
              if (!pointersRef.current.has(event.pointerId)) return;
              pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
              if (pointersRef.current.size >= 2) {
                const [first, second] = Array.from(pointersRef.current.values());
                if (!first || !second) return;
                const distance = Math.hypot(second.x - first.x, second.y - first.y);
                if (pinchDistanceRef.current > 0) {
                  const ratio = distance / pinchDistanceRef.current;
                  setZoom((current) => {
                    const next = Math.min(4, Math.max(1, current * ratio));
                    if (next === 1) setPan({ x: 0, y: 0 });
                    return next;
                  });
                }
                pinchDistanceRef.current = distance;
                return;
              }
              if (!dragRef.current.active || zoom <= 1) return;
              const dx = event.clientX - dragRef.current.x;
              const dy = event.clientY - dragRef.current.y;
              dragRef.current.x = event.clientX;
              dragRef.current.y = event.clientY;
              setPan((current) => ({ x: current.x + dx, y: current.y + dy }));
            }}
            onPointerUp={(event) => {
              pointersRef.current.delete(event.pointerId);
              pinchDistanceRef.current = 0;
              dragRef.current.active = false;
              if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                event.currentTarget.releasePointerCapture(event.pointerId);
              }
            }}
            onPointerCancel={() => {
              pointersRef.current.clear();
              pinchDistanceRef.current = 0;
              dragRef.current.active = false;
            }}
          >
            <img
              src={activeImage === "flat" ? product.flatSrc : product.modelSrc}
              alt={`Detailed view of ${product.name}`}
              draggable={false}
              style={{ transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})` }}
            />
          </div>
          <p className="product-viewer__help">
            Pinch or use the controls to zoom · drag to explore · double tap to switch
          </p>
        </div>
      )}
    </div>,
    document.body,
  );
}
