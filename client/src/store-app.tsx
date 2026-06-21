import { useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppHeader } from "./components/app-header/app-header";
import { ProductDetailRoute } from "./routes/product-detail-route/product-detail-route";
import { ProductListingRoute } from "./routes/product-listing-route/product-listing-route";

export function StoreApp() {
  const [isFilterOpen, setIsFilterOpen] = useState(true);

  return (
    <div className="app-shell">
      <AppHeader
        isFilterOpen={isFilterOpen}
        onToggleFilters={() => setIsFilterOpen((current) => !current)}
      />
      <main>
        <Routes>
          <Route
            path="/"
            element={<ProductListingRoute isFilterOpen={isFilterOpen} />}
          />
          <Route path="/product/:productId" element={<ProductDetailRoute />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
