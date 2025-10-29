import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import sequelize from "./config/database";
import authRoutes from "./routes/auth.routes";
import onboardingRoutes from "./routes/onboarding.routes";
import profileRoutes from "./routes/profile.routes";
import scholarshipRoutes from "./routes/scholarship.routes";

// Import Models
import User from "./models/Users";
import Student from "./models/Student";
import Sponsor from "./models/Sponsor";
import Scholarship from "./models/Scholarship";

dotenv.config();
const app = express();

const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors({
  origin: '*', 
  credentials: true
}));

// Initialize model associations
const models = {
  User,
  Student,
  Sponsor,
  Scholarship
};

// Call associate method for each model
Object.values(models).forEach((model: any) => {
  if (model.associate) {
    model.associate(models);
  }
});

// Routes
app.use("/auth", authRoutes);
app.use("/onboarding", onboardingRoutes);
app.use("/profile", profileRoutes);
app.use("/scholarship", scholarshipRoutes);

sequelize
  .authenticate()
  .then(() => {
    console.log("✅ PostgreSQL connected");
    return sequelize.sync({ alter: true });
  })
  .then(() => {
    console.log("✅ Database & tables synced");
  })
  .catch((err) => {
    console.error("❌ Database error:", err);
  });

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});