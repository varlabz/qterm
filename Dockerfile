FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache git
COPY package*.json ./
RUN npm ci
COPY . .
# Install TypeScript and type definitions globally in the container for build
RUN npm install -g typescript @types/node @types/estree @types/json-schema @types/node-fetch @types/retry @types/uuid
# Skip TypeScript build for now and use ts-node directly
ENV NODE_ENV=production
RUN touch .key

ENV FABRIC=/app/fabric
RUN git clone --depth 1 https://github.com/danielmiessler/fabric /tmp/fabric && \
    rm -rf $FABRIC && \
    mkdir -p $FABRIC
RUN cd /tmp/fabric/patterns && \
    for i in */system.md; do cp "$i" $FABRIC"/"$(dirname $i)".md"; done && \
    rm -rf /tmp/fabric

ENV AWESOME=/app/awesome
RUN git clone --depth 1 https://github.com/f/awesome-chatgpt-prompts.git /tmp/awesome && \
    rm -rf $AWESOME && \
    mkdir -p $AWESOME
RUN npx ts-node src/awesome-to-files.ts /tmp/awesome/prompts.csv $AWESOME && \
    rm -rf /tmp/awesome

# Use ts-node instead of building to JavaScript
ENTRYPOINT ["npx", "ts-node", "src/index.ts"]
CMD []