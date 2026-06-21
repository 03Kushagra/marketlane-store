import { Heart, Menu, Search, ShoppingCart, UserRound } from "lucide-react";
import { useSearchParams } from "react-router-dom";

type AppHeaderProps = {
  isFilterOpen: boolean;
  onToggleFilters: () => void;
};

export function AppHeader({ isFilterOpen, onToggleFilters }: AppHeaderProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchValue = searchParams.get("search") ?? "";

  function updateSearch(search: string) {
    setSearchParams(
      (previousParams) => {
        const nextParams = new URLSearchParams(previousParams);

        if (search.trim()) {
          nextParams.set("search", search);
        } else {
          nextParams.delete("search");
        }

        nextParams.delete("page");
        return nextParams;
      },
      { replace: true },
    );
  }

  return (
    <header className="app-header">
      <button
        className="icon-button"
        type="button"
        aria-label={isFilterOpen ? "Hide filters" : "Show filters"}
        aria-expanded={isFilterOpen}
        onClick={onToggleFilters}
      >
        <Menu aria-hidden="true" size={23} strokeWidth={2.4} />
      </button>

      <label className="header-search" htmlFor="header-product-search">
        <Search className="header-search__icon" aria-hidden="true" size={16} />
        <input
          id="header-product-search"
          type="search"
          placeholder="Search products..."
          value={searchValue}
          onChange={(event) => updateSearch(event.target.value)}
        />
      </label>

      <div className="app-header__actions" aria-label="Store actions">
        <button className="icon-button" type="button" aria-label="Cart">
          <ShoppingCart aria-hidden="true" size={21} strokeWidth={2.3} />
        </button>
        <button className="icon-button" type="button" aria-label="Wishlist">
          <Heart aria-hidden="true" size={21} strokeWidth={2.3} />
        </button>
        <button
          className="icon-button"
          type="button"
          aria-label="Account profile"
        >
          <UserRound aria-hidden="true" size={21} strokeWidth={2.3} />
        </button>
      </div>
    </header>
  );
}
