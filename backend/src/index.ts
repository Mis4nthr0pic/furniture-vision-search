import { config } from "./config.js";
import { createServer, startServer } from "./server.js";
import { logger } from "./utils/logger.js";

async function main(): Promise<void> {
  await startServer();

  const app = createServer();
  app.listen(config.port, () => {
    logger.info({ port: config.port }, "ready");
  });
}

main().catch((err) => {
  logger.error({ err }, "Fatal startup error");
  process.exit(1);
});
