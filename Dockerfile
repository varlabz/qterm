FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Install TypeScript globally in the container for build
RUN npm install -g typescript
RUN npm run build
RUN touch .key
ENV NODE_ENV=production
# Expose port if needed for future API functionality
# EXPOSE 3000
ENTRYPOINT ["node", "dist/index.js"]
CMD []