import { Request, Response } from "express";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import Scholarship from "../models/Scholarship";
import Sponsor from "../models/Sponsor";
import User from "../models/Users";
import { containerClient } from "../config/azure";
import { BlobSASPermissions, generateBlobSASQueryParameters, StorageSharedKeyCredential } from "@azure/storage-blob";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Generate SAS URL
const generateSasUrl = (blobName: string): string => {
  try {
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    const containerName = process.env.AZURE_CONTAINER_NAME;
    
    if (!connectionString || !containerName) {
      console.error('Missing Azure credentials:', {
        hasConnectionString: !!connectionString,
        hasContainerName: !!containerName
      });
      throw new Error('Azure Storage credentials not configured properly');
    }
    
    const accountNameMatch = connectionString.match(/AccountName=([^;]+)/);
    const accountKeyMatch = connectionString.match(/AccountKey=([^;]+)/);
    
    if (!accountNameMatch || !accountKeyMatch) {
      throw new Error('Invalid Azure Storage connection string format');
    }
    
    const accountName = accountNameMatch[1];
    const accountKey = accountKeyMatch[1];
    
    const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);
    
    const sasOptions = {
      containerName: containerName,
      blobName: blobName,
      permissions: BlobSASPermissions.parse("r"), 
      startsOn: new Date(),
      expiresOn: new Date(new Date().valueOf() + 365 * 24 * 60 * 60 * 1000), // 1 year expiry
    };

    const sasToken = generateBlobSASQueryParameters(
      sasOptions,
      sharedKeyCredential
    ).toString();

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const sasUrl = `${blockBlobClient.url}?${sasToken}`;
    return sasUrl;
  } catch (error) {
    console.error('Error generating SAS URL:', error);
    throw error;
  }
};

// Create a new scholarship
export const createScholarship = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ 
        success: false,
        message: "Authentication required." 
      });
    }

    const user = await User.findByPk(userId);
    if (!user || user.role !== 'sponsor') {
      return res.status(403).json({ 
        success: false,
        message: "Only sponsors can create scholarships." 
      });
    }

    const sponsor = await Sponsor.findOne({ where: { user_id: userId } });
    if (!sponsor) {
      return res.status(404).json({ 
        success: false,
        message: "Sponsor profile not found." 
      });
    }

    const { 
      type, 
      purpose, 
      title, 
      description, 
      total_amount, 
      total_slot, 
      application_deadline, 
      criteria, 
      required_documents 
    } = req.body;

    if (!title || !total_amount || !total_slot || !criteria || !required_documents) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: title, total_amount, total_slot, criteria, required_documents"
      });
    }

    let criteriaArray = [];
    let documentsArray = [];

    try {
      criteriaArray = typeof criteria === 'string' ? JSON.parse(criteria) : criteria;
      documentsArray = typeof required_documents === 'string' ? JSON.parse(required_documents) : required_documents;
    } catch (parseError) {
      return res.status(400).json({
        success: false,
        message: "Invalid format for criteria or required_documents arrays"
      });
    }

    // Create the scholarship
    const scholarship = await Scholarship.create({
      sponsor_id: sponsor.sponsor_id,
      status: 'active',
      type: type,
      purpose: purpose,
      title,
      description: description,
      total_amount: parseFloat(total_amount),
      total_slot: parseInt(total_slot),
      application_deadline: application_deadline ? new Date(application_deadline) : undefined,
      criteria: criteriaArray,
      required_documents: documentsArray,
      image_url: undefined, 
    });

    return res.status(201).json({
      success: true,
      message: "Scholarship created successfully",
      scholarship: {
        scholarship_id: scholarship.scholarship_id,
        sponsor_id: scholarship.sponsor_id,
        status: scholarship.status,
        type: scholarship.type,
        purpose: scholarship.purpose,
        title: scholarship.title,
        description: scholarship.description,
        total_amount: scholarship.total_amount,
        total_slot: scholarship.total_slot,
        application_deadline: scholarship.application_deadline,
        criteria: scholarship.criteria,
        required_documents: scholarship.required_documents,
        image_url: scholarship.image_url,
        created_at: scholarship.created_at,
        updated_at: scholarship.updated_at,
      }
    });
  } catch (error) {
    console.error("Error creating scholarship:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating scholarship. Please try again later."
    });
  }
};

// Upload scholarship image
export const uploadScholarshipImage = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { scholarship_id } = req.params;

    if (!userId) {
      return res.status(401).json({ 
        success: false,
        message: "Authentication required." 
      });
    }

    const user = await User.findByPk(userId);
    if (!user || user.role !== 'sponsor') {
      return res.status(403).json({ 
        success: false,
        message: "Only sponsors can upload scholarship images." 
      });
    }

    const sponsor = await Sponsor.findOne({ where: { user_id: userId } });
    if (!sponsor) {
      return res.status(404).json({ 
        success: false,
        message: "Sponsor profile not found." 
      });
    }

    const scholarship = await Scholarship.findByPk(scholarship_id);
    if (!scholarship) {
      return res.status(404).json({ 
        success: false,
        message: "Scholarship not found." 
      });
    }

    if (scholarship.sponsor_id !== sponsor.sponsor_id) {
      return res.status(403).json({ 
        success: false,
        message: "You don't have permission to upload images for this scholarship." 
      });
    }

    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: "No image file provided." 
      });
    }

    if (scholarship.image_url) {
      try {
        const urlWithoutSas = scholarship.image_url.split('?')[0];
        const urlParts = urlWithoutSas.split('/');
        const oldBlobName = urlParts.slice(-2).join('/');
        const oldBlockBlobClient = containerClient.getBlockBlobClient(oldBlobName);
        await oldBlockBlobClient.deleteIfExists();
      } catch (deleteError) {
        console.warn("Failed to delete old scholarship image:", deleteError);
      }
    }

    const fileExtension = req.file.originalname.split('.').pop();
    const fileName = `scholarship-${scholarship_id}-${uuidv4()}.${fileExtension}`;
    const blobName = `scholarships/${fileName}`;

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    
    await blockBlobClient.upload(req.file.buffer, req.file.size, {
      blobHTTPHeaders: {
        blobContentType: req.file.mimetype,
      },
    });

    const blobUrl = generateSasUrl(blobName);

    scholarship.image_url = blobUrl;
    await scholarship.save();

    return res.status(200).json({
      success: true,
      message: "Scholarship image uploaded successfully",
      image_url: blobUrl
    });
  } catch (error) {
    console.error("Error uploading scholarship image:", error);
    
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      : "Error uploading scholarship image. Please try again later.";
    
    return res.status(500).json({
      success: false,
      message: errorMessage
    });
  }
};

// Get all scholarships 
export const getAllScholarships = async (req: Request, res: Response) => {
  try {
    const scholarships = await Scholarship.findAll({
      include: [
        {
          model: Sponsor,
          as: 'sponsor',
          attributes: ['sponsor_id', 'organization_name'],
        }
      ],
      order: [['created_at', 'DESC']],
    });

    // Format the response
    const formattedScholarships = scholarships.map((scholarship: any) => ({
      scholarship_id: scholarship.scholarship_id,
      sponsor_id: scholarship.sponsor_id,
      status: scholarship.status,
      type: scholarship.type,
      purpose: scholarship.purpose,
      title: scholarship.title,
      total_amount: scholarship.total_amount,
      total_slot: scholarship.total_slot,
      application_deadline: scholarship.application_deadline,
      criteria: scholarship.criteria,
      required_documents: scholarship.required_documents,
      image_url: scholarship.image_url,
      created_at: scholarship.created_at,
      updated_at: scholarship.updated_at,
      sponsor: {
        sponsor_id: scholarship.sponsor?.sponsor_id,
        organization_name: scholarship.sponsor?.organization_name,
      }
    }));

    return res.status(200).json({
      success: true,
      scholarships: formattedScholarships
    });
  } catch (error) {
    console.error("Error getting scholarships:", error);
    return res.status(500).json({
      success: false,
      message: "Error getting scholarships. Please try again later."
    });
  }
};

export { upload };