FROM node:18

WORKDIR /app

# Install Python and dependencies for Chandra OCR
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Install Chandra OCR
RUN pip3 install --no-cache-dir "chandra-ocr[hf]" --break-system-packages

# Patch chandra-ocr to support offloading to disk for low-memory environments
RUN HF_FILE=$(find /usr/local/lib/python3.* -name hf.py | grep chandra | head -n 1) \
    && sed -i 's/settings.MODEL_CHECKPOINT, \*\*kwargs/settings.MODEL_CHECKPOINT, offload_folder="offload", \*\*kwargs/' "$HF_FILE" \
    && mkdir -p /app/offload

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5000

CMD ["node", "server.js"]