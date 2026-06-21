import { type FormEvent, useEffect, useMemo, useState } from "react";
import type { Category, ProductFilters } from "../../types/product-types";

type FilterSidebarProps = {
  categories: Category[];
  filters: ProductFilters;
  brandOptions: string[];
  isLoadingCategories: boolean;
  onCategoryToggle: (category: string) => void;
  onPriceApply: (minPrice: string, maxPrice: string) => void;
  onBrandToggle: (brand: string) => void;
  onClearFilters: () => void;
};

export function FilterSidebar({
  categories,
  filters,
  brandOptions,
  isLoadingCategories,
  onCategoryToggle,
  onPriceApply,
  onBrandToggle,
  onClearFilters,
}: FilterSidebarProps) {
  const [filterSearch, setFilterSearch] = useState("");
  const [minPrice, setMinPrice] = useState(filters.minPrice);
  const [maxPrice, setMaxPrice] = useState(filters.maxPrice);
  const [priceError, setPriceError] = useState("");

  useEffect(() => {
    setMinPrice(filters.minPrice);
    setMaxPrice(filters.maxPrice);
  }, [filters.minPrice, filters.maxPrice]);

  function validatePriceRange(nextMinPrice: string, nextMaxPrice: string) {
    const minPriceValue = nextMinPrice.trim()
      ? Number(nextMinPrice)
      : undefined;
    const maxPriceValue = nextMaxPrice.trim()
      ? Number(nextMaxPrice)
      : undefined;

    if (
      (minPriceValue !== undefined &&
        (!Number.isFinite(minPriceValue) || minPriceValue < 0)) ||
      (maxPriceValue !== undefined &&
        (!Number.isFinite(maxPriceValue) || maxPriceValue < 0))
    ) {
      return "Price values cannot be negative.";
    }

    if (
      minPriceValue !== undefined &&
      maxPriceValue !== undefined &&
      minPriceValue > maxPriceValue
    ) {
      return "Min price cannot be greater than max price.";
    }

    return "";
  }

  const visibleCategories = useMemo(() => {
    const search = filterSearch.trim().toLowerCase();

    if (!search) {
      return categories;
    }

    return categories.filter((category) =>
      category.name.toLowerCase().includes(search),
    );
  }, [categories, filterSearch]);

  const visibleBrands = useMemo(() => {
    const search = filterSearch.trim().toLowerCase();

    if (!search) {
      return brandOptions;
    }

    return brandOptions.filter((brand) => brand.toLowerCase().includes(search));
  }, [brandOptions, filterSearch]);

  function handlePriceSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextPriceError = validatePriceRange(minPrice, maxPrice);

    if (nextPriceError) {
      setPriceError(nextPriceError);
      return;
    }

    setPriceError("");
    onPriceApply(minPrice, maxPrice);
  }

  function handleMinPriceChange(value: string) {
    setMinPrice(value);
    setPriceError(validatePriceRange(value, maxPrice));
  }

  function handleMaxPriceChange(value: string) {
    setMaxPrice(value);
    setPriceError(validatePriceRange(minPrice, value));
  }

  function handleClearFilters() {
    setFilterSearch("");
    setMinPrice("");
    setMaxPrice("");
    setPriceError("");
    onClearFilters();
  }

  return (
    <aside className="filter-sidebar" aria-label="Product filters">
      <label className="sidebar-search" htmlFor="filter-search">
        <span className="search-icon" aria-hidden="true" />
        <input
          id="filter-search"
          type="search"
          placeholder="Search..."
          value={filterSearch}
          onChange={(event) => setFilterSearch(event.target.value)}
        />
      </label>

      <div className="filter-sidebar__header">
        <h2>Categories</h2>
        <button
          className="text-button"
          type="button"
          onClick={handleClearFilters}
        >
          Clear
        </button>
      </div>

      <fieldset className="filter-group">
        <legend className="visually-hidden">Categories</legend>
        <div
          className="option-list category-list"
          aria-busy={isLoadingCategories}
        >
          {visibleCategories.map((category) => (
            <label className="checkbox-row" key={category.slug}>
              <input
                type="checkbox"
                checked={filters.categories.includes(category.slug)}
                onChange={() => onCategoryToggle(category.slug)}
                disabled={isLoadingCategories}
              />
              <span>{category.name}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <form className="filter-group" onSubmit={handlePriceSubmit}>
        <h2>Price Range</h2>
        <div className="price-fields">
          <label className="visually-hidden" htmlFor="min-price">
            Min
          </label>
          <input
            id="min-price"
            type="number"
            min="0"
            inputMode="decimal"
            placeholder="Min"
            value={minPrice}
            aria-invalid={priceError ? "true" : "false"}
            aria-describedby={priceError ? "price-filter-error" : undefined}
            onChange={(event) => handleMinPriceChange(event.target.value)}
          />
          <label className="visually-hidden" htmlFor="max-price">
            Max
          </label>
          <input
            id="max-price"
            type="number"
            min="0"
            inputMode="decimal"
            placeholder="Max"
            value={maxPrice}
            aria-invalid={priceError ? "true" : "false"}
            aria-describedby={priceError ? "price-filter-error" : undefined}
            onChange={(event) => handleMaxPriceChange(event.target.value)}
          />
        </div>
        {priceError ? (
          <p className="form-error" id="price-filter-error" role="alert">
            {priceError}
          </p>
        ) : null}
        <button className="apply-button" type="submit">
          Apply
        </button>
      </form>

      <fieldset className="filter-group">
        <legend>Brands</legend>
        <div className="option-list brand-list">
          {visibleBrands.length > 0 ? (
            visibleBrands.map((brand) => (
              <label className="checkbox-row" key={brand}>
                <input
                  type="checkbox"
                  checked={filters.brands.includes(brand)}
                  onChange={() => onBrandToggle(brand)}
                />
                <span>{brand}</span>
              </label>
            ))
          ) : (
            <p className="muted-text">
              No brands available for this selection.
            </p>
          )}
        </div>
      </fieldset>
    </aside>
  );
}
