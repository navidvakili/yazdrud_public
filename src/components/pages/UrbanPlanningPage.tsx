import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ActivePage } from '../../types';
import Breadcrumb from '../Breadcrumb';

interface UrbanPlanningPageProps {
  fontSizeScale: number;
  onNavigate: (page: ActivePage) => void;
}

export default function UrbanPlanningPage({ fontSizeScale, onNavigate }: UrbanPlanningPageProps) {
  const [activeTab, setActiveTab] = useState<'commission5' | 'zoningRules' | 'heritageGuide' | 'masterPlans'>('commission5');

  // Commission 5 Form State
  const [caseNumber, setCaseNumber] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [caseResult, setCaseResult] = useState<{
    status: string;
    subject: string;
    city: string;
    decisionDate: string;
    summary: string;
  } | null>(null);

  // Zoning Query State
  const [renovationCode, setRenovationCode] = useState('');
  const [zoneType, setZoneType] = useState('historic_center');
  const [zoneDetails, setZoneDetails] = useState<{
    maxFloors: string;
    maxHeight: string;
    permittedFacade: string;
    windcatcherBuffer: string;
  } | null>(null);

  const handleCommissionSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseNumber) return;
    setCaseResult({
      status: 'مصوب در کمیسیون ماده ۵ (موافقت مشروط)',
      subject: 'تغییر کاربری عرصه از خدماتی به مسکونی با تامین پارکینگ',
      city: 'یزد - بلوار دانشجو',
      decisionDate: '۱۸ خرداد ۱۴۰۵',
      summary: 'پرونده با حضور نماینده میراث فرهنگی و استانداری بررسی شد و با رعایت حریم بصری و ارتفاع حداکثر ۱۰.۵ متر موافقت گردید.',
    });
  };

  const handleZoningSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (zoneType === 'historic_center') {
      setZoneDetails({
        maxFloors: '۲ طبقه (همکف + اول)',
        maxHeight: '۷.۵ متر از کف معبر',
        permittedFacade: 'آجر سنتی گچ‌بر و کاشی فیروزه‌ای (ممنوعیت کامل نمای رومی و کامپوزیت)',
        windcatcherBuffer: 'حفظ حریم خط دید بادگیرهای مجاور تا شعاع ۵۰ متری الزامی است.',
      });
    } else {
      setZoneDetails({
        maxFloors: '۴ طبقه روی پیلوت',
        maxHeight: '۱۶ متر',
        permittedFacade: 'آجر آذرخش و سنگ بومی یزد با المان‌های قوس ایرانی',
        windcatcherBuffer: 'فاقد حریم میراثی مستقیم، رعایت ضوابط عمومی شهرسازی یزد',
      });
    }
  };

  const masterPlansList = [
    { city: 'شهر یزد (مرکز)', year: '۱۴۰۴', size: '۴۵ مگابایت', format: 'PDF & DWG Map' },
    { city: 'شهرستان میبد', year: '۱۴۰۳', size: '۳۲ مگابایت', format: 'PDF Map' },
    { city: 'شهرستان اردکان', year: '۱۴۰۳', size: '۲۸ مگابایت', format: 'PDF Map' },
    { city: 'شهرستان تفت', year: '۱۴۰۴', size: '۱۹ مگابایت', format: 'PDF Map' },
    { city: 'شهرستان مهریز', year: '۱۴۰۲', size: '۲۲ مگابایت', format: 'PDF Map' },
    { city: 'شهرستان بافق', year: '۱۴۰۳', size: '۲۵ مگابایت', format: 'PDF Map' },
  ];

  const tabTitles: Record<string, string> = {
    commission5: 'استعلام پرونده و مصوبات کمیسیون ماده ۵',
    zoningRules: 'ضوابط تراکم، ارتفاع و حریم بادگیرها',
    heritageGuide: 'راهنمای معماری سنتی و بافت تاریخی',
    masterPlans: 'دانلود نقشه و طرح‌های جامع شهری',
  };

  const urbanBreadcrumbItems = [
    { label: 'صفحه اصلی', icon: 'fa-house', onClick: () => onNavigate('home') },
    { label: 'معاونت شهرسازی و معماری', onClick: () => setActiveTab('commission5') },
    { label: tabTitles[activeTab] || 'خدمات شهرسازی', active: true },
  ];

  return (
    <div className="min-h-screen bg-[#F5F6F8] pb-20 text-[#1F3A5F]" style={{ fontSize: `${16 * fontSizeScale}px` }}>
      <Breadcrumb
        currentPage="urban-planning"
        pageTitle="معاونت شهرسازی و معماری"
        items={urbanBreadcrumbItems}
        onNavigate={onNavigate}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        {/* Navigation Tabs */}
        <div className="bg-white p-3 rounded-2xl shadow-md border border-gray-200 flex flex-wrap gap-2 justify-center">
          <button
            onClick={() => setActiveTab('commission5')}
            className={`px-6 py-3 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'commission5'
                ? 'bg-[#1F3A5F] text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <i className="fa-solid fa-gavel text-[#2A9D8F]"></i>
            <span>پیگیری پرونده کمیسیون ماده ۵</span>
          </button>

          <button
            onClick={() => setActiveTab('zoningRules')}
            className={`px-6 py-3 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'zoningRules'
                ? 'bg-[#1F3A5F] text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <i className="fa-solid fa-[#2A9D8F] fa-[#2A9D8F] fa-ruler-combined"></i>
            <span>استعلام تراکم و ارتفاع مجاز</span>
          </button>

          <button
            onClick={() => setActiveTab('heritageGuide')}
            className={`px-6 py-3 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'heritageGuide'
                ? 'bg-[#1F3A5F] text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <i className="fa-solid fa-monument text-[#B76E4C]"></i>
            <span>راهنمای معماری بومی و یونسکو</span>
          </button>

          <button
            onClick={() => setActiveTab('masterPlans')}
            className={`px-6 py-3 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'masterPlans'
                ? 'bg-[#1F3A5F] text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <i className="fa-solid fa-map text-[#C98A5A]"></i>
            <span>نقشه‌های طرح جامع و تفصیلی</span>
          </button>
        </div>

        {/* TAB CONTENTS */}
        <AnimatePresence mode="wait">
          {/* TAB 1: COMMISSION 5 */}
          {activeTab === 'commission5' && (
            <motion.div
              key="c5"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-white rounded-3xl p-6 sm:p-10 shadow-lg border border-gray-200 space-y-8 max-w-3xl mx-auto"
            >
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-black text-[#1F3A5F]">سامانه شفافیت و پیگیری کمیسیون ماده ۵ استان یزد</h3>
                <p className="text-xs text-gray-500 font-bold">
                  مشاهده آخرین آراء، مصوبات تغییر کاربری، حد نصاب تفکیک و تراکم با کد پرونده
                </p>
              </div>

              <form onSubmit={handleCommissionSearch} className="space-y-4 text-xs font-bold">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1.5 text-gray-700">شماره پرونده کمیسیون ماده ۵ *</label>
                    <input
                      type="text"
                      value={caseNumber}
                      onChange={(e) => setCaseNumber(e.target.value)}
                      placeholder="مثال: C5-1405-882"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#2A9D8F] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block mb-1.5 text-gray-700">کد ملی مالک یا متقاضی</label>
                    <input
                      type="text"
                      value={nationalId}
                      onChange={(e) => setNationalId(e.target.value)}
                      placeholder="4430123456"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#2A9D8F] focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#1F3A5F] hover:bg-[#1F3A5F]/90 text-white font-extrabold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <i className="fa-solid fa-gavel text-[#2A9D8F]"></i>
                  <span>جستجو و استعلام رای کمیسیون</span>
                </button>
              </form>

              {caseResult && (
                <div className="p-6 bg-[#F5F6F8] rounded-2xl border border-gray-300 space-y-4 animate-fade-in-up">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                    <span className="text-xs font-black text-[#1F3A5F]">آخرین رای کمیسیون:</span>
                    <span className="px-3 py-1 bg-[#2A9D8F] text-white rounded-full font-black text-xs">
                      {caseResult.status}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs font-bold text-gray-700">
                    <div>موضوع درخواست: <span className="text-[#1F3A5F]">{caseResult.subject}</span></div>
                    <div>موقعیت ملک: <span className="text-[#B76E4C]">{caseResult.city}</span></div>
                    <div>تاریخ جلسه کمیسیون: <span className="text-gray-600">{caseResult.decisionDate}</span></div>
                    <div className="pt-2 text-gray-600 leading-relaxed font-semibold bg-white p-3 rounded-xl border border-gray-200">
                      ملاحظات رای: {caseResult.summary}
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => alert('نسخه رسمی ابلاغیه کمیسیون ماده ۵ صادر شد.')}
                      className="px-4 py-2 bg-[#2A9D8F] text-white font-bold text-xs rounded-lg shadow-sm"
                    >
                      دانلود صورت‌جلسه رسمی PDF
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 2: ZONING RULES */}
          {activeTab === 'zoningRules' && (
            <motion.div
              key="zoning"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-white rounded-3xl p-6 sm:p-10 shadow-lg border border-gray-200 space-y-8 max-w-3xl mx-auto"
            >
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-black text-[#1F3A5F]">استعلام آنلاین ضوابط تراکم و حریم بافت تاریخی</h3>
                <p className="text-xs text-gray-500 font-bold">
                  محاسبه حداکثر ارتفاع و ضوابط نمای شهری بر اساس پهنه‌بندی طرح تفصیلی یزد
                </p>
              </div>

              <form onSubmit={handleZoningSearch} className="space-y-4 text-xs font-bold">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1.5 text-gray-700">کد نوسازی شهرداری / پلاک ثبتی</label>
                    <input
                      type="text"
                      value={renovationCode}
                      onChange={(e) => setRenovationCode(e.target.value)}
                      placeholder="مثال: 12-4-102"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#2A9D8F] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block mb-1.5 text-gray-700">موقعیت استقرار ملک در پهنه شهری</label>
                    <select
                      value={zoneType}
                      onChange={(e) => setZoneType(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#2A9D8F] focus:outline-none bg-white"
                    >
                      <option value="historic_center">حریم بافت تاریخی ثبتی یونسکو (بافت خشتی)</option>
                      <option value="urban_expansion">پهنه‌های توسعه جدید (صفائیه، پاسداران، امامشهر)</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#2A9D8F] hover:bg-[#2A9D8F]/90 text-white font-extrabold rounded-xl shadow-md transition-all cursor-pointer"
                >
                  استعلام ضوابط معماری و ارتفاع
                </button>
              </form>

              {zoneDetails && (
                <div className="p-6 bg-[#1F3A5F]/5 rounded-2xl border border-[#1F3A5F]/20 space-y-4 animate-fade-in-up text-xs font-bold">
                  <h4 className="text-sm font-black text-[#1F3A5F] border-b border-[#1F3A5F]/10 pb-2">
                    نتیجه استعلام ضوابط تفصیلی:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white p-3 rounded-xl border border-gray-200">
                      <span className="text-gray-500 block mb-1">حداکثر تعداد طبقات:</span>
                      <span className="text-[#1F3A5F] text-sm">{zoneDetails.maxFloors}</span>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-gray-200">
                      <span className="text-gray-500 block mb-1">حداکثر ارتفاع مجاز:</span>
                      <span className="text-[#B76E4C] text-sm">{zoneDetails.maxHeight}</span>
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-gray-200">
                    <span className="text-gray-500 block mb-1">الزامات نمای بومی:</span>
                    <span className="text-gray-800 font-semibold">{zoneDetails.permittedFacade}</span>
                  </div>
                  <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-amber-900">
                    <span className="font-extrabold block mb-1">حریم بصری بادگیرها:</span>
                    <span className="font-semibold">{zoneDetails.windcatcherBuffer}</span>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 3: HERITAGE GUIDE */}
          {activeTab === 'heritageGuide' && (
            <motion.div
              key="heritage"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-white rounded-3xl p-6 sm:p-10 shadow-lg border border-gray-200 space-y-6"
            >
              <div className="text-center space-y-2 max-w-2xl mx-auto">
                <span className="bg-[#B76E4C]/15 text-[#B76E4C] px-3 py-1 rounded-full text-xs font-black">
                  🏛️ میراث جهانی یونسکو
                </span>
                <h3 className="text-2xl font-black text-[#1F3A5F]">الزامات طراحی نما و بهسازی بافت خشتی یزد</h3>
                <p className="text-xs text-gray-500 font-bold">
                  دستورالعمل اجرایی انطباق معماری جدید با هویت کالبدی اولین شهر خشتی جهان.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-5 rounded-2xl bg-[#F5F6F8] border border-gray-200 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-[#2A9D8F] text-white flex items-center justify-center font-bold text-lg">
                    ۱
                  </div>
                  <h4 className="font-extrabold text-[#1F3A5F] text-sm">مصالح بومی مجاز</h4>
                  <p className="text-xs text-gray-600 font-semibold leading-relaxed">
                    استفاده از آجر سنتی سنتی ختایی، کاشی فیروزه‌ای، سیم گل سنتی و شیشه‌های رنگی در نما الزامی است.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-[#F5F6F8] border border-gray-200 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-[#B76E4C] text-white flex items-center justify-center font-bold text-lg">
                    ۲
                  </div>
                  <h4 className="font-extrabold text-[#1F3A5F] text-sm">نماهای ممنوعه</h4>
                  <p className="text-xs text-gray-600 font-semibold leading-relaxed">
                    استفاده از نمای رومی، ورق کامپوزیت، شیشه‌های رفلکس تیره و سنگ‌های صقلی بدون قوس کاملاً ممنوع است.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-[#F5F6F8] border border-gray-200 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-[#1F3A5F] text-white flex items-center justify-center font-bold text-lg">
                    ۳
                  </div>
                  <h4 className="font-extrabold text-[#1F3A5F] text-sm">تسهیلات مرمت</h4>
                  <p className="text-xs text-gray-600 font-semibold leading-relaxed">
                    پرداخت ۳۶۰ میلیون تومان وام کم‌بهره جهت احیا و بهسازی خانه های خشتی در بافت فرسوده یزد.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 4: MASTER PLANS DOWNLOADS */}
          {activeTab === 'masterPlans' && (
            <motion.div
              key="master"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-white rounded-3xl p-6 sm:p-10 shadow-lg border border-gray-200 space-y-6"
            >
              <div className="text-center space-y-2 max-w-2xl mx-auto">
                <h3 className="text-2xl font-black text-[#1F3A5F]">دانلود نقشه‌های جامع و تفصیلی شهرستان‌های یزد</h3>
                <p className="text-xs text-gray-500 font-bold">
                  دسترسی مهندسان و مشاوران به فایل‌های رسمی کاربری اراضی و پهنه‌بندی‌های مصوب.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {masterPlansList.map((plan, idx) => (
                  <div key={idx} className="p-5 rounded-2xl border border-gray-200 hover:border-[#2A9D8F] transition-all flex flex-col justify-between space-y-3 bg-gray-50">
                    <div>
                      <span className="text-[10px] bg-[#1F3A5F] text-white px-2.5 py-1 rounded-md font-bold mb-2 inline-block">
                        مصوب سال {plan.year}
                      </span>
                      <h4 className="font-extrabold text-[#1F3A5F] text-sm">{plan.city}</h4>
                      <p className="text-xs text-gray-500 font-semibold mt-1">فرمت: {plan.format} • حجم: {plan.size}</p>
                    </div>

                    <button
                      onClick={() => alert(`در حال دریافت فایل نقشه تفصیلی ${plan.city}`)}
                      className="w-full py-2 bg-[#2A9D8F] text-white font-bold text-xs rounded-xl shadow-sm hover:bg-[#2A9D8F]/90 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <i className="fa-solid fa-download"></i>
                      <span>دانلود نقشه تفصیلی</span>
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
