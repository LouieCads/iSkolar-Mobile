import { Sequelize } from "sequelize";
import config from "./config";

const env = process.env.NODE_ENV || "development";
const dbConfig = (config as any)[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    dialect: "postgres",
    logging: false,
  }
);

export default sequelize;
