FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
ENV PORT=3000
EXPOSE 3000
CMD ["sh", "-c", "npx vite preview --host 0.0.0.0 --port ${PORT:-3000}"]
