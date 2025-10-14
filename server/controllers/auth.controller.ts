import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import User from "../models/Users";

const JWT_SECRET = process.env.JWT_SECRET || "secretkey";
const otpStore: Map<string, { otp: string; expiresAt: Date; verified: boolean }> = new Map(); // Temporary storage

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, confirmPassword } = req.body;

    if (!email || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password 
    const hashedPassword = await bcrypt.hash(password, 15);
    const newUser = await User.create({ email, password: hashedPassword });

    return res.status(201).json({ message: "Account created successfully", user: newUser });
  } catch (error) {
    return res.status(500).json({ message: "Error registering user", error });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

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

// Send OTP 
export const sendOTP = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "Email not found" });

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // Store OTP 
    otpStore.set(email, {
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // expires in 5 mins
      verified: false,
    });

    const transporter = nodemailer.createTransport({
      service: "gmail", 
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Send OTP via email
    await transporter.sendMail({
      from: `"iSkolar" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP Code - iSkolar Password Reset",
      html: `
        <h3>Forgot Password Verification</h3>
        <p>Your OTP code is:</p>
        <h2>${otp}</h2>
        <p>This code will expire in 5 minutes.</p>
      `,
    });

    return res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    return res.status(500).json({ message: "Error sending OTP", error });
  }
};

// Verify OTP
export const verifyOTP = (req: Request, res: Response) => {
  const { email, otp } = req.body;

  const otpData = otpStore.get(email);
  if (!otpData) return res.status(400).json({ message: "No OTP found for this email" });

  if (otpData.expiresAt < new Date()) {
    otpStore.delete(email);
    return res.status(400).json({ message: "OTP expired" });
  }

  if (otpData.otp !== otp) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  otpData.verified = true;
  otpStore.set(email, otpData);

  return res.status(200).json({ message: "OTP verified successfully" });
};

// Reset Password
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, password, confirmPassword } = req.body;

    if (!email || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const otpData = otpStore.get(email);
    if (!otpData || !otpData.verified) {
      return res.status(400).json({ message: "OTP not verified" });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const hashedPassword = await bcrypt.hash(password, 15);
    user.password = hashedPassword;
    await user.save();

    // Remove from OTP store
    otpStore.delete(email);

    return res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Error resetting password:", error);
    return res.status(500).json({ message: "Error resetting password", error });
  }
};