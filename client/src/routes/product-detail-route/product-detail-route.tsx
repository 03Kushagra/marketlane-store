import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getProductById, getProducts } from "../../api/products-api";
import { RatingStars } from "../../components/rating-stars/rating-stars";
import { StateBlock } from "../../components/state-block/state-block";
import type { Product } from "../../types/product-types";
import { currencyFormatter, formatCategoryLabel } from "../../utils/formatters";

type DetailLocationState = {
  from?: string;
};

function getNavigationWindow(currentIndex: number, totalProducts: number) {
  const startIndex = Math.max(0, Math.min(currentIndex - 2, totalProducts - 5));
  const endIndex = Math.min(totalProducts, startIndex + 5);

  return Array.from(
    { length: endIndex - startIndex },
    (_, index) => startIndex + index,
  );
}

export function ProductDetailRoute() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [product, setProduct] = useState<Product | null>(null);
  const [navigationProducts, setNavigationProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const fromPath = (location.state as DetailLocationState | null)?.from ?? "/";

  useEffect(() => {
    let isCurrent = true;

    async function loadProduct() {
      if (!productId) {
        setErrorMessage("Product id is missing.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage("");
        const nextProduct = await getProductById(productId);

        if (isCurrent) {
          setProduct(nextProduct);
        }
      } catch (error) {
        if (isCurrent) {
          setProduct(null);
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Unable to load product details.",
          );
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    }

    loadProduct();

    return () => {
      isCurrent = false;
    };
  }, [productId]);

  useEffect(() => {
    let isCurrent = true;

    async function loadNavigationProducts() {
      try {
        const nextProducts = await getProducts();

        if (isCurrent) {
          setNavigationProducts(nextProducts);
        }
      } catch {
        if (isCurrent) {
          setNavigationProducts([]);
        }
      }
    }

    loadNavigationProducts();

    return () => {
      isCurrent = false;
    };
  }, []);

  function goBack() {
    navigate(fromPath);
  }

  if (isLoading) {
    return (
      <section className="detail-page">
        <button className="back-button" type="button" onClick={goBack}>
          <ArrowLeft aria-hidden="true" size={15} strokeWidth={2.2} />
          Back
        </button>
        <StateBlock
          title="Loading product"
          message="Fetching the selected product from DummyJSON."
        />
      </section>
    );
  }

  if (errorMessage || !product) {
    return (
      <section className="detail-page">
        <button className="back-button" type="button" onClick={goBack}>
          <ArrowLeft aria-hidden="true" size={15} strokeWidth={2.2} />
          Back
        </button>
        <StateBlock
          title="Product unavailable"
          message={errorMessage || "The selected product could not be found."}
        />
      </section>
    );
  }

  const currentProduct = product;
  const primaryImage = currentProduct.images[0] ?? currentProduct.thumbnail;
  const reviews = currentProduct.reviews ?? [];
  const currentNavigationIndex = navigationProducts.findIndex(
    (navigationProduct) => navigationProduct.id === currentProduct.id,
  );
  const navigationIndexes =
    currentNavigationIndex >= 0
      ? getNavigationWindow(currentNavigationIndex, navigationProducts.length)
      : [];

  function navigateToProduct(index: number) {
    const nextProduct = navigationProducts[index];

    if (!nextProduct || nextProduct.id === currentProduct.id) {
      return;
    }

    navigate(`/product/${nextProduct.id}`, {
      state: {
        from: fromPath,
      },
    });
  }

  return (
    <section
      className="detail-page detail-page--product-detail"
      aria-labelledby="product-title"
    >
      <button className="back-button" type="button" onClick={goBack}>
        <ArrowLeft aria-hidden="true" size={15} strokeWidth={2.2} />
        Back
      </button>

      <article className="product-detail">
        <div className="product-detail__media">
          <div className="product-detail__image-wrap">
            <img src={primaryImage} alt={currentProduct.title} />
          </div>

          {navigationIndexes.length > 0 ? (
            <nav
              className="detail-product-nav"
              aria-label="Browse products from detail page"
            >
              <button
                className="pagination__arrow"
                type="button"
                aria-label="Previous product"
                disabled={currentNavigationIndex <= 0}
                onClick={() => navigateToProduct(currentNavigationIndex - 1)}
              >
                <ChevronLeft aria-hidden="true" size={18} strokeWidth={2.4} />
              </button>

              <div className="pagination__pages">
                {navigationIndexes.map((index) => {
                  const navigationProduct = navigationProducts[index];
                  const page = index + 1;
                  const isCurrentProduct = index === currentNavigationIndex;

                  return (
                    <button
                      className={isCurrentProduct ? "is-active" : ""}
                      type="button"
                      key={navigationProduct.id}
                      aria-current={isCurrentProduct ? "page" : undefined}
                      aria-label={`View product ${page}`}
                      onClick={() => navigateToProduct(index)}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>

              <button
                className="pagination__arrow"
                type="button"
                aria-label="Next product"
                disabled={
                  currentNavigationIndex < 0 ||
                  currentNavigationIndex >= navigationProducts.length - 1
                }
                onClick={() => navigateToProduct(currentNavigationIndex + 1)}
              >
                <ChevronRight aria-hidden="true" size={18} strokeWidth={2.4} />
              </button>
            </nav>
          ) : null}
        </div>
        <div className="product-detail__content">
          <h1 id="product-title">{currentProduct.title}</h1>
          <div className="product-detail__price-row">
            <strong>{currencyFormatter.format(currentProduct.price)}</strong>
            <RatingStars rating={currentProduct.rating} />
          </div>

          <dl className="product-detail__meta">
            <div>
              <dt>Brand:</dt>
              <dd>{currentProduct.brand || "Unbranded"}</dd>
            </div>
            <div>
              <dt>Category:</dt>
              <dd>{formatCategoryLabel(currentProduct.category)}</dd>
            </div>
          </dl>

          <section
            className="description-section"
            aria-labelledby="description-title"
          >
            <h2 id="description-title">Description</h2>
            <p className="product-detail__description">
              {currentProduct.description}
            </p>
          </section>

          <section className="reviews-section" aria-labelledby="reviews-title">
            <h2 id="reviews-title">Reviews</h2>
            {reviews.length > 0 ? (
              <div className="review-list">
                {reviews.map((review) => (
                  <article
                    className="review-card"
                    key={`${review.reviewerEmail}-${review.date}`}
                  >
                    <div className="review-card__header">
                      <h3>{review.reviewerName}</h3>
                      <RatingStars
                        className="review-rating"
                        rating={review.rating}
                        label={`Review rating ${review.rating} out of 5`}
                      />
                    </div>
                    <p>{review.comment}</p>
                  </article>
                ))}
              </div>
            ) : (
              <p className="muted-text">No reviews yet.</p>
            )}
          </section>
        </div>
      </article>
    </section>
  );
}
