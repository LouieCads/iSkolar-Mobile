import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import User from "../models/Users";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}
const otpStore: Map<string, { otp: string; expiresAt: Date; verified: boolean }> = new Map(); // Temporary storage

const PASSWORD_PATTERNS = {
  uppercase: /[A-Z]/,
  lowercase: /[a-z]/,
  number: /[0-9]/,
  special: /[@$!%*?&]/,
};

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, confirmPassword } = req.body;

    if (!email || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    if (password.length < 8) {
      return res.status(400).json({ 
        message: "Password must be at least 8 characters" 
      });
    }

    if (!PASSWORD_PATTERNS.uppercase.test(password)) {
      return res.status(400).json({ 
        message: "Password must contain at least one uppercase letter" 
      });
    }

    if (!PASSWORD_PATTERNS.lowercase.test(password)) {
      return res.status(400).json({ 
        message: "Password must contain at least one lowercase letter" 
      });
    }

    if (!PASSWORD_PATTERNS.number.test(password)) {
      return res.status(400).json({ 
        message: "Password must contain at least one number" 
      });
    }

    if (!PASSWORD_PATTERNS.special.test(password)) {
      return res.status(400).json({ 
        message: "Password must contain at least one special character (@$!%*?&)" 
      });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password 
    const hashedPassword = await bcrypt.hash(password, 15);
    const newUser = await User.create({ email, password: hashedPassword });

    return res.status(201).json({ 
      message: "Account created successfully!", 
      user: { 
        id: newUser.user_id, 
        email: newUser.email 
      } });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ 
      message: "Error registering user. Please try again later." 
    });
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
      id: user.user_id, 
      email: user.email,
    }, 
    JWT_SECRET, 
    { expiresIn });

    const expiresInMs = rememberMe 
      ? 30 * 24 * 60 * 60 * 1000  // 30 days in milliseconds
      : 24 * 60 * 60 * 1000;       // 1 day in milliseconds
    
    const expiryTimestamp = Date.now() + expiresInMs;

    return res.status(200).json({
      message: "Login successful!",
      token,
      expiresAt: expiryTimestamp,
      user: { id: user.user_id, email: user.email },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ 
      message: "Error logging in. Please try again later." 
    });
  }
};

// Send OTP 
export const sendOTP = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "Email not found. Please create an account" });

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();

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

    // Send OTP 
    await transporter.sendMail({
      from: `"iSkolar" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP Code - iSkolar Password Reset",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3A52A6;">Password Reset Request</h2>
          <p>You have requested to reset your password. Please use the following OTP code:</p>
          <div style="background-color: #f0f7ff; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #3A52A6; letter-spacing: 5px; margin: 0;">${otp}</h1>
          </div>
          <p style="color: #666;">This code will expire in 5 minutes.</p>
          <p style="color: #666; font-size: 12px;">If you did not request this, please ignore this email.</p>
        </div>
      `,
    });

    return res.status(200).json({ 
      message: "OTP sent successfully to your email" 
    });
  } catch (error) {
    console.error("Error sending OTP:", error);
    return res.status(500).json({ 
      message: "Error sending OTP. Please try again later." 
    });
  }
};

// Verify OTP
export const verifyOTP = (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ 
        message: "Email and OTP are required" 
      });
    }

    const otpData = otpStore.get(email.toLowerCase());
    if (!otpData) return res.status(400).json({ message: "No OTP found for this email. Please request a new one." });

    if (otpData.expiresAt < new Date()) {
      otpStore.delete(email);
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }

    if (otpData.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP. Please try again."  });
    }

    otpData.verified = true;
    otpStore.set(email, otpData);

    return res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return res.status(500).json({ 
      message: "Error verifying OTP. Please try again later." 
    });
  }
};

// Reset Password
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, password, confirmPassword } = req.body;

    if (!email || !password || !confirmPassword) {
      return res.status(400).json({ 
        message: "All fields are required" 
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ 
        message: "Passwords do not match" 
      });
    }

    if (password.length < 8) {
      return res.status(400).json({ 
        message: "Password must be at least 8 characters" 
      });
    }

    if (!PASSWORD_PATTERNS.uppercase.test(password)) {
      return res.status(400).json({ 
        message: "Password must contain at least one uppercase letter" 
      });
    }

    if (!PASSWORD_PATTERNS.lowercase.test(password)) {
      return res.status(400).json({ 
        message: "Password must contain at least one lowercase letter" 
      });
    }

    if (!PASSWORD_PATTERNS.number.test(password)) {
      return res.status(400).json({ 
        message: "Password must contain at least one number" 
      });
    }

    if (!PASSWORD_PATTERNS.special.test(password)) {
      return res.status(400).json({ 
        message: "Password must contain at least one special character (@$!%*?&)" 
      });
    }

    // Check if OTP was verified
    const otpData = otpStore.get(email.toLowerCase());
    if (!otpData || !otpData.verified) {
      return res.status(400).json({ 
        message: "OTP not verified. Please verify OTP first." 
      });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const hashedPassword = await bcrypt.hash(password, 15);
    user.password = hashedPassword;
    await user.save();

    // Remove from OTP store
    otpStore.delete(email);

    return res.status(200).json({ message: "Password reset successful! Please login" });
  } catch (error) {
    console.error("Error resetting password:", error);
    return res.status(500).json({ 
      message: "Error resetting password. Please try again later." 
    });
  }
};