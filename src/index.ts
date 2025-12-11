import { initDatabase } from "./db/database";
import App from "./app";

export default {
  async fetch(request, env, ctx) {
    initDatabase(env.DB);
    return App.fetch(request, env, ctx);
  },
} satisfies ExportedHandler<Cloudflare.Env>;
