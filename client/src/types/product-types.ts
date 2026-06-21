export type CategoryResponseItem =
  | string
  | {
      slug: string;
      name: string;
      url?: string;
    };

export type Category = {
  slug: string;
  name: string;
};

export type Product = {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand?: string;
  thumbnail: string;
  images: string[];
  reviews?: ProductReview[];
};

export type ProductReview = {
  rating: number;
  comment: string;
  date: string;
  reviewerName: string;
  reviewerEmail: string;
};

export type ProductListResponse = {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
};

export type ProductFilters = {
  search: string;
  categories: string[];
  minPrice: string;
  maxPrice: string;
  brands: string[];
};
