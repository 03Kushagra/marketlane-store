import { Link, useLocation } from "react-router-dom";
import { RatingStars } from "../rating-stars/rating-stars";
import type { Product } from "../../types/product-types";
import { currencyFormatter } from "../../utils/formatters";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const location = useLocation();
  const from = `${location.pathname}${location.search}`;

  return (
    <Link
      className="product-card"
      to={`/product/${product.id}`}
      state={{ from }}
      aria-label={`View details for ${product.title}`}
    >
      <div className="product-card__image-wrap">
        <img src={product.thumbnail} alt={product.title} loading="lazy" />
      </div>
      <div className="product-card__body">
        <h2>{product.title}</h2>
        <div className="product-card__meta">
          <span>{currencyFormatter.format(product.price)}</span>
          <RatingStars rating={product.rating} />
        </div>
      </div>
    </Link>
  );
}
