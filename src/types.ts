export type ActivePage = 'home' | 'news' | 'land-allocation' | 'urban-planning' | 'roads-transport' | 'services';

export interface NewsItem {
  id: number;
  title: string;
  summary: string;
  content: string;
  date: string;
  category: 'مسکن' | 'راه' | 'شهرسازی' | 'سازمانی' | 'مناقصات' | 'بازآفرینی';
  image: string;
  views: number;
  author?: string;
  code?: string;
  tags?: string[];
  gallery?: string[];
  pdfAttachment?: string;
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

