import { Hono } from "hono";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { registerRoutes } from "./routes/base";
import { errorResponse, jsonResponse } from "./responses/respond";

const app = new Hono<{ Bindings: Cloudflare.Env }>();

app.use("*", cors(), secureHeaders());

app.use("*", async (c, next) => {
  const ip = c.req.header("CF-Connecting-IP") || "unknown";

  const { success } = await c.env.RATE_LIMITER.limit({ key: ip });

  if (!success) {
    return c.json(
      errorResponse("Too many requests. Please try again later."),
      429,
    );
  }

  await next();
});

app.get("/", (c) =>
  c.json(
    jsonResponse(
      undefined,
      undefined,
      "Thai Address API v1.1.0 - Service running",
    ),
  ),
);

registerRoutes(app);

export default app;
