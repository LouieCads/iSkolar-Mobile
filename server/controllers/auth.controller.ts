import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/Users";

const JWT_SECRET = process.env.JWT_SECRET || "secretkey";

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, confirmPassword } = req.body;

    // Validation
    if (!email || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password and save
    const hashedPassword = await bcrypt.hash(password, 20);
    const newUser = await User.create({ email, password: hashedPassword });

    return res.status(201).json({ message: "Account created successfully", user: newUser });
  } catch (error) {
    return res.status(500).json({ message: "Error registering user", error });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password, rememberMe } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ message: "Invalid email or password" });

    const expiresIn = rememberMe ? "30d" : "1d";

    // Generate JWT
    const token = jwt.sign({ 
      id: user.id, 
      email: 
      user.email 
    }, 
    JWT_SECRET, 
    { expiresIn });

    return res.status(200).json({
      message: "Login successful",
      token,
      user: { id: user.id, email: user.email },
    });
  } catch (error) {
    return res.status(500).json({ message: "Error logging in", error });
  }
};


