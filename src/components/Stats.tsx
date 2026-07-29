import { useEffect, useState } from 'react';

interface StatsProps {
  fontSizeScale: number;
}

export default function Stats({ fontSizeScale }: StatsProps) {
  const statsConfig = [
    { target: 320, label: 'پروژه عمرانی فعال', suffix: '+', icon: 'fa-solid fa-person-digging', color: '#B76E4C' },
    { target: 850, label: 'کیلومتر راه توسعه‌یافته', suffix: ' کیلومتر', icon: 'fa-solid fa-road', color: '#2A9D8F' },
    { target: 140, label: 'پروژه انبوه مسکن', suffix: '+', icon: 'fa-solid fa-city', color: '#1F3A5F' },
    { target: 120, label: 'خدمت الکترونیکی برخط', suffix: ' خدمت', icon: 'fa-solid fa-desktop', color: '#C98A5A' },
  ];

  // States to hold the current animated numbers
  const [counts, setCounts] = useState([0, 0, 0, 0]);

  useEffect(() => {
    const duration = 1500; // Animation duration in ms
    const frameRate = 30; // 30 frames per second
    const totalFrames = Math.round(duration / (1000 / frameRate));
    
    let currentFrame = 0;
    
    const timer = setInterval(() => {
      currentFrame++;
      const progress = currentFrame / totalFrames;
      
      // Simple ease-out multiplier
      const easeProgress = 1 - Math.pow(1 - progress, 3); 

      const currentCounts = statsConfig.map((stat) => {
        const value = Math.round(stat.target * easeProgress);
        return value > stat.target ? stat.target : value;
      });

      setCounts(currentCounts);

      if (currentFrame >= totalFrames) {
        setCounts(statsConfig.map((stat) => stat.target));
        clearInterval(timer);
      }
    }, 1000 / frameRate);

    return () => clearInterval(timer);
  }, []);

  return (
    <section
      className="glass-panel-dark text-white py-16 px-6 shadow-2xl relative max-w-7xl mx-auto rounded-3xl border border-white/15 my-16 overflow-hidden"
      style={{ fontSize: `${16 * fontSizeScale}px` }}
    >
      {/* Yazd Clay Arch Border Bottom Divider */}
      <div className="absolute top-0 left-0 right-0 h-4 bg-white/5 pointer-events-none"></div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h3 className="text-2xl md:text-3xl font-black tracking-tight mb-2 text-[#E7D3B1]">
            روند توسعه و تحول عمران شهری و جاده‌ای یزد
          </h3>
          <p className="text-xs sm:text-sm text-gray-300 font-medium max-w-xl mx-auto">
            آمار افتخارآمیز خدمت‌رسانی بی‌وقفه اداره کل راه و شهرسازی استان یزد به هموطنان گرانقدر در سال‌های اخیر
          </p>
        </div>

        {/* Counter Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {statsConfig.map((stat, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/15 text-center flex flex-col justify-between hover:bg-white/20 hover:-translate-y-1 transition-all duration-300 shadow-sm"
            >
              <div className="mx-auto w-12 h-12 rounded-full flex items-center justify-center text-white text-lg mb-4"
                   style={{ backgroundColor: stat.color }}>
                <i className={stat.icon}></i>
              </div>

              <div>
                {/* Big Animated Value */}
                <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-2">
                  <span>{counts[index].toLocaleString('fa-IR')}</span>
                  <span className="text-[#E7D3B1] text-base sm:text-lg lg:text-xl ml-1">{stat.suffix}</span>
                </div>
                
                {/* Underline decorative */}
                <div className="w-12 h-0.5 mx-auto bg-white/20 my-2.5"></div>
                
                <p className="text-xs sm:text-sm text-[#E7D3B1] font-bold">
                  {stat.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
