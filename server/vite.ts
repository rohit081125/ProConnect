import { createServer as createViteServer } from "vite";
import type { Express } from "express";
import type { Server } from "http";
import fs from "fs";
import path from "path";

export async function setupVite(server: Server, app: Express) {
  const frontendRoot = path.resolve(process.cwd(), "frontend");

  const vite = await createViteServer({
    configFile: path.resolve(process.cwd(), "vite.config.js"),
    root: frontendRoot,
    server: {
      middlewareMode: true,
      hmr: { server }
    },
    appType: "custom"
  });

  app.use(vite.middlewares);

  app.use(async (req, res, next) => {
    try {
      const url = req.originalUrl;
      const templatePath = path.resolve(frontendRoot, "index.html");
      let template = await fs.promises.readFile(templatePath, "utf-8");
      template = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(template);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}
