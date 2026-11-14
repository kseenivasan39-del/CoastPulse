FROM node:22-alpine

WORKDIR /app

# Install dependencies first for Docker layer caching
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install

# Copy application source
COPY frontend .

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["npm", "run", "dev"]
