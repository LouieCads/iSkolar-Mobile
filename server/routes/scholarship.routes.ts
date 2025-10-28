import { Router } from "express";
import { authenticateToken } from "../middlewares/auth.middleware";
import { 
  createScholarship, 
  uploadScholarshipImage, 
  getAllScholarships,
  upload 
} from "../controllers/scholarship.controller";

const router = Router();

// Get all scholarships (public endpoint)
router.get("/", getAllScholarships);

// Create scholarship 
router.post("/create", authenticateToken, createScholarship);

// Upload scholarship image 
router.post("/:scholarship_id/image", authenticateToken, upload.single('image'), uploadScholarshipImage);

export default router;
