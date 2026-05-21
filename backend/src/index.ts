import { config } from "./config.js";
import { bootstrap, createServer } from "./server.js";
import { logger } from "./utils/logger.js";

async function main(): Promise<void> {
  await bootstrap();

  const app = createServer();
  app.listen(config.port, () => {
    logger.info({ port: config.port }, "ready");
  });
}

main().catch((err) => {
  logger.error({ err }, "Fatal startup error");
  process.exit(1);
});
