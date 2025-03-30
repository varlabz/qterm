FROM node:20-alpine AS build
WORKDIR /app
RUN apk add --no-cache git
COPY package*.json ./
RUN npm ci
COPY . .
ENV NODE_ENV=production
RUN touch .key

# Build TypeScript to JavaScript
RUN npm run build

# Clone and process fabric patterns
ENV FABRIC=/app/fabric
RUN git clone --depth 1 https://github.com/danielmiessler/fabric /tmp/fabric && \
    rm -rf $FABRIC && \
    mkdir -p $FABRIC
RUN cd /tmp/fabric/patterns && \
    for i in */system.md; do cp "$i" $FABRIC"/"$(dirname $i)".md"; done && \
    rm -rf /tmp/fabric

# Clone and process awesome-chatgpt-prompts
ENV AWESOME=/app/awesome
RUN git clone --depth 1 https://github.com/f/awesome-chatgpt-prompts.git /tmp/awesome && \
    rm -rf $AWESOME && \
    mkdir -p $AWESOME
RUN npm run build && node dist/awesome-to-files.js /tmp/awesome/prompts.csv $AWESOME && \
    rm -rf /tmp/awesome

# Production stage
FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/package*.json ./
COPY --from=build /app/dist ./dist
COPY --from=build /app/.key ./.key
COPY --from=build /app/fabric ./fabric
COPY --from=build /app/awesome ./awesome

# Install only production dependencies
RUN npm ci --only=production

# Run the compiled JavaScript
ENTRYPOINT ["node", "dist/index.js"]
CMD []
