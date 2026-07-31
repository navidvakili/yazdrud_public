import { useState, useMemo, useEffect, useCallback } from 'react';
import { fetchCountyProjects } from '../api';
import { CountyData, CountyProjectResponse } from '../types';

interface MapProps {
  fontSizeScale: number;
}

/** SVG position & label data for each county (frontend-only, not from backend) */
const COUNTY_META: Record<string, { x: number; y: number }> = {
  yazd:     { x: 268, y: 212 },
  meybod:   { x: 186, y: 191 },
  ardakan:  { x: 265, y: 120 },
  bafq:     { x: 393, y: 234 },
  mehriz:   { x: 287, y: 270 },
  taft:     { x: 195, y: 278 },
  abarkuh:  { x: 153, y: 303 },
  ashkezar: { x: 224, y: 194 },
  behabad:  { x: 446, y: 208 },
  khatam:   { x: 231, y: 401 },
  zarch:    { x: 270, y: 189 },
  marvast:  { x: 258, y: 463 },
};

/** Transform backend API response to the component's CountyData format */
function transformApiData(apiData: CountyProjectResponse[]): CountyData[] {
  return apiData
    .filter((item) => item.is_active)
    .map((item) => {
      const meta = COUNTY_META[item.county_id];
      return {
        id: item.county_id,
        name: item.county_name,
        x: meta?.x ?? 0,
        y: meta?.y ?? 0,
        roadProjects: item.road_projects_count,
        housingUnits: item.housing_units_count,
        urbanPlans: item.urban_plans_count,
        roadProgress: item.road_progress,
        housingProgress: item.housing_progress,
        urbanProgress: item.urban_progress,
        hasActiveRoadProject: item.has_active_road_project,
        hasHousingWorkshop: item.has_housing_workshop,
        description: item.description || '',
      };
    });
}

// مسیرهای واقعی مرز شهرستان‌ها (استخراج‌شده از نقشه ویکی‌پدیا)
// ساده‌سازی‌شده با الگوریتم Douglas-Peucker و نرمال‌سازی به viewBox 600×520
const COUNTY_PATHS: Record<string, { d: string; cx: number; cy: number }> = {
  ashkezar: {
    d: "M186.7 212.5 L188.2 202.5 L198.3 184.5 L208.7 181.6 L215 177.8 L217.1 182 L226.4 180.4 L233.9 177.6 L238.2 170.2 L256.8 166 L268.5 180.5 L256.4 184.5 L244.2 193.6 L243.1 195.1 L244 196.3 L240 201.4 L238.3 212 L239.7 216 L243.6 218.1 L235.4 224.2 L231 225.6 L227.2 225 Z",
    cx: 224, cy: 194,
  },
  yazd: {
    d: "M240.6 202.5 L246.8 204.5 L249.5 197.4 L253.6 197.2 L254.3 194.3 L257.9 191.6 L266.8 187.8 L276.4 186.8 L281.1 196.8 L298 198.2 L305.8 200.4 L311.7 211.2 L305.3 222.4 L303.8 228.9 L298.7 226.2 L291.3 225.5 L282.9 227.8 L267.3 228.3 L264.3 229.5 L266.7 237.6 L254.4 234.4 L248.5 230.5 L252.6 219.3 L243.1 218 L239.4 215.6 L238.3 212 L240.6 202.6 Z",
    cx: 268, cy: 212,
  },
  taft: {
    d: "M193.3 310.1 L195.3 308.4 L195.1 306 L191.6 305.5 L193 304.3 L188.7 302 L189.2 300.8 L182.1 294.5 L177.5 295 L178.4 292.9 L174.7 294.2 L171.8 292.1 L170.5 294.2 L168.3 283.6 L161.6 285.1 L151.3 283.8 L137.8 260.5 L140.6 259.2 L139 258.4 L139.8 255.5 L131.6 249 L152.8 246.2 L161 247.4 L164.6 244.9 L170.1 233.9 L176.5 229.6 L171.8 218.8 L184.4 210.6 L186.7 212.7 L230.7 225.6 L238.7 222.6 L243.6 218.1 L252.6 219.3 L248.8 230.3 L243.7 237.4 L237.2 252.4 L237.3 254.6 L240.9 257.9 L252.1 260 L249.1 268.3 L249.5 276.5 L234.8 280.3 L234.2 322 L221.5 322.1 L217.2 326 L202.4 326.6 L201.6 323.4 L198.8 323.7 L199.8 320.6 L194.7 319.5 L195.9 315.7 L194.1 316.9 L192.7 315.9 L196.3 315.6 L196.8 312.5 L193.9 312.4 L193.3 310.2 Z",
    cx: 195.3, cy: 278.3,
  },
  bafq: {
    d: "M441.5 240.3 L451.1 237.4 L452.6 239.5 L458.6 241.8 L464 250.3 L453.3 248 L443.3 256.9 L433.5 276.1 L428.2 278.9 L421.9 286.1 L361.8 306.8 L358.2 296.8 L351.1 290.4 L347.9 284.7 L338.5 254.1 L326 243.3 L303.8 228.9 L305.3 222.4 L311.7 211.2 L305.8 200.4 L316.2 190.4 L324.2 185.9 L384 169.7 L385.3 171.8 L386.7 188.4 L389.5 194.2 L395.6 197.9 L415.8 204.6 L413.4 212.7 L417.9 223.9 L420.4 223.7 L430.1 216.9 L438.4 231 L441 232.9 L441.4 240.4 Z",
    cx: 393.1, cy: 233.7,
  },
  ardakan: {
    d: "M166.7 155.9 L163.2 153 L160.1 155 L153.9 161.9 L135.8 174 L113.5 194.4 L114.5 187.7 L112.7 131.7 L109.1 124 L115.1 125 L129.9 115.1 L142.6 109.8 L160.4 116.2 L184.9 102.9 L232.7 83.4 L232.3 82 L240.5 77.9 L248.8 71.1 L253.8 58.9 L260 54.9 L271 51.5 L302.3 54.9 L306.3 43.6 L310.6 40.7 L318.7 41.2 L328.4 47.2 L338.9 34.2 L351.6 22.8 L359.4 18.8 L367.9 18.6 L371.5 15 L372.9 15.9 L401.7 68.4 L414.6 82.4 L433 93.2 L430.3 96.4 L442.2 100.5 L455.4 110.5 L473.5 130.7 L411.3 161.8 L360.3 176.8 L326.1 185.2 L313.4 192.9 L310.6 180.2 L299.8 176.9 L296 169.7 L291.4 165.1 L284.4 166.8 L275.9 173.9 L266.9 177.9 L256.9 166.1 L266.6 158.9 L262.7 152.6 L245.1 157 L229.1 155.4 L222.9 157.5 L222.6 159.2 L222.1 157.6 L216.2 157.2 L208.4 153.6 L189.1 159.4 L179.1 159 L173.8 156.3 L166.8 156 Z",
    cx: 265.3, cy: 119.6,
  },
  zarch: {
    d: "M240.6 202.1 L244 196.3 L243.1 195.1 L248.4 189.9 L257.2 184.2 L268.5 180.5 L266.9 177.9 L275.9 173.9 L288.5 165.1 L292.8 165.9 L299.8 176.9 L310.6 180.2 L313.4 192.9 L305.8 200.4 L298 198.2 L281.1 196.8 L276.4 186.8 L266.8 187.8 L257.9 191.6 L254.3 194.3 L253.6 197.2 L249.5 197.4 L246.8 204.5 L240.7 202.2 Z",
    cx: 270, cy: 189.1,
  },
  abarkuh: {
    d: "M193.3 310.3 L194.5 312.7 L196.8 311.8 L196.5 315.2 L192.7 315.9 L194.1 316.9 L195.9 315.7 L194.7 319.5 L199.8 320.6 L198.8 323.7 L201.6 323.4 L202.4 326.6 L217.2 326 L203.6 356.4 L201.3 368.2 L189.6 363 L165.3 360.2 L158.2 356.8 L149.9 343.7 L143.6 341.8 L121.8 328.7 L108.3 322.9 L108.2 321.3 L102.3 321.3 L104 320.1 L102.7 318.7 L105.4 318.9 L103.3 317.6 L105.4 318.2 L106.4 303.4 L97.1 304.2 L90 296.8 L92.1 293.9 L100.6 291.3 L103.7 284.3 L104.1 278.1 L99.1 267.8 L94.9 266.5 L87.8 260 L109 258.5 L127.9 248.3 L131.6 249 L133.3 251.6 L138.5 253.4 L140 255.8 L139 258.4 L140.6 258.9 L137.8 260.5 L151.3 283.8 L161.6 285.1 L168.3 283.6 L170.5 294.2 L171.8 292.1 L174.7 294.2 L178.4 292.9 L177.5 295 L182.1 294.5 L189.2 300.8 L188.7 302 L193 304.3 L191.6 305.5 L195.1 306 L195.3 308.4 L193.3 310.3 Z",
    cx: 153.2, cy: 303.3,
  },
  khatam: {
    d: "M217.5 448.4 L212.9 445.6 L208 440 L207.5 432.3 L205 430.3 L209.6 426.7 L205 424 L206.9 422.6 L208.5 423.3 L209 421.6 L210.5 423.2 L212.4 407.6 L211 407.4 L208.5 398.4 L209.5 390.6 L201.1 372.5 L202.5 359.8 L214.2 330.8 L221.5 322.1 L278.1 321.8 L279.7 337 L278.8 341.2 L282.9 368.7 L282.3 375.1 L278.7 383.3 L260.9 401.8 L264.3 408.2 L273 415.8 L256.9 418.1 L231.4 425.9 L223.5 433.3 L223.1 440 L217.6 448.5 Z",
    cx: 231, cy: 401,
  },
  marvast: {
    d: "M285 490.3 L285.9 502.2 L274.8 499.4 L271.7 501.2 L265 501 L247.7 505 L244.9 503.6 L233.2 481.3 L230.5 479.7 L230.5 455.9 L227.3 455.7 L217.6 448.5 L223.1 440 L223.5 433.3 L232.5 425.3 L261.3 417.1 L273 415.8 L278.1 417.6 L280.3 423.6 L279.3 438.2 L281.5 455.9 L280.5 463.7 L283.3 472.1 L284.4 486.1 Z",
    cx: 258, cy: 463,
  },
  meybod: {
    d: "M189 200.7 L186.7 212.6 L184.4 210.6 L171.8 218.8 L176.5 229.6 L170.2 233.8 L164.5 244.9 L161 247.4 L152.6 246.2 L133.7 249.3 L127.9 248.3 L130.8 246.3 L124.9 237.4 L113.7 226.3 L109.5 211 L113.5 194.4 L135.8 174 L153.9 161.9 L162.8 153.1 L168.1 156.8 L173.2 156.2 L178.2 158.9 L189 159.4 L207.9 153.6 L216.2 157.2 L222.1 157.6 L222.6 159.2 L222.9 157.5 L229.1 155.4 L245.1 157 L262.7 152.6 L266.6 158.9 L256.7 166.2 L238.1 170.3 L232.9 178.3 L217.1 182 L215 177.8 L208.7 181.6 L198.3 184.5 L189.1 200.5 Z",
    cx: 185.6, cy: 190.7,
  },
  behabad: {
    d: "M506.4 189 L502.9 229.6 L489.2 235.7 L464 250.3 L458.6 241.8 L452.6 239.5 L451.1 237.4 L441.4 240.4 L441 232.9 L438.4 231 L430.1 216.9 L420.4 223.7 L417.6 223.6 L413.4 212.7 L415.8 204.6 L395.6 197.9 L388.7 193.1 L386.7 188.4 L384.2 169.7 L411.3 161.8 L473.5 130.7 L512.2 179 L508.1 184 L506.4 189 Z",
    cx: 446.2, cy: 208.4,
  },
  mehriz: {
    d: "M273.3 321.4 L234.2 321.9 L234.8 280.2 L249.5 276.5 L249.1 268.3 L252.1 260 L240.9 257.9 L237.1 254.3 L237.2 252.2 L243.8 237.3 L248.5 230.5 L254.4 234.4 L266.7 237.6 L264.3 229.5 L282.9 227.8 L291.3 225.5 L298.7 226.2 L303.8 228.9 L326 243.3 L338.1 253.7 L340.5 257.7 L347.9 284.7 L351.1 290.4 L358.2 296.8 L361.8 306.8 L349.9 311.7 L320.9 319.1 L299.5 314.2 L278.1 321.8 L275.1 321.4 Z",
    cx: 287, cy: 269.7,
  },
};

// رنگ‌های پیش‌فرض شهرستان‌ها بر اساس موقعیت جغرافیایی
const COUNTY_FILLS: Record<string, { default: string; hover: string; selected: string }> = {
  yazd:      { default: '#E8D0E5', hover: '#2A9D8F', selected: '#1F3A5F' },
  meybod:    { default: '#DBECCB', hover: '#2A9D8F', selected: '#1F3A5F' },
  ashkezar:  { default: '#FDFAD4', hover: '#2A9D8F', selected: '#1F3A5F' },
  ardakan:   { default: '#E8D0E5', hover: '#2A9D8F', selected: '#1F3A5F' },
  taft:      { default: '#E8D0E5', hover: '#2A9D8F', selected: '#1F3A5F' },
  abarkuh:   { default: '#FBD0D1', hover: '#2A9D8F', selected: '#1F3A5F' },
  khatam:    { default: '#FDFAD4', hover: '#2A9D8F', selected: '#1F3A5F' },
  bafq:      { default: '#FDFAD4', hover: '#2A9D8F', selected: '#1F3A5F' },
  behabad:   { default: '#DBECCB', hover: '#2A9D8F', selected: '#1F3A5F' },
  mehriz:    { default: '#FBD0D1', hover: '#2A9D8F', selected: '#1F3A5F' },
  zarch:     { default: '#DBECCB', hover: '#2A9D8F', selected: '#1F3A5F' },
  marvast:   { default: '#FDFAD4', hover: '#2A9D8F', selected: '#1F3A5F' },
};

export default function Map({ fontSizeScale }: MapProps) {
  const [hoveredCounty, setHoveredCounty] = useState<CountyData | null>(null);
  const [selectedCounty, setSelectedCounty] = useState<CountyData | null>(null);
  const [countiesData, setCountiesData] = useState<CountyData[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  // Fetch county projects from backend API
  const loadData = useCallback(async () => {
    setDataLoading(true);
    setDataError(null);
    try {
      const response = await fetchCountyProjects<{ data: CountyProjectResponse[] }>();
      const transformed = transformApiData(response.data);
      setCountiesData(transformed);
      // Set first county as default selection
      if (transformed.length > 0 && !selectedCounty) {
        setSelectedCounty(transformed[0]);
      }
    } catch (err: any) {
      console.error('Failed to load county projects:', err);
      setDataError('خطا در دریافت اطلاعات');
    } finally {
      setDataLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Re-select first county if data changes and selection is gone
  useEffect(() => {
    if (countiesData.length > 0) {
      const stillExists = countiesData.find((c) => c.id === selectedCounty?.id);
      if (!stillExists) {
        setSelectedCounty(countiesData[0]);
      }
    }
  }, [countiesData]); // eslint-disable-line react-hooks/exhaustive-deps

  // Label offset positions for each county (dx, dy from centroid)
  const labelOffsets: Record<string, { dx: number; dy: number }> = useMemo(() => ({
    yazd:     { dx: 0, dy: 22 },
    meybod:   { dx: -15, dy: -20 },
    ashkezar: { dx: 0, dy: -25 },
    zarch:    { dx: 10, dy: -22 },
    ardakan:  { dx: 0, dy: -25 },
    taft:     { dx: -20, dy: -20 },
    abarkuh:  { dx: 0, dy: -18 },
    khatam:   { dx: 0, dy: -25 },
    marvast:  { dx: 0, dy: -22 },
    bafq:     { dx: 0, dy: -22 },
    behabad:  { dx: 0, dy: -18 },
    mehriz:   { dx: 0, dy: -20 },
  }), []);

  return (
    <section
      id="interactive-map"
      className="py-16 px-4 bg-gradient-to-b from-[#E7D3B1] via-[#F2E6D1] to-[#E7D3B1] relative overflow-hidden"
      style={{ fontSize: `${16 * fontSizeScale}px` }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Title Section */}
        <div className="text-center mb-12">
          <span className="text-[#2A9D8F] font-bold text-sm tracking-widest block mb-2 uppercase">
            🗺️ رصدخانه برخط توسعه و عمران
          </span>
          <h3 className="text-3xl font-black text-[#1F3A5F] flex items-center justify-center gap-2">
            <i className="fa-solid fa-map-location-dot text-[#B76E4C]"></i>
            <span>نقشه تعاملی پروژه‌های عمرانی استان یزد</span>
          </h3>
          <p className="text-gray-600 text-sm font-semibold max-w-xl mx-auto mt-3">
            برای مشاهده جزئیات پروژه‌های مسکن ملی، طول راه‌های در دست احداث و طرح‌های تفصیلی مصوب،
            روی شهرستان مورد نظر کلیک کنید.
          </p>
          <div className="w-24 h-1 bg-[#1F3A5F] mx-auto mt-4 rounded-full"></div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Interactive Map */}
          <div className="lg:col-span-7 glass-panel rounded-3xl p-6 border border-white/40 shadow-xl relative flex flex-col items-center">
            {/* Legend */}
            <div className="absolute top-4 right-4 bg-white/85 backdrop-blur-md border border-white/50 rounded-xl p-3 shadow-md text-[10px] space-y-1.5 z-10 font-bold text-[#1F3A5F]">
              <span className="text-[#1F3A5F] font-bold block border-b pb-1 mb-1">راهنمای نقشه:</span>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500 animate-ping"></span>
                <span>پروژه‌های فعال راه‌سازی</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#1F3A5F]"></span>
                <span>کارگاه انبوه‌سازی مسکن ملی</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-[#2A9D8F] border border-[#1F3A5F] rounded-sm"></span>
                <span>شهرستان انتخاب‌شده</span>
              </div>
            </div>

            {/* Map Container */}
            <div className="relative w-full max-w-[600px] h-[480px] sm:h-[520px] flex items-center justify-center">
              <svg
                viewBox="0 0 600 520"
                className="w-full h-full drop-shadow-2xl"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Grid Background (subtle) */}
                {[100, 200, 300, 400, 500].map((x) => (
                  <line key={`v-${x}`} x1={x} y1="0" x2={x} y2="520" stroke="#C98A5A" strokeWidth="0.4" strokeOpacity="0.07" />
                ))}
                {[100, 200, 300, 400].map((y) => (
                  <line key={`h-${y}`} x1="0" y1={y} x2="600" y2={y} stroke="#C98A5A" strokeWidth="0.4" strokeOpacity="0.07" />
                ))}

                {/* County Polygon Paths - Real Geographic Boundaries */}
                {countiesData.map((county) => {
                  const pathData = COUNTY_PATHS[county.id];
                  if (!pathData) return null;

                  const isHovered = hoveredCounty?.id === county.id;
                  const isSelected = selectedCounty?.id === county.id;
                  const fills = COUNTY_FILLS[county.id] || COUNTY_FILLS.yazd;

                  return (
                    <path
                      key={`county-path-${county.id}`}
                      d={pathData.d}
                      fill={isSelected ? fills.selected : isHovered ? fills.hover : fills.default}
                      fillOpacity={isSelected ? 0.92 : isHovered ? 0.85 : 0.65}
                      stroke={isSelected ? '#2A9D8F' : isHovered ? '#2A9D8F' : '#C98A5A'}
                      strokeWidth={isSelected ? 2.5 : isHovered ? 2 : 1.2}
                      strokeLinejoin="round"
                      className="cursor-pointer transition-all duration-300"
                      style={{
                        filter: isSelected
                          ? 'drop-shadow(0 0 8px rgba(42,157,143,0.4))'
                          : isHovered
                          ? 'drop-shadow(0 0 5px rgba(42,157,143,0.3))'
                          : 'drop-shadow(0 1px 2px rgba(0,0,0,0.08))',
                      }}
                      onMouseEnter={() => setHoveredCounty(county)}
                      onMouseLeave={() => setHoveredCounty(null)}
                      onClick={() => setSelectedCounty(county)}
                    />
                  );
                })}

                {/* County Markers and Labels */}
                {countiesData.map((county) => {
                  const pathData = COUNTY_PATHS[county.id];
                  if (!pathData) return null;

                  const cx = pathData.cx;
                  const cy = pathData.cy;
                  const isHovered = hoveredCounty?.id === county.id;
                  const isSelected = selectedCounty?.id === county.id;
                  const offset = labelOffsets[county.id] || { dx: 0, dy: -20 };

                  return (
                    <g
                      key={`marker-${county.id}`}
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredCounty(county)}
                      onMouseLeave={() => setHoveredCounty(null)}
                      onClick={() => setSelectedCounty(county)}
                    >
                      {/* Pulse ring for active road project */}
                      {county.hasActiveRoadProject && (
                        <circle
                          cx={cx}
                          cy={cy}
                          r={isSelected ? 12 : 10}
                          fill="none"
                          stroke="#EF4444"
                          strokeWidth="1.5"
                          strokeOpacity="0.5"
                        >
                          <animate attributeName="r" from={isSelected ? 12 : 10} to={isSelected ? 20 : 16} dur="1.8s" repeatCount="indefinite" />
                          <animate attributeName="stroke-opacity" from="0.5" to="0" dur="1.8s" repeatCount="indefinite" />
                        </circle>
                      )}

                      {/* Housing workshop marker (dark blue circle) */}
                      {county.hasHousingWorkshop && (
                        <circle
                          cx={cx}
                          cy={cy}
                          r={county.hasActiveRoadProject ? (isSelected ? 4.5 : 3.5) : (isSelected ? 6 : isHovered ? 5 : 3.5)}
                          fill="#1F3A5F"
                          stroke="white"
                          strokeWidth={isSelected ? 1.5 : 1}
                          className="transition-all duration-300"
                        />
                      )}

                      {/* Marker dot */}
                      {!county.hasHousingWorkshop && (
                        <circle
                          cx={cx}
                          cy={cy}
                          r={isSelected ? 6 : isHovered ? 5 : 3.5}
                          fill={isSelected ? '#2A9D8F' : isHovered ? '#2A9D8F' : '#B76E4C'}
                          stroke="white"
                          strokeWidth={isSelected ? 2 : 1.5}
                          className="transition-all duration-300"
                          style={{
                            filter: isSelected ? 'drop-shadow(0 0 4px rgba(42,157,143,0.6))' : 'none',
                          }}
                        />
                      )}

                      {/* County Name Label */}
                      <text
                        x={cx + offset.dx}
                        y={cy + offset.dy}
                        textAnchor="middle"
                        className="select-none pointer-events-none transition-all duration-300"
                        style={{
                          fontSize: isSelected ? '13px' : isHovered ? '12px' : '11px',
                          fontWeight: isSelected ? 900 : 700,
                          fill: isSelected ? '#1F3A5F' : isHovered ? '#2A9D8F' : '#3A3A3A',
                          direction: 'rtl',
                          textShadow: '0 1px 3px rgba(255,255,255,0.9), 0 -1px 3px rgba(255,255,255,0.9), 1px 0 3px rgba(255,255,255,0.9), -1px 0 3px rgba(255,255,255,0.9)',
                        }}
                      >
                        {county.name}
                      </text>

                      {/* Leader line from label to marker */}
                      {(Math.abs(offset.dx) > 5 || Math.abs(offset.dy) > 15) && (
                        <line
                          x1={cx}
                          y1={cy - 4}
                          x2={cx + offset.dx}
                          y2={cy + offset.dy + 4}
                          stroke={isSelected ? '#2A9D8F' : '#C98A5A'}
                          strokeWidth="0.6"
                          strokeOpacity="0.4"
                          strokeDasharray="2 2"
                        />
                      )}

                      {/* Housing icon for large projects */}
                      {county.housingUnits > 1500 && (
                        <text
                          x={cx + 10}
                          y={cy + 2}
                          className="text-[9px] select-none pointer-events-none"
                          style={{ fill: '#1F3A5F' }}
                        >
                          🏗️
                        </text>
                      )}
                    </g>
                  );
                })}

                {/* Compass Rose - Professional */}
                <g transform="translate(48, 48)">
                  <circle cx="0" cy="0" r="22" fill="white" fillOpacity="0.75" stroke="#C98A5A" strokeWidth="1.2" />
                  <circle cx="0" cy="0" r="16" fill="none" stroke="#C98A5A" strokeWidth="0.6" strokeOpacity="0.4" />
                  <polygon points="0,-14 -4.5,2 0,-2 4.5,2" fill="#1F3A5F" />
                  <polygon points="0,14 -3.5,-1 0,2 3.5,-1" fill="#C98A5A" fillOpacity="0.7" />
                  <text x="0" y="-17" textAnchor="middle" className="text-[8px] font-black fill-[#1F3A5F]">N</text>
                  <text x="0" y="22" textAnchor="middle" className="text-[7px] font-bold fill-[#6B5B4F]">جنوب</text>
                </g>

                {/* Scale Bar - 0, 25km, 50km, 100km */}
                <g transform="translate(40, 495)">
                  <rect x="-4" y="-8" width="148" height="22" rx="4" fill="white" fillOpacity="0.7" />
                  <line x1="0" y1="0" x2="130" y2="0" stroke="#3A3A3A" strokeWidth="1.8" />
                  <line x1="0" y1="-4" x2="0" y2="4" stroke="#3A3A3A" strokeWidth="1.8" />
                  <line x1="32.5" y1="-3" x2="32.5" y2="3" stroke="#3A3A3A" strokeWidth="1.2" />
                  <line x1="65" y1="-3" x2="65" y2="3" stroke="#3A3A3A" strokeWidth="1.4" />
                  <line x1="130" y1="-4" x2="130" y2="4" stroke="#3A3A3A" strokeWidth="1.8" />
                  <text x="0" y="14" textAnchor="middle" className="text-[7px] fill-[#3A3A3A] font-bold">۰</text>
                  <text x="32.5" y="14" textAnchor="middle" className="text-[7px] fill-[#3A3A3A] font-bold">۲۵</text>
                  <text x="65" y="14" textAnchor="middle" className="text-[7px] fill-[#3A3A3A] font-bold">۵۰</text>
                  <text x="130" y="14" textAnchor="middle" className="text-[7px] fill-[#3A3A3A] font-bold">۱۰۰ کم</text>
                </g>
              </svg>
            </div>

            <p className="text-[11px] font-semibold text-gray-500 mt-3 flex items-center gap-1">
              <i className="fa-solid fa-circle-info text-[#2A9D8F]"></i>
              <span>با کلیک روی هر شهرستان، آمار دقیق آن نمایش داده می‌شود</span>
            </p>
          </div>

          {/* Right Column: Dashboard (بدون تغییر) */}
          <div className="lg:col-span-5 glass-panel-dark rounded-3xl p-6 border border-white/15 shadow-2xl text-white min-h-[420px] flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -top-10 -right-10 opacity-5 pointer-events-none text-9xl">
              <i className="fa-solid fa-map"></i>
            </div>

            {selectedCounty ? (
              <div className="space-y-5 animate-fade-in-up relative z-10">
                <div className="border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2.5 h-6 bg-[#2A9D8F] rounded-sm"></span>
                    <h4 className="text-xl font-black text-[#E7D3B1]">شهرستان {selectedCounty.name}</h4>
                  </div>
                  <p className="text-xs text-gray-300 font-medium leading-relaxed">
                    {selectedCounty.description}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white/5 rounded-xl p-3 border border-white/5 text-center hover:bg-white/10 transition-colors">
                    <i className="fa-solid fa-road text-[#B76E4C] text-lg mb-1 block"></i>
                    <strong className="text-lg font-black font-mono block text-[#E7D3B1]">
                      {selectedCounty.roadProjects.toLocaleString('fa-IR')}
                    </strong>
                    <span className="text-[9px] text-gray-300 font-bold block">طرح راه‌سازی</span>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 border border-white/5 text-center hover:bg-white/10 transition-colors">
                    <i className="fa-solid fa-hotel text-[#2A9D8F] text-lg mb-1 block"></i>
                    <strong className="text-lg font-black font-mono block text-white">
                      {selectedCounty.housingUnits.toLocaleString('fa-IR')}
                    </strong>
                    <span className="text-[9px] text-gray-300 font-bold block">واحد مسکن</span>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 border border-white/5 text-center hover:bg-white/10 transition-colors">
                    <i className="fa-solid fa-file-invoice text-[#C98A5A] text-lg mb-1 block"></i>
                    <strong className="text-lg font-black font-mono block text-[#E7D3B1]">
                      {selectedCounty.urbanPlans.toLocaleString('fa-IR')}
                    </strong>
                    <span className="text-[9px] text-gray-300 font-bold block">طرح تفصیلی</span>
                  </div>
                </div>

                <div className="space-y-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                  <span className="text-xs font-bold text-[#E7D3B1] block">شاخص پیشرفت پروژه‌ها</span>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold">
                      <span className="text-gray-300">راه‌سازی و بزرگراه</span>
                      <span className="font-mono text-[#E7D3B1]">
                        {selectedCounty.roadProgress.toLocaleString('fa-IR')}٪
                      </span>
                    </div>
                    <div className="w-full bg-white/15 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#B76E4C] h-full rounded-full transition-all duration-1000" style={{ width: `${selectedCounty.roadProgress}%` }}></div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold">
                      <span className="text-gray-300">مسکن ملی</span>
                      <span className="font-mono text-white">
                        {selectedCounty.housingProgress.toLocaleString('fa-IR')}٪
                      </span>
                    </div>
                    <div className="w-full bg-white/15 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#2A9D8F] h-full rounded-full transition-all duration-1000" style={{ width: `${selectedCounty.housingProgress}%` }}></div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold">
                      <span className="text-gray-300">شهرسازی و طرح‌های تفصیلی</span>
                      <span className="font-mono text-[#E7D3B1]">
                        {selectedCounty.urbanProgress.toLocaleString('fa-IR')}٪
                      </span>
                    </div>
                    <div className="w-full bg-white/15 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#C98A5A] h-full rounded-full transition-all duration-1000" style={{ width: `${selectedCounty.urbanProgress}%` }}></div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => alert(`ثبت نام یا بررسی اراضی شهرستان ${selectedCounty.name} از طریق میز خدمت بخش خدمات الکترونیک قابل اقدام است.`)}
                  className="w-full py-3 rounded-xl bg-[#2A9D8F] hover:bg-[#2A9D8F]/90 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-lg hover:shadow-xl cursor-pointer group"
                >
                  <i className="fa-solid fa-file-shield group-hover:scale-110 transition-transform"></i>
                  <span>درخواست تخصیص اراضی در {selectedCounty.name}</span>
                </button>
              </div>
            ) : dataLoading ? (
              <div className="flex flex-col items-center justify-center text-center h-full text-gray-400 space-y-2 relative z-10">
                <div className="w-8 h-8 border-2 border-gray-400 border-t-white rounded-full animate-spin"></div>
                <p className="text-xs font-bold">در حال بارگذاری...</p>
              </div>
            ) : dataError ? (
              <div className="flex flex-col items-center justify-center text-center h-full text-gray-400 space-y-2 relative z-10">
                <i className="fa-solid fa-triangle-exclamation text-3xl text-red-400"></i>
                <p className="text-xs font-bold">{dataError}</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center h-full text-gray-400 space-y-2 relative z-10">
                <i className="fa-solid fa-map-marked-alt text-4xl text-gray-500 animate-pulse"></i>
                <p className="text-xs font-bold">برای مشاهده آمار، شهرستان را انتخاب کنید</p>
              </div>
            )}

            <div className="border-t border-white/10 pt-3 mt-4 text-[10px] text-gray-400 font-mono flex justify-between relative z-10">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                بروزرسانی: امروز
              </span>
              <span>روابط عمومی راه و شهرسازی یزد</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.4s ease-out;
        }
        .glass-panel {
          background: rgba(255, 255, 255, 0.25);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }
        .glass-panel-dark {
          background: rgba(31, 58, 95, 0.85);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }
        @media (max-width: 768px) {
          .glass-panel-dark {
            background: rgba(31, 58, 95, 0.95);
          }
        }
      `}</style>
    </section>
  );
}