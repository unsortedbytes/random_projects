FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# 🔥 install tesseract (VERY IMPORTANT)
RUN apt-get update && apt-get install -y tesseract-ocr

EXPOSE 5000

CMD ["node", "server.js"]