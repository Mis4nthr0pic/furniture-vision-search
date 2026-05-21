export const config = {
  port: Number(process.env.PORT ?? 4000),
  mongodbUri:
    process.env.MONGODB_URI ??
    "mongodb+srv://catalog-readonly:vcRvxWHQSKUEwd7V@catalog.sontifs.mongodb.net/catalog",
  openRouterReferer: process.env.OPENROUTER_REFERER ?? "http://localhost:5173",
  openRouterTitle: process.env.OPENROUTER_TITLE ?? "Furniture Vision Search",
};
