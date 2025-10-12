# ---- Base Node Image ----
FROM node:20-alpine

# ---- Set Working Directory ----
WORKDIR /app

# ---- Copy Package Files ----
COPY package*.json ./

# ---- Install Dependencies ----
RUN npm install

# ---- Copy Source Code ----
COPY . .

# ---- Run Development Server ----
RUN npm run dev

# ---- Expose Server Port ----
EXPOSE 5000

# ---- Start Server ----
CMD ["node", "dist/index.js"]
