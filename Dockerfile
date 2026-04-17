FROM cgr.dev/chainguard/node:22-dev AS build

WORKDIR /app

ENV PORT=3000
ENV DATABASE_URL=postgresql://localhost:5432/blocknest

COPY package*.json ./
RUN npm ci --include=dev

COPY prisma ./prisma
COPY prisma.config.ts ./
COPY src ./src

RUN npx prisma generate

FROM cgr.dev/chainguard/node:22

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma.config.ts ./
COPY --from=build /app/src ./src

EXPOSE 3000

CMD ["src/index.js"]