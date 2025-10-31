import { authService } from './auth.service';

const EXPO_API_URL = process.env.EXPO_PUBLIC_API_URL;

interface ScholarshipData {
  type?: string;
  purpose?: string;
  title: string;
  description?: string;
  total_amount: number;
  total_slot: number;
  application_deadline?: string;
  criteria: string[];
  required_documents: string[];
}

interface Sponsor {
  sponsor_id: string;
  organization_name: string;
  logo_url?: string;
  email?: string;
}

interface Scholarship {
  scholarship_id: string;
  sponsor_id: string;
  status: string;
  type?: string;
  purpose?: string;
  title: string;
  description?: string;
  total_amount: number;
  total_slot: number;
  application_deadline?: string;
  criteria: string[];
  required_documents: string[];
  image_url?: string;
  applications_count?: number;
  created_at: string;
  updated_at: string;
  sponsor: Sponsor;
}

class ScholarshipService {
  async createScholarship(scholarshipData: ScholarshipData): Promise<{ 
    success: boolean; 
    scholarship?: any; 
    message: string 
  }> {
    const response = await authService.authenticatedRequest('/scholarship/create', {
      method: 'POST',
      body: JSON.stringify(scholarshipData)
    });

    return {
      success: response.success,
      scholarship: response.data?.scholarship,
      message: response.message
    };
  }

  async uploadScholarshipImage(scholarshipId: string, imageUri: string): Promise<{ 
    success: boolean; 
    image_url?: string; 
    message: string 
  }> {
    try {
      const token = await authService.getToken();
      
      if (!token) {
        return {
          success: false,
          message: 'No authentication token found'
        };
      }

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'scholarship.jpg',
      } as any);

      const response = await fetch(`${EXPO_API_URL}/scholarship/${scholarshipId}/image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      return {
        success: response.ok,
        image_url: result.image_url,
        message: result.message || (response.ok ? 'Scholarship image uploaded successfully' : 'Failed to upload scholarship image')
      };
    } catch (error) {
      console.error('Scholarship image upload error:', error);
      return {
        success: false,
        message: `Failed to connect to server at ${EXPO_API_URL}`
      };
    }
  }

  async getAllScholarships(): Promise<{ 
    success: boolean; 
    scholarships?: Scholarship[]; 
    message: string 
  }> {
    try {
      const response = await fetch(`${EXPO_API_URL}/scholarship/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: result.message || 'Failed to fetch scholarships'
        };
      }

      return {
        success: true,
        scholarships: result.scholarships,
        message: result.message || 'Scholarships fetched successfully'
      };
    } catch (error) {
      console.error('Fetch scholarships error:', error);
      return {
        success: false,
        message: `Failed to connect to server at ${EXPO_API_URL}`
      };
    }
  }

  async getSponsorScholarships(): Promise<{ 
    success: boolean; 
    scholarships?: Scholarship[]; 
    message: string 
  }> {
    const response = await authService.authenticatedRequest('/scholarship/my-scholarships', {
      method: 'GET'
    });

    return {
      success: response.success,
      scholarships: response.data?.scholarships,
      message: response.message || (response.success ? 'Scholarships fetched successfully' : 'Failed to fetch scholarships')
    };
  }
}

export const scholarshipService = new ScholarshipService();