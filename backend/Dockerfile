FROM node:20-alpine

# Prisma engine needs OpenSSL on musl (Alpine)
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Install dependencies first (caching layer)
COPY package.json package-lock.json* ./
RUN npm install

COPY . .

RUN npx prisma generate --schema=src/models/schema.prisma

EXPOSE 4000

CMD ["npm", "run", "dev"]
