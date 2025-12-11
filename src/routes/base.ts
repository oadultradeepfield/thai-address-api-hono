import { Hono } from "hono";
import { listProvincesHandler } from "../handlers/province";
import { listDistrictsHandler } from "../handlers/district";
import {
  listSubdistrictsHandler,
  getSubdistrictsByPostalCodeHandler,
} from "../handlers/subdistrict";

export function registerRoutes(app: Hono<{ Bindings: Cloudflare.Env }>) {
  // Create a base router for /api/v1
  const api = new Hono();

  // Register Endpoints
  api.get("/provinces", listProvincesHandler);
  api.get("/districts", listDistrictsHandler);
  api.get("/subdistricts", listSubdistrictsHandler);
  api.get("/subdistricts/:postal_code", getSubdistrictsByPostalCodeHandler);

  app.route("/api/v1", api);
}
