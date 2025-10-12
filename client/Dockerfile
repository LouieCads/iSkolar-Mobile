# ---- Base Node Image ----
FROM node:20-alpine

# ---- Set Working Directory ----
WORKDIR /app

# ---- Copy Files ----
COPY package*.json ./

# ---- Install Dependencies ----
RUN npm install

# ---- Copy Source Code ----
COPY . .

# ---- Run Development Server ----
RUN npx expo start

# ---- Expose Expo Dev Server Port ----
EXPOSE 8081

# ---- Start Expo Development Server ----
CMD ["npx", "expo", "start"]