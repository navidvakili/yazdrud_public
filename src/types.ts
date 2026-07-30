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

// ============================================================
// Slider Studio Types (duplicated from frontend for public site)
// ============================================================

export type AnimationPreset =
  | 'fadeIn'
  | 'slideUp'
  | 'slideDown'
  | 'slideLeft'
  | 'slideRight'
  | 'zoomIn'
  | 'zoomOut'
  | 'rotateIn'
  | 'bounceIn'
  | 'typewriter'
  | 'none';

export type AnimationEasing = 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'bounce' | 'elastic';

export type InteractionTrigger = 'click' | 'hover' | 'scroll' | 'slideLoad';

export type InteractionActionType =
  | 'link'
  | 'jumpSlide'
  | 'toggleAnimation'
  | 'playVideo'
  | 'changeStyle';

export interface LayerInteraction {
  id: string;
  trigger: InteractionTrigger;
  action: InteractionActionType;
  targetUrl?: string;
  openInNewTab?: boolean;
  targetSlideId?: string;
  targetLayerId?: string;
  customJs?: string;
}

export interface LayerAnimation {
  inPreset: AnimationPreset;
  inDuration: number;
  inDelay: number;
  inEasing: AnimationEasing;
  outPreset: AnimationPreset;
  outDuration: number;
  outDelay: number;
  hoverEffect?: 'scale' | 'lift' | 'glow' | 'tilt' | 'none';
  parallaxDepth?: number;
}

export interface Layer {
  id: string;
  name: string;
  type: 'text' | 'image' | 'button' | 'video' | 'svg' | 'shape' | 'group' | 'customHtml';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  zIndex: number;
  locked: boolean;
  visible: boolean;
  groupId?: string;
  content: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: string | number;
  fontStyle: 'normal' | 'italic';
  textAlign: 'right' | 'center' | 'left' | 'justify';
  alignVertical?: 'top' | 'center' | 'bottom';
  color: string;
  backgroundColor: string;
  backgroundGradient?: string;
  backgroundOpacity?: number;
  borderRadius: number;
  borderWidth: number;
  borderColor: string;
  padding: string;
  shadow: string;
  animation: LayerAnimation;
  interactions: LayerInteraction[];
  responsiveOverrides?: Record<string, { x?: number; y?: number; width?: number; height?: number; fontSize?: number; hidden?: boolean }>;
}

export interface SlideBackground {
  type: 'color' | 'gradient' | 'image' | 'video' | 'particles';
  color: string;
  gradient: string;
  imageUrl?: string;
  videoUrl?: string;
  particlesPreset?: 'stars' | 'bubbles' | 'snow' | 'geometric' | 'waves';
}

export interface Slide {
  id: string;
  title: string;
  duration: number;
  background: SlideBackground;
  layers: Layer[];
  transition: 'fade' | 'slideLeft' | 'slideRight' | 'zoomOut' | '3dCube';
  interactions?: LayerInteraction[];
}

export interface SliderProject {
  id: string;
  title: string;
  description: string;
  width: number;
  height: number;
  autoPlay: boolean;
  loop: boolean;
  scrollSnap: boolean;
  addonParticles: boolean;
  addonWave: boolean;
  addonTextMorph: boolean;
  slides: Slide[];
}

