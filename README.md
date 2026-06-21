# Marketlane Product Store

This is an ecommerce product store built for the assessment. The app uses React, TypeScript, React Router that proxy the DummyJSON product APIs.

## Setup instructions

- npm install
- npm run dev

## Assumptions made

- Category and brand filters are multi-select because it gives the store a more practical filtering experience.
- Product filters are stored in the URL so the state is retained when moving between the listing and detail pages.
- Product data is cached briefly in localStorage to avoid refetching the same product/category data on every navigation.

## Architectural decisions

- The project is split into `client` and `server` workspaces so the frontend consumes local `/api` routes instead of calling DummyJSON directly from every component.
- API-related frontend code lives in `client/src/api`, while Express routes live in `server/src/routes`.
- Reusable UI is kept in `client/src/components`, and page-level views are kept in `client/src/routes`.
- File and folder names added for the assessment use kebab-case.
- React Router handles product listing and product detail navigation.
- The listing page uses URL query params for search, categories, brands, price range, and pagination.
- Filtering is intentionally kept simple: products are loaded from DummyJSON, then search, price, category, and brand filters are applied on the client.
- Product details are fetched when a product is opened, instead of loading every full product detail upfront.

## Improvements if given more time

- I would drastically change the UI to match current ecommerce expectations better: cleaner spacing, better mobile behavior, stronger product imagery, and a more polished cart/wishlist flow.
- I would move pagination closer to the API layer, using `limit` and `skip` properly so product requests only happen when the page changes instead of loading large lists and slicing them on the client.
- I would keep product details lazy-loaded, as they are now, but add prefetching for nearby products so navigation still feels instant.
- I would add tests for filter parsing, price validation, pagination, and product detail routing.
- I would add skeleton loading states and stronger empty/error states for a more finished user experience.
