export interface NavItem {
  id: string;
  label: string;
}

export interface SkillItem {
  id?: string;
  name: string;
  category: string;
  description: string;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectItem {
  id?: string;
  title: string;
  category?: string;
  description: string;
  tools: string[];
  published?: boolean;
  order?: number;
  highlights?: string[];
  keyInsight?: string;
  detailedDescription?: string;
  objective?: string;
  analysis?: string;
  keyInsights?: string;
  recommendations?: string;
  imageUrl?: string;
  screenshots?: string[];
  githubUrl?: string;
  liveUrl?: string;
  slug?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ContactInfo {
  type: 'email' | 'linkedin' | 'github' | 'whatsapp';
  label: string;
  value: string;
  href: string;
}

export interface ProfileData {
  fullName: string;
  professionalTitle: string;
  headline: string;
  about: string;
  email: string;
  whatsapp: string;
  linkedin: string;
  github: string;
  availabilityText?: string;
  profileImageUrl?: string;
  updatedAt?: string;
}

export interface CvData {
  fileUrl: string;
  fileName: string;
  fileSize?: number;
  uploadedAt?: string;
  updatedAt?: string;
}

