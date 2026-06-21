import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { healthRouter } from "./routes/health.routes.js";
import { productsRouter } from "./routes/products.routes.js";

export const app = express();

app.use(
  cors({
    origin: env.clientOrigin,
  }),
);
app.use(express.json());

app.get("/", (_request, response) => {
  response.json({
    message: "Marketlane Store API",
  });
});

app.use("/api/health", healthRouter);
app.use("/api/products", productsRouter);
