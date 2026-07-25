import { useCallback, useEffect, useRef, useState } from "react";

import { createStaggerReveal } from "../../lib/animation/factories";
import { ProductCard, type ProductCardData } from "./ProductCard";
import { ProductDetailsModal } from "./ProductDetailsModal";

interface ProductGridProps {
  products: ProductCardData[];
}

export function ProductGrid({ products }: ProductGridProps) {
  const gridRef = useRef<HTMLDivElement | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductCardData | null>(null);
  const closeModal = useCallback(() => setSelectedProduct(null), []);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const cards = grid.querySelectorAll("[data-reveal]");
    const anim = createStaggerReveal(grid, cards, { y: 40, stagger: 0.1 });
    return () => {
      anim.scrollTrigger?.kill();
      anim.kill();
    };
  }, [products]);

  return (
    <>
      <div className="product-grid" ref={gridRef}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} onOpen={setSelectedProduct} />
        ))}
      </div>
      <ProductDetailsModal product={selectedProduct} onClose={closeModal} />
    </>
  );
}
