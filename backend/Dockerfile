FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci 2>/dev/null || npm install
COPY tsconfig.json ./
COPY src ./src
COPY eval ./eval
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev 2>/dev/null || npm install --omit=dev
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/eval ./eval
RUN mkdir -p data
EXPOSE 4000
CMD ["node", "dist/index.js"]
