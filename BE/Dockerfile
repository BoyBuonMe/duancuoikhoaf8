FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY . .
EXPOSE 3001
CMD ["npx", "tsx", "server.ts"]
