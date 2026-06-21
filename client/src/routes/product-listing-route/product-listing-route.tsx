import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getCategories, getProducts } from "../../api/products-api";
import { FilterSidebar } from "../../components/filter-sidebar/filter-sidebar";
import { PaginationControls } from "../../components/pagination-controls/pagination-controls";
import { ProductCard } from "../../components/product-card/product-card";
import { StateBlock } from "../../components/state-block/state-block";
import type {
  Category,
  Product,
  ProductFilters,
} from "../../types/product-types";

const PRODUCTS_PER_PAGE = 8;

function parsePage(value: string | null) {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

function parseDelimitedValues(value: string | null) {
  return value
    ? Array.from(
        new Set(
          value
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
        ),
      )
    : [];
}

function toPrice(value: string) {
  if (value.trim() === "") {
    return undefined;
  }

  const price = Number(value);
  return Number.isFinite(price) && price >= 0 ? price : undefined;
}

type ProductListingRouteProps = {
  isFilterOpen: boolean;
};

export function ProductListingRoute({
  isFilterOpen,
}: ProductListingRouteProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const categoryParam =
    searchParams.get("categories") ?? searchParams.get("category");
  const brandParam = searchParams.get("brands");
  const selectedCategories = useMemo(
    () => parseDelimitedValues(categoryParam),
    [categoryParam],
  );
  const selectedBrands = useMemo(
    () => parseDelimitedValues(brandParam),
    [brandParam],
  );

  const filters: ProductFilters = {
    search: searchParams.get("search") ?? "",
    categories: selectedCategories,
    minPrice: searchParams.get("minPrice") ?? "",
    maxPrice: searchParams.get("maxPrice") ?? "",
    brands: selectedBrands,
  };
  const currentPage = parsePage(searchParams.get("page"));

  useEffect(() => {
    let isCurrent = true;

    async function loadCategories() {
      try {
        setIsLoadingCategories(true);
        const nextCategories = await getCategories();

        if (isCurrent) {
          setCategories(nextCategories);
        }
      } catch (error) {
        if (isCurrent) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Unable to load product categories.",
          );
        }
      } finally {
        if (isCurrent) {
          setIsLoadingCategories(false);
        }
      }
    }

    loadCategories();

    return () => {
      isCurrent = false;
    };
  }, []);

  useEffect(() => {
    let isCurrent = true;

    async function loadProducts() {
      try {
        setIsLoadingProducts(true);
        setErrorMessage("");
        const productGroups =
          filters.categories.length > 0
            ? await Promise.all(
                filters.categories.map((category) => getProducts(category)),
              )
            : [await getProducts()];
        const nextProducts = productGroups.flat();

        if (isCurrent) {
          setProducts(nextProducts);
        }
      } catch (error) {
        if (isCurrent) {
          setProducts([]);
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Unable to load products right now.",
          );
        }
      } finally {
        if (isCurrent) {
          setIsLoadingProducts(false);
        }
      }
    }

    loadProducts();

    return () => {
      isCurrent = false;
    };
  }, [filters.categories]);

  const brandOptions = useMemo(() => {
    const brands = new Set<string>();

    products.forEach((product) => {
      if (product.brand) {
        brands.add(product.brand);
      }
    });

    return Array.from(brands).sort((first, second) =>
      first.localeCompare(second),
    );
  }, [products]);

  useEffect(() => {
    if (isLoadingProducts || filters.brands.length === 0) {
      return;
    }

    const availableBrands = new Set(brandOptions);
    const validBrands = filters.brands.filter((brand) =>
      availableBrands.has(brand),
    );

    if (validBrands.length !== filters.brands.length) {
      updateFilter("brands", validBrands.join(","));
    }
  }, [brandOptions, filters.brands, isLoadingProducts]);

  const filteredProducts = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    const minPrice = toPrice(filters.minPrice);
    const maxPrice = toPrice(filters.maxPrice);
    const selectedBrands = new Set(filters.brands);
    const selectedCategories = new Set(filters.categories);

    return products.filter((product) => {
      const matchesSearch =
        search.length === 0 ||
        product.title.toLowerCase().includes(search) ||
        product.category.toLowerCase().includes(search) ||
        (product.brand ? product.brand.toLowerCase().includes(search) : false);
      const matchesMinPrice =
        minPrice === undefined || product.price >= minPrice;
      const matchesMaxPrice =
        maxPrice === undefined || product.price <= maxPrice;
      const matchesBrand =
        selectedBrands.size === 0 ||
        (product.brand ? selectedBrands.has(product.brand) : false);
      const matchesCategory =
        selectedCategories.size === 0 ||
        selectedCategories.has(product.category);

      return (
        matchesSearch &&
        matchesMinPrice &&
        matchesMaxPrice &&
        matchesBrand &&
        matchesCategory
      );
    });
  }, [
    filters.brands,
    filters.categories,
    filters.maxPrice,
    filters.minPrice,
    filters.search,
    products,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE),
  );
  const safePage = Math.min(currentPage, totalPages);
  const visibleProducts = filteredProducts.slice(
    (safePage - 1) * PRODUCTS_PER_PAGE,
    safePage * PRODUCTS_PER_PAGE,
  );

  useEffect(() => {
    if (currentPage !== safePage) {
      updatePage(safePage);
    }
  }, [currentPage, safePage]);

  function updateFilter(key: keyof ProductFilters, value: string) {
    setSearchParams(
      (previousParams) => {
        const nextParams = new URLSearchParams(previousParams);

        if (value) {
          nextParams.set(key, value);
        } else {
          nextParams.delete(key);
        }

        nextParams.delete("page");
        return nextParams;
      },
      { replace: true },
    );
  }

  function updatePage(page: number) {
    setSearchParams(
      (previousParams) => {
        const nextParams = new URLSearchParams(previousParams);

        if (page <= 1) {
          nextParams.delete("page");
        } else {
          nextParams.set("page", String(page));
        }

        return nextParams;
      },
      { replace: true },
    );
  }

  function handleBrandToggle(brand: string) {
    const nextBrands = filters.brands.includes(brand)
      ? filters.brands.filter((item) => item !== brand)
      : [...filters.brands, brand];

    updateFilter("brands", nextBrands.join(","));
  }

  function handleCategoryToggle(category: string) {
    const nextCategories = filters.categories.includes(category)
      ? filters.categories.filter((item) => item !== category)
      : [...filters.categories, category];

    updateFilter("categories", nextCategories.join(","));
  }

  function clearFilters() {
    setSearchParams({}, { replace: true });
  }

  function applyPriceFilter(minPrice: string, maxPrice: string) {
    const sanitizedMinPrice = minPrice.trim();
    const sanitizedMaxPrice = maxPrice.trim();

    setSearchParams(
      (previousParams) => {
        const nextParams = new URLSearchParams(previousParams);

        if (sanitizedMinPrice) {
          nextParams.set("minPrice", sanitizedMinPrice);
        } else {
          nextParams.delete("minPrice");
        }

        if (sanitizedMaxPrice) {
          nextParams.set("maxPrice", sanitizedMaxPrice);
        } else {
          nextParams.delete("maxPrice");
        }

        nextParams.delete("page");
        return nextParams;
      },
      { replace: true },
    );
  }

  return (
    <section className="listing-page" aria-label="Product listing">
      <div
        className={`catalog-layout ${
          isFilterOpen ? "" : "catalog-layout--filters-hidden"
        }`}
      >
        {isFilterOpen ? (
          <FilterSidebar
            categories={categories}
            filters={filters}
            brandOptions={brandOptions}
            isLoadingCategories={isLoadingCategories}
            onCategoryToggle={handleCategoryToggle}
            onPriceApply={applyPriceFilter}
            onBrandToggle={handleBrandToggle}
            onClearFilters={clearFilters}
          />
        ) : null}

        <div className="catalog-results">
          {errorMessage ? (
            <StateBlock
              title="Something went wrong"
              message={`${errorMessage} Please refresh and try again.`}
            />
          ) : isLoadingProducts ? (
            <StateBlock
              title="Loading products"
              message="Fetching the latest products from DummyJSON."
            />
          ) : visibleProducts.length > 0 ? (
            <>
              <div className="product-grid">
                {visibleProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <PaginationControls
                currentPage={safePage}
                totalPages={totalPages}
                onPageChange={updatePage}
              />
            </>
          ) : (
            <StateBlock
              title="No products found"
              message="Adjust the filters to expand the product list."
            />
          )}
        </div>
      </div>
    </section>
  );
}
