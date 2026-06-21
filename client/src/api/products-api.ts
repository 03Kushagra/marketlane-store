import type {
  Category,
  CategoryResponseItem,
  Product,
  ProductListResponse,
} from "../types/product-types";

const API_BASE_URL = "/api";
const PRODUCT_PAGE_LIMIT = 100;
const CACHE_PREFIX = "marketlane-store";
const CACHE_TTL_MS = 15 * 60 * 1000;

type CacheEntry<T> = {
  expiresAt: number;
  value: T;
};

async function requestJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`);

  if (!response.ok) {
    throw new Error(
      `Product API request failed with status ${response.status}.`,
    );
  }

  return response.json() as Promise<T>;
}

function readCache<T>(key: string): T | null {
  try {
    const cachedValue = window.localStorage.getItem(`${CACHE_PREFIX}:${key}`);

    if (!cachedValue) {
      return null;
    }

    const cacheEntry = JSON.parse(cachedValue) as CacheEntry<T>;

    if (Date.now() > cacheEntry.expiresAt) {
      window.localStorage.removeItem(`${CACHE_PREFIX}:${key}`);
      return null;
    }

    return cacheEntry.value;
  } catch {
    return null;
  }
}

function writeCache<T>(key: string, value: T) {
  try {
    const cacheEntry: CacheEntry<T> = {
      expiresAt: Date.now() + CACHE_TTL_MS,
      value,
    };

    window.localStorage.setItem(
      `${CACHE_PREFIX}:${key}`,
      JSON.stringify(cacheEntry),
    );
  } catch {
    // No-op
  }
}

function formatCategoryName(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function normalizeCategory(category: CategoryResponseItem): Category {
  if (typeof category === "string") {
    return {
      slug: category,
      name: formatCategoryName(category),
    };
  }

  return {
    slug: category.slug,
    name: category.name || formatCategoryName(category.slug),
  };
}

export async function getCategories() {
  const cacheKey = "categories";
  const cachedCategories = readCache<Category[]>(cacheKey);

  if (cachedCategories) {
    return cachedCategories;
  }

  const categories = await requestJson<CategoryResponseItem[]>(
    "/products/categories",
  );
  const normalizedCategories = categories
    .map(normalizeCategory)
    .sort((first, second) => first.name.localeCompare(second.name));

  writeCache(cacheKey, normalizedCategories);
  return normalizedCategories;
}

export async function getProducts(category?: string) {
  const cacheKey = category ? `products:${category}` : "products:all";
  const cachedProducts = readCache<Product[]>(cacheKey);

  if (cachedProducts) {
    return cachedProducts;
  }

  const basePath = category
    ? `/products/category/${encodeURIComponent(category)}`
    : "/products";
  const firstPage = await requestJson<ProductListResponse>(
    `${basePath}?limit=${PRODUCT_PAGE_LIMIT}&skip=0`,
  );
  const allProducts = [...firstPage.products];
  const total = firstPage.total ?? allProducts.length;

  for (
    let skip = firstPage.skip + firstPage.limit;
    skip < total;
    skip += PRODUCT_PAGE_LIMIT
  ) {
    const nextPage = await requestJson<ProductListResponse>(
      `${basePath}?limit=${PRODUCT_PAGE_LIMIT}&skip=${skip}`,
    );
    allProducts.push(...nextPage.products);
  }

  writeCache(cacheKey, allProducts);
  return allProducts;
}

export async function getProductById(productId: string) {
  const cacheKey = `product:${productId}`;
  const cachedProduct = readCache<Product>(cacheKey);

  if (cachedProduct) {
    return cachedProduct;
  }

  const product = await requestJson<Product>(
    `/products/${encodeURIComponent(productId)}`,
  );

  writeCache(cacheKey, product);
  return product;
}
