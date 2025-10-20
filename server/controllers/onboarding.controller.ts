import { Request, Response } from "express";
import User from "../models/Users";
import Student from "../models/Student";
import Sponsor from "../models/Sponsor";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export const selectRole = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { role } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ 
        success: false,
        message: "Authentication required" 
      });
    }

    if (!role || !['student', 'sponsor'].includes(role)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid role. Must be 'student' or 'sponsor'" 
      });
    }
    
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    // Check if user already has a role
    if (user.role && user.has_selected_role) {
      return res.status(400).json({ 
        success: false,
        message: `You have already selected your role as ${user.role}.`,
        currentRole: user.role,
        hasSelectedRole: user.has_selected_role
      });
    }

    user.role = role;
    user.has_selected_role = true;
    await user.save();

    // Note: Profile records will be created during profile setup phase

    return res.status(200).json({
      success: true,
      message: "Role selected successfully",
      user: {
        id: user.user_id,
        email: user.email,
        role: user.role,
        has_selected_role: user.has_selected_role
      }
    });
  } catch (error) {
    console.error("Error selecting role:", error);
    return res.status(500).json({
      success: false,
      message: "Error selecting role. Please try again later."
    });
  }
};

export const getProfileStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ 
        success: false,
        message: "Authentication required" 
      });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    let profileCompleted = false;
    
    if (user.role === 'student') {
      const student = await Student.findOne({ where: { user_id: userId } });
      profileCompleted = student?.has_completed_profile || false;
    } else if (user.role === 'sponsor') {
      const sponsor = await Sponsor.findOne({ where: { user_id: userId } });
      profileCompleted = sponsor?.has_completed_profile || false;
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user.user_id,
        email: user.email,
        role: user.role,
        has_selected_role: user.has_selected_role,
        profile_completed: profileCompleted
      }
    });
  } catch (error) {
    console.error("Error getting profile status:", error);
    return res.status(500).json({
      success: false,
      message: "Error getting profile status. Please try again later."
    });
  }
};

