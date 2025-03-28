FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Install TypeScript and type definitions globally in the container for build
RUN npm install -g typescript @types/node @types/estree @types/json-schema @types/node-fetch @types/retry @types/uuid
# Skip TypeScript build for now and use ts-node directly
ENV NODE_ENV=production
RUN touch .key
# Use ts-node instead of building to JavaScript
ENTRYPOINT ["npx", "ts-node", "src/index.ts"]
CMD []