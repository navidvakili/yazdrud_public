interface FooterProps {
  fontSizeScale: number;
  onNavigate: (section: string) => void;
}

export default function Footer({ fontSizeScale, onNavigate }: FooterProps) {
  const currentYearPersian = '۱۴۰۵';

  const handleSystemLink = (name: string) => {
    alert(`در حال انتقال امن به سامانه کشوری: ${name}...`);
  };

  return (
    <footer
      id="footer"
      className="backdrop-blur-md bg-[#1F3A5F]/90 text-white pt-16 pb-8 px-4 border-t border-white/15 relative overflow-hidden shadow-2xl"
      style={{ fontSize: `${16 * fontSizeScale}px` }}
    >
      {/* Decorative Subtle Line top */}
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-white/25 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
        
        {/* Column 1: Intro and National Emblem (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg p-1 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-8 h-8 text-[#1F3A5F]" fill="currentColor">
                <path d="M50 5 L53 14 L62 14 L55 20 L58 29 L50 23 L42 29 L45 20 L38 14 L47 14 Z" fill="#B76E4C" />
                <circle cx="50" cy="55" r="20" fill="none" stroke="#1F3A5F" strokeWidth="4" />
              </svg>
            </div>
            <div>
              <h4 className="text-base font-black text-white">اداره کل راه و شهرسازی استان یزد</h4>
              <p className="text-[10px] text-[#E7D3B1] font-medium">پورتال خدمات هوشمند و توسعه محور</p>
            </div>
          </div>

          <p className="text-xs text-gray-300 font-bold leading-relaxed">
            اولین شهر خشتی ثبت یونسکو با تکیه بر اصول توسعه پایدار، بهبود شریان‌های ترانزیتی و جاده‌ای کویری و تحویل خانه‌های مسکونی ایمن در چهارچوب نهضت ملی مسکن گام برمی‌دارد.
          </p>

          {/* Social Network Links */}
          <div className="space-y-2 pt-2">
            <span className="text-xs font-bold text-[#E7D3B1] block">ما را در رسانه‌ها دنبال کنید:</span>
            <div className="flex gap-3">
              {/* Eitaa */}
              <button
                onClick={() => handleSystemLink('پیام‌رسان ایتا')}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-[#B76E4C] hover:scale-105 active:scale-95 transition-all border border-white/20 flex items-center justify-center cursor-pointer"
                title="کانال ایتا اداره کل"
              >
                <i className="fa-solid fa-paper-plane text-xs text-white"></i>
              </button>
              {/* Bale */}
              <button
                onClick={() => handleSystemLink('پیام‌رسان بله')}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-[#2A9D8F] hover:scale-105 active:scale-95 transition-all border border-white/20 flex items-center justify-center cursor-pointer"
                title="کانال بله اداره کل"
              >
                <i className="fa-solid fa-comments text-xs text-white"></i>
              </button>
              {/* Aparat */}
              <button
                onClick={() => handleSystemLink('آپارات')}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-red-600 hover:scale-105 active:scale-95 transition-all border border-white/20 flex items-center justify-center cursor-pointer"
                title="کانال آپارات ویدیوها"
              >
                <i className="fa-solid fa-video text-xs text-white"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Column 2: Quick Links (2.5 Cols) */}
        <div className="lg:col-span-2.5 space-y-3">
          <h4 className="text-sm font-black text-[#E7D3B1] border-r-4 border-[#2A9D8F] pr-2">دسترسی سریع</h4>
          <ul className="space-y-2 text-xs font-bold text-gray-300">
            <li>
              <button onClick={() => onNavigate('hero')} className="hover:text-white transition-colors">
                <i className="fa-solid fa-chevron-left text-[8px] text-[#2A9D8F] ml-1.5"></i>
                <span>صفحه نخست</span>
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('services')} className="hover:text-white transition-colors">
                <i className="fa-solid fa-chevron-left text-[8px] text-[#2A9D8F] ml-1.5"></i>
                <span>خدمات الکترونیک پیشخوان</span>
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('interactive-map')} className="hover:text-white transition-colors">
                <i className="fa-solid fa-chevron-left text-[8px] text-[#2A9D8F] ml-1.5"></i>
                <span>نقشه و شهرستان‌ها</span>
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('news')} className="hover:text-white transition-colors">
                <i className="fa-solid fa-chevron-left text-[8px] text-[#2A9D8F] ml-1.5"></i>
                <span>رویدادها و اخبار</span>
              </button>
            </li>
          </ul>
        </div>

        {/* Column 3: Related Systems (2.5 Cols) */}
        <div className="lg:col-span-2.5 space-y-3">
          <h4 className="text-sm font-black text-[#E7D3B1] border-r-4 border-[#C98A5A] pr-2">سامانه‌های مرتبط دولتی</h4>
          <ul className="space-y-2 text-xs font-bold text-gray-300">
            <li>
              <button onClick={() => handleSystemLink('پورتال وزارت راه و شهرسازی')} className="hover:text-white text-right transition-colors">
                <i className="fa-solid fa-link text-[8px] text-[#C98A5A] ml-1.5"></i>
                <span>پورتال اصلی وزارتخانه متبوع</span>
              </button>
            </li>
            <li>
              <button onClick={() => handleSystemLink('درگاه ملی خدمات دولت هوشمند')} className="hover:text-white text-right transition-colors">
                <i className="fa-solid fa-link text-[8px] text-[#C98A5A] ml-1.5"></i>
                <span>درگاه ملی دولت هوشمند</span>
              </button>
            </li>
            <li>
              <button onClick={() => handleSystemLink('سامانه املاک و اسکان کشور')} className="hover:text-white text-right transition-colors">
                <i className="fa-solid fa-link text-[8px] text-[#C98A5A] ml-1.5"></i>
                <span>سامانه ملی املاک و اسکان</span>
              </button>
            </li>
            <li>
              <button onClick={() => handleSystemLink('سازمان شهرداری‌ها و دهیاری‌ها')} className="hover:text-white text-right transition-colors">
                <i className="fa-solid fa-link text-[8px] text-[#C98A5A] ml-1.5"></i>
                <span>شهرداری الکترونیک یزد</span>
              </button>
            </li>
          </ul>
        </div>

        {/* Column 4: Address and Contacts (3 Cols) */}
        <div className="lg:col-span-3 space-y-3">
          <h4 className="text-sm font-black text-[#E7D3B1] border-r-4 border-[#B76E4C] pr-2">اطلاعات ارتباطی</h4>
          <ul className="space-y-2.5 text-xs text-gray-300 font-medium leading-relaxed">
            <li className="flex items-start gap-2">
              <i className="fa-solid fa-map-location-dot text-[#B76E4C] mt-1 text-[11px]"></i>
              <span>نشانی: یزد، خیابان مسکن و شهرسازی</span>
            </li>
            <li className="flex items-center gap-2">
              <i className="fa-solid fa-phone text-[#2A9D8F] text-[11px]"></i>
              <span className="font-mono">تلفن: ۰۳۵-۳۶۲۳۶۲۰۰</span>
            </li>
            <li className="flex items-center gap-2">
              <i className="fa-solid fa-fax text-[#C98A5A] text-[11px]"></i>
              <span className="font-mono">نمابر دبیرخانه: ۰۳۵-۳۶۲۳۵۰۶۵</span>
            </li>
            <li className="flex items-center gap-2">
              <i className="fa-solid fa-envelope text-white/60 text-[11px]"></i>
              <span className="font-mono">پست الکترونیک: yazd@mrud.ir</span>
            </li>
          </ul>
        </div>

      </div>

      {/* Decorative Traditional Border Divider */}
      <div className="w-full h-[1px] bg-white/10 my-10"></div>

      {/* Copyright Bar */}
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center text-[11px] font-bold text-gray-400 gap-4">
        <div className="text-center sm:text-right">
          <span>کلیه حقوق مادی و معنوی این پورتال متعلق به </span>
          <strong className="text-white">اداره کل راه و شهرسازی استان یزد</strong>
          <span> می‌باشد. {currentYearPersian} ©</span>
        </div>
        <div className="flex items-center gap-1.5 font-mono">
          <span>طراحی هوشمند: </span>
          <span className="bg-[#2A9D8F] text-white px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider">
            Yazd Heritage Design System
          </span>
        </div>
      </div>
    </footer>
  );
}
