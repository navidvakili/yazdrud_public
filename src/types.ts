export type ActivePage = 'home' | 'news' | 'land-allocation' | 'urban-planning' | 'roads-transport' | 'services';

export interface NewsItem {
  id: number;
  title: string;
  summary: string | null;
  content: string;
  category_id: number | null;
  category_name: string | null;
  category_color: string | null;
  author_username: string;
  author_name: string | null;
  image_url: string | null;
  views_count: number;
  likes_count: number;
  is_pinned: boolean;
  status: 'published' | 'draft' | 'archived';
  tags: string[];
  published_at: string | null;
  created_at: string;
}

export interface ServiceItem {
  id: number;
  title: string;
  icon: string;
  description: string;
  link?: string;
  color: string;
}

export interface CountyData {
  id: string;
  name: string;
  x: number; // For SVG position
  y: number; // For SVG position
  roadProjects: number;
  housingUnits: number;
  urbanPlans: number;
  hasHousingWorkshop?: boolean;
  description: string;
}

export interface InquiryResult {
  status: 'passed' | 'failed' | 'not_found';
  message: string;
  nationalId: string;
  fullName?: string;
  date?: string;
}

export interface LandApplicationForm {
  nationalCode: string;
  fullName: string;
  fatherName: string;
  mobile: string;
  county: string;
  childrenCount: number;
  maritalStatus: 'married' | 'head_of_household' | 'single';
  yazdResidencyYears: number;
  targetProject: string;
  nationalCodeVerified: boolean;
}

