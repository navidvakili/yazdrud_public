export type ActivePage = 'home' | 'news' | 'land-allocation' | 'urban-planning' | 'roads-transport' | 'services';

export interface NewsComment {
  id: number;
  author_name: string;
  content: string;
  created_at: string;
}

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
  comments_enabled: boolean;
  comments_count: number;
  comments?: NewsComment[];
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
  roadProgress: number;
  housingProgress: number;
  urbanProgress: number;
  hasActiveRoadProject: boolean;
  hasHousingWorkshop?: boolean;
  description: string;
}

/** Response type from the backend county-projects API */
export interface CountyProjectResponse {
  id: number;
  county_id: string;
  county_name: string;
  road_projects_count: number;
  housing_units_count: number;
  urban_plans_count: number;
  road_progress: number;
  housing_progress: number;
  urban_progress: number;
  has_active_road_project: boolean;
  has_housing_workshop: boolean;
  description: string | null;
  is_active: boolean;
}

export interface InquiryResult {
  status: 'passed' | 'failed' | 'not_found';
  message: string;
  nationalId: string;
  fullName?: string;
  date?: string;
}

/** Response type from the backend hero-slides API */
export interface HeroSlide {
  id: number;
  tag: string;
  title: string;
  subtitle: string;
  badge: string;
  badge_icon: string;
  bg_image: string | null;
  primary_cta_text: string;
  primary_cta_target: string;
  secondary_cta_text: string;
  secondary_cta_target: string;
  sort_order: number;
  is_active: boolean;
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

