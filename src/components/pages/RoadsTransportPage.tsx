import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ActivePage } from '../../types';
import Breadcrumb from '../Breadcrumb';

interface RoadsTransportPageProps {
  fontSizeScale: number;
  onNavigate: (page: ActivePage) => void;
}

export default function RoadsTransportPage({ fontSizeScale, onNavigate }: RoadsTransportPageProps) {
  const [activeTab, setActiveTab] = useState<'projects' | 'permits' | 'status'>('projects');

  const roadProjects = [
    {
      title: 'باند دوم بزرگراه یزد - طبس (بخش کویری)',
      length: '۱۴۰ کیلومتر',
      progress: 75,
      budget: '۸۵۰ میلیارد تومان',
      status: 'در حال اجرای لایه دوم آسفالت',
      county: 'یزد / طبس',
    },
    {
      title: 'احداث تقاطع غیرهمسطح محور مهریز - بهاباد',
      length: 'تقاطع ۳ دهانه',
      progress: 90,
      budget: '۱۲۰ میلیارد تومان',
      status: 'در مرحله نصب عرشه و تابلوهای ایمنی',
      county: 'مهریز',
    },
    {
      title: 'دوبانده‌سازی محور اردکان - چوپانان',
      length: '۹۵ کیلومتر',
      progress: 60,
      budget: '۶۲۰ میلیارد تومان',
      status: 'عملیات خاکبرداری و زیرسازی',
      county: 'اردکان',
    },
    {
      title: 'بهسازی و روکش آسفالت گرم محور تفت - ابرکوه',
      length: '۸۰ کیلومتر',
      progress: 88,
      budget: '۳۴۰ میلیارد تومان',
      status: 'بهره‌برداری آزمایشی فاز اول',
      county: 'تفت / ابرکوه',
    },
  ];

  const tabTitles: Record<string, string> = {
    projects: 'پروژه‌های راه‌سازی و بزرگراهی فعال',
    permits: 'استعلام آنلاین و صدور مجوز حریم راه',
    status: 'گزارش‌های فنی، ترانزیت و ایمنی جاده‌ها',
  };

  const roadsBreadcrumbItems = [
    { label: 'صفحه اصلی', icon: 'fa-house', onClick: () => onNavigate('home') },
    { label: 'معاونت مهندسی و ساخت راه‌ها', onClick: () => setActiveTab('projects') },
    { label: tabTitles[activeTab] || 'خدمات راه‌ها', active: true },
  ];

  return (
    <div className="min-h-screen bg-[#F5F6F8] pb-20 text-[#1F3A5F]" style={{ fontSize: `${16 * fontSizeScale}px` }}>
      <Breadcrumb
        currentPage="roads-transport"
        pageTitle="معاونت مهندسی و ساخت راه‌ها"
        items={roadsBreadcrumbItems}
        onNavigate={onNavigate}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        {/* Navigation Tabs */}
        <div className="bg-white p-3 rounded-2xl shadow-md border border-gray-200 flex flex-wrap gap-2 justify-center">
          <button
            onClick={() => setActiveTab('projects')}
            className={`px-6 py-3 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'projects'
                ? 'bg-[#1F3A5F] text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <i className="fa-solid fa-road text-[#2A9D8F]"></i>
            <span>پروژه‌های راه‌سازی فعال استان</span>
          </button>

          <button
            onClick={() => setActiveTab('permits')}
            className={`px-6 py-3 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'permits'
                ? 'bg-[#1F3A5F] text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <i className="fa-solid fa-[#2A9D8F] fa-shield-halved"></i>
            <span>استعلام مجوز حریم قانونی راه‌ها</span>
          </button>

          <button
            onClick={() => setActiveTab('status')}
            className={`px-6 py-3 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'status'
                ? 'bg-[#1F3A5F] text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <i className="fa-solid fa-truck-fast text-[#B76E4C]"></i>
            <span>وضعیت ترافیک و شریان‌های کویری</span>
          </button>
        </div>

        {/* PROJECTS TAB */}
        {activeTab === 'projects' && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {roadProjects.map((proj, idx) => (
                <div key={idx} className="bg-white rounded-3xl p-6 shadow-md border border-gray-200 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="bg-[#1F3A5F] text-white px-3 py-1 rounded-full text-[11px] font-black mb-2 inline-block">
                        {proj.county}
                      </span>
                      <h4 className="text-lg font-black text-[#1F3A5F]">{proj.title}</h4>
                    </div>
                    <span className="text-xs font-bold text-[#2A9D8F] bg-[#2A9D8F]/10 px-3 py-1 rounded-lg">
                      {proj.length}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-gray-600">
                      <span>پیشرفت فیزیکی:</span>
                      <span>{proj.progress}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#2A9D8F] rounded-full" style={{ width: `${proj.progress}%` }}></div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs font-bold pt-2 border-t border-gray-100">
                    <span className="text-gray-500">اعتبار تخصیصی: {proj.budget}</span>
                    <span className="text-[#B76E4C]">{proj.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* PERMITS TAB */}
        {activeTab === 'permits' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-6 sm:p-10 shadow-lg border border-gray-200 max-w-2xl mx-auto space-y-6"
          >
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-black text-[#1F3A5F]">درخواست مجوز عبور تأسیسات و ساخت در حریم راه</h3>
              <p className="text-xs text-gray-500 font-bold">
                صدور مجوز خطوط فیبر نوری، لوله‌کشی آب، گاز و تقاطع‌های اختصاصی در جاده‌های استان یزد.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert('درخواست مجوز حریم راه با موفقیت ثبت شد. کارشناسان اداره راهداری بازدید میدانی انجام خواهند داد.');
              }}
              className="space-y-4 text-xs font-bold"
            >
              <div>
                <label className="block mb-1.5 text-gray-700">نام متقاضی یا شرکت *</label>
                <input
                  type="text"
                  required
                  placeholder="نام شرکت یا متقاضی حقیقی"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#2A9D8F] focus:outline-none"
                />
              </div>

              <div>
                <label className="block mb-1.5 text-gray-700">عنوان محور ارتباطی *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: کیلومتر ۲۵ بزرگراه یزد - میبد"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#2A9D8F] focus:outline-none"
                />
              </div>

              <div>
                <label className="block mb-1.5 text-gray-700">نوع فعالیت در حریم راه</label>
                <select className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#2A9D8F] focus:outline-none bg-white">
                  <option>عبور عرضی خطوط لوله و کابل</option>
                  <option>احداث دسترسی مجاز و رمپ ورود و خروج مجتمع بین‌راهی</option>
                  <option>نصب تابلوهای تبلیغاتی و راهنما</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#1F3A5F] hover:bg-[#1F3A5F]/90 text-white font-extrabold rounded-xl shadow-md transition-all cursor-pointer"
              >
                ثبت الکترونیکی درخواست مجوز
              </button>
            </form>
          </motion.div>
        )}

        {/* STATUS TAB */}
        {activeTab === 'status' && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl p-8 shadow-md text-center space-y-4">
            <i className="fa-solid fa-route text-5xl text-[#2A9D8F]"></i>
            <h3 className="text-xl font-black text-[#1F3A5F]">کلیه محورهای شریانی استان یزد باز و روان می‌باشد</h3>
            <p className="text-xs text-gray-600 font-bold max-w-lg mx-auto">
              تیم‌های راهداری و امداد جاده‌ای اداره کل راه و شهرسازی استان یزد به صورت شبانه‌روزی در ۸۵۰ کیلومتر محورهای کویری مستقر هستند.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
