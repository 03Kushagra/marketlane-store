import { Router, type Request, type Response } from "express";

const DUMMY_JSON_BASE_URL = "https://dummyjson.com";

export const productsRouter = Router();

function buildQueryString(query: Request["query"]) {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (typeof value === "string") {
      searchParams.set(key, value);
    } else if (Array.isArray(value)) {
      value.forEach((entry) => {
        if (typeof entry === "string") {
          searchParams.append(key, entry);
        }
      });
    }
  }

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
}

async function proxyDummyJson(path: string, response: Response) {
  const dummyJsonResponse = await fetch(`${DUMMY_JSON_BASE_URL}${path}`);
  const payload = await dummyJsonResponse.json();

  response.status(dummyJsonResponse.status).json(payload);
}

productsRouter.get("/", async (request, response, next) => {
  try {
    await proxyDummyJson(`/products${buildQueryString(request.query)}`, response);
  } catch (error) {
    next(error);
  }
});

productsRouter.get("/categories", async (_request, response, next) => {
  try {
    await proxyDummyJson("/products/categories", response);
  } catch (error) {
    next(error);
  }
});

productsRouter.get("/category/:category", async (request, response, next) => {
  try {
    const category = encodeURIComponent(request.params.category);
    await proxyDummyJson(
      `/products/category/${category}${buildQueryString(request.query)}`,
      response,
    );
  } catch (error) {
    next(error);
  }
});

productsRouter.get("/:productId", async (request, response, next) => {
  try {
    const productId = encodeURIComponent(request.params.productId);
    await proxyDummyJson(`/products/${productId}`, response);
  } catch (error) {
    next(error);
  }
});
