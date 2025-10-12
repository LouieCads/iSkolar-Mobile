import dotenv from "dotenv";
dotenv.config();

const config = {
  development: {
    username: process.env.DB_USER || "",
    password: process.env.DB_PASS || "",
    database: process.env.DB_NAME || "",
    host: process.env.DB_HOST || "127.0.0.1",
    dialect: "postgres",
  },
  test: {
    username: process.env.DB_USER || "",
    password: process.env.DB_PASS || "",
    database: process.env.DB_NAME_TEST || "",
    host: process.env.DB_HOST || "127.0.0.1",
    dialect: "postgres",
  },
  production: {
    username: process.env.DB_USER || "",
    password: process.env.DB_PASS || "",
    database: process.env.DB_NAME_PROD || "",
    host: process.env.DB_HOST || "127.0.0.1",
    dialect: "postgres",
  },
};

export default config;
