import { useState } from 'react';
import { COUNTIES_DATA } from '../data';
import { CountyData } from '../types';

interface MapProps {
  fontSizeScale: number;
}

export default function Map({ fontSizeScale }: MapProps) {
  const [hoveredCounty, setHoveredCounty] = useState<CountyData | null>(null);
  const [selectedCounty, setSelectedCounty] = useState<CountyData | null>(COUNTIES_DATA[0]);

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
            برای مشاهده جزئیات پروژه‌های مسکن ملی، طول راه‌های در دست احداث و طرح‌های تفصیلی مصوب، نشانگر را روی شهرستان مورد نظر قرار دهید.
          </p>
          <div className="w-24 h-1 bg-[#1F3A5F] mx-auto mt-4 rounded-full"></div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Interactive Map (7 Cols) */}
          <div className="lg:col-span-7 glass-panel rounded-3xl p-6 border border-white/40 shadow-xl relative flex flex-col items-center">
            
            {/* Legend Overlay */}
            <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-md border border-white/50 rounded-xl p-3 shadow-md text-[10px] space-y-1.5 z-10 font-bold text-[#1F3A5F]">
              <span className="text-[#1F3A5F] font-bold block border-b pb-1 mb-1">راهنمای نقشه:</span>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500 animate-ping"></span>
                <span>پروژه‌های فعال راه‌سازی</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#1F3A5F]"></span>
                <span>کارگاه انبوه‌سازی مسکن ملی</span>
              </div>
            </div>

            {/* Simulated Yazd Geography Outer Boundary & Interactive Hotspots */}
            <div className="relative w-full max-w-[500px] h-[400px] sm:h-[450px] flex items-center justify-center">
              
              {/* Main SVG Map Shape */}
              <svg
                viewBox="0 0 500 450"
                className="w-full h-full drop-shadow-2xl"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Simulated Geopolitical Outline of Yazd Province with warm sand color and tile patterns */}
                <path
                  d="M130 50 L180 30 L280 40 L380 90 L450 150 L460 210 L410 260 L380 300 L320 330 L270 420 L210 430 L160 380 L100 350 L50 310 L70 240 L100 150 L120 100 Z"
                  fill="#C98A5A"
                  fillOpacity="0.15"
                  stroke="#C98A5A"
                  strokeWidth="3.5"
                  strokeDasharray="2 4"
                />

                {/* Sub-boundaries schematic lines to represent counties divisions */}
                <path d="M180 30 L250 220" stroke="#C98A5A" strokeWidth="1" strokeOpacity="0.3" />
                <path d="M280 40 L250 220" stroke="#C98A5A" strokeWidth="1" strokeOpacity="0.3" />
                <path d="M380 90 L250 220" stroke="#C98A5A" strokeWidth="1" strokeOpacity="0.3" />
                <path d="M410 260 L250 220" stroke="#C98A5A" strokeWidth="1" strokeOpacity="0.3" />
                <path d="M320 330 L250 220" stroke="#C98A5A" strokeWidth="1" strokeOpacity="0.3" />
                <path d="M160 380 L250 220" stroke="#C98A5A" strokeWidth="1" strokeOpacity="0.3" />
                <path d="M100 150 L250 220" stroke="#C98A5A" strokeWidth="1" strokeOpacity="0.3" />

                {/* Map Grid Coordinates background */}
                <line x1="50" y1="0" x2="50" y2="450" stroke="#C98A5A" strokeWidth="0.5" strokeOpacity="0.1" />
                <line x1="150" y1="0" x2="150" y2="450" stroke="#C98A5A" strokeWidth="0.5" strokeOpacity="0.1" />
                <line x1="250" y1="0" x2="250" y2="450" stroke="#C98A5A" strokeWidth="0.5" strokeOpacity="0.1" />
                <line x1="350" y1="0" x2="350" y2="450" stroke="#C98A5A" strokeWidth="0.5" strokeOpacity="0.1" />
                <line x1="450" y1="0" x2="450" y2="450" stroke="#C98A5A" strokeWidth="0.5" strokeOpacity="0.1" />
                <line x1="0" y1="100" x2="500" y2="100" stroke="#C98A5A" strokeWidth="0.5" strokeOpacity="0.1" />
                <line x1="0" y1="200" x2="500" y2="200" stroke="#C98A5A" strokeWidth="0.5" strokeOpacity="0.1" />
                <line x1="0" y1="300" x2="500" y2="300" stroke="#C98A5A" strokeWidth="0.5" strokeOpacity="0.1" />
                <line x1="0" y1="400" x2="500" y2="400" stroke="#C98A5A" strokeWidth="0.5" strokeOpacity="0.1" />

                {/* Draw Counties Points and Nodes */}
                {COUNTIES_DATA.map((county) => {
                  const isHovered = hoveredCounty?.id === county.id;
                  const isSelected = selectedCounty?.id === county.id;
                  return (
                    <g
                      key={county.id}
                      className="cursor-pointer group"
                      onMouseEnter={() => setHoveredCounty(county)}
                      onMouseLeave={() => setHoveredCounty(null)}
                      onClick={() => setSelectedCounty(county)}
                    >
                      {/* Active ping ring for road development counties */}
                      {county.roadProjects > 15 && (
                        <circle
                          cx={county.x}
                          cy={county.y}
                          r={isSelected ? '20' : '12'}
                          className="fill-red-500/10 stroke-red-500/20 animate-ping"
                          strokeWidth="1.5"
                        />
                      )}

                      {/* Concentric Glow Circle */}
                      <circle
                        cx={county.x}
                        cy={county.y}
                        r={isSelected ? '14' : isHovered ? '10' : '7'}
                        className={`transition-all duration-300 ${
                          isSelected
                            ? 'fill-[#1F3A5F] stroke-[#2A9D8F] stroke-[3.5]'
                            : isHovered
                            ? 'fill-[#2A9D8F] stroke-[#1F3A5F] stroke-2'
                            : 'fill-[#C98A5A] stroke-white stroke-1.5'
                        }`}
                        style={{ filter: isSelected ? 'drop-shadow(0 0 6px rgba(42,157,143,0.5))' : '' }}
                      />

                      {/* Small inner core */}
                      <circle
                        cx={county.x}
                        cy={county.y}
                        r="3"
                        className="fill-white"
                      />

                      {/* County Label Text inside the map with responsive shift */}
                      <text
                        x={county.x}
                        y={county.y - 15}
                        textAnchor="middle"
                        className={`text-[11px] font-black select-none pointer-events-none transition-all ${
                          isSelected ? 'fill-[#1F3A5F] font-black scale-105' : 'fill-gray-700 font-bold'
                        }`}
                        style={{
                          textShadow: '0 1px 2px #fff, 0 -1px 2px #fff, 1px 0 2px #fff, -1px 0 2px #fff',
                        }}
                      >
                        {county.name}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Quick interactive note */}
            <p className="text-[11px] font-semibold text-gray-500 mt-2 flex items-center gap-1">
              <i className="fa-solid fa-circle-info text-[#2A9D8F]"></i>
              <span>با کلیک روی هر نقطه نقشه، داشبورد جزئیات آن شهرستان در کادر مقابل بارگذاری می‌شود.</span>
            </p>
          </div>

          {/* Right Column: County Statistics Dashboard (5 Cols) */}
          <div className="lg:col-span-5 glass-panel-dark rounded-3xl p-6 border border-white/15 shadow-2xl text-white min-h-[400px] flex flex-col justify-between relative overflow-hidden">
            {/* Yazd Traditional Tile SVG Overlay */}
            <div className="absolute top-2 left-2 opacity-5 pointer-events-none text-9xl">
              <i className="fa-solid fa-layer-group"></i>
            </div>

            {selectedCounty ? (
              <div className="space-y-6 animate-fade-in-up">
                
                {/* Header */}
                <div className="border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2.5 h-5 bg-[#2A9D8F] rounded-sm"></span>
                    <h4 className="text-xl font-black text-[#E7D3B1]">شهرستان {selectedCounty.name}</h4>
                  </div>
                  <p className="text-xs text-gray-300 font-medium leading-relaxed">
                    {selectedCounty.description}
                  </p>
                </div>

                {/* Big Stats Row */}
                <div className="grid grid-cols-3 gap-3">
                  {/* Stat 1 */}
                  <div className="bg-white/5 rounded-xl p-3 border border-white/5 text-center">
                    <i className="fa-solid fa-road text-[#B76E4C] text-lg mb-1 block"></i>
                    <strong className="text-lg font-black font-mono block text-[#E7D3B1]">
                      {selectedCounty.roadProjects.toLocaleString('fa-IR')}
                    </strong>
                    <span className="text-[9px] text-gray-300 font-bold block">طرح راه‌سازی</span>
                  </div>

                  {/* Stat 2 */}
                  <div className="bg-white/5 rounded-xl p-3 border border-white/5 text-center">
                    <i className="fa-solid fa-hotel text-[#2A9D8F] text-lg mb-1 block"></i>
                    <strong className="text-lg font-black font-mono block text-white">
                      {selectedCounty.housingUnits.toLocaleString('fa-IR')}
                    </strong>
                    <span className="text-[9px] text-gray-300 font-bold block">واحد مسکن ملی</span>
                  </div>

                  {/* Stat 3 */}
                  <div className="bg-white/5 rounded-xl p-3 border border-white/5 text-center">
                    <i className="fa-solid fa-file-invoice text-[#C98A5A] text-lg mb-1 block"></i>
                    <strong className="text-lg font-black font-mono block text-[#E7D3B1]">
                      {selectedCounty.urbanPlans.toLocaleString('fa-IR')}
                    </strong>
                    <span className="text-[9px] text-gray-300 font-bold block">طرح تفصیلی مصوب</span>
                  </div>
                </div>

                {/* Progress Indicators */}
                <div className="space-y-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                  <span className="text-xs font-bold text-[#E7D3B1] block mb-1">شاخص پیشرفت پروژه‌های محلی</span>
                  
                  {/* Road progress */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold">
                      <span className="text-gray-300">آماده‌سازی بزرگراهی و راه‌های فرعی</span>
                      <span className="font-mono text-[#E7D3B1]">۸۲٪</span>
                    </div>
                    <div className="w-full bg-white/15 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#B76E4C] h-full rounded-full" style={{ width: '82%' }}></div>
                    </div>
                  </div>

                  {/* Housing progress */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold">
                      <span className="text-gray-300">انبوه‌سازی و سفت‌کاری مسکن ملی</span>
                      <span className="font-mono text-white">۶۵٪</span>
                    </div>
                    <div className="w-full bg-white/15 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#2A9D8F] h-full rounded-full" style={{ width: '65%' }}></div>
                    </div>
                  </div>
                </div>

                {/* Inquiry CTA */}
                <button
                  onClick={() => alert(`ثبت نام یا بررسی اراضی شهرستان ${selectedCounty.name} از طریق میز خدمت بخش خدمات الکترونیک قابل اقدام است.`)}
                  className="w-full py-3 rounded-xl bg-[#2A9D8F] hover:bg-[#2A9D8F]/90 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow cursor-pointer"
                >
                  <i className="fa-solid fa-file-shield"></i>
                  <span>درخواست تخصیص اراضی در {selectedCounty.name}</span>
                </button>

              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center h-full text-gray-400 space-y-2">
                <i className="fa-solid fa-map-marked-alt text-4xl text-gray-500 animate-pulse"></i>
                <p className="text-xs font-bold">برای مشاهده آمار توسعه شهرستان، آن را روی نقشه انتخاب کنید.</p>
              </div>
            )}

            {/* Live Ticker info */}
            <div className="border-t border-white/10 pt-4 mt-6 text-[10px] text-gray-400 font-mono flex justify-between">
              <span>آخرین به‌روزرسانی داده‌ها: امروز</span>
              <span>روابط عمومی مسکن و راه‌سازی یزد</span>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
