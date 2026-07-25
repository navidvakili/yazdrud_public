import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ActivePage } from '../../types';
import Breadcrumb from '../Breadcrumb';

interface LandAllocationPageProps {
  fontSizeScale: number;
  onNavigate: (page: ActivePage) => void;
}

export default function LandAllocationPage({ fontSizeScale, onNavigate }: LandAllocationPageProps) {
  const [activeTab, setActiveTab] = useState<'register' | 'inquiry' | 'calculator' | 'sites'>('register');

  // Wizard State
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState({
    nationalCode: '',
    fullName: '',
    fatherName: '',
    mobile: '',
    childrenCount: 0,
    residencyYears: 5,
    county: 'یزد',
    selectedSite: 'صفائیه - کاریزبوم (اراضی ویلایی ۲۲۰ متری)',
    schemeType: 'جوانی جمعیت (خانواده‌های ۳ فرزند و بیشتر)',
  });
  const [trackingCode, setTrackingCode] = useState<string | null>(null);

  // Inquiry Form State
  const [inquiryNationalCode, setInquiryNationalCode] = useState('');
  const [inquiryTrackingCode, setInquiryTrackingCode] = useState('');
  const [inquiryResult, setInquiryResult] = useState<{
    status: 'approved' | 'pending' | 'documents_needed';
    siteName: string;
    allocatedPlot: string;
    score: number;
    date: string;
  } | null>(null);

  // Calculator State
  const [calcChildren, setCalcChildren] = useState(3);
  const [calcResidency, setCalcResidency] = useState(8);
  const [calcIsNative, setCalcIsNative] = useState(true);

  // Available Land Allocation Sites in Yazd
  const sitesList = [
    {
      id: 'site-1',
      county: 'یزد (مرکز)',
      name: 'سایت ویلایی کاریزبوم و صفائیه',
      capacity: '۱۲,۵۰۰ قطعه زمین',
      type: 'تک واحدی ویلایی - ۲۰۰ الی ۲۵۰ متر',
      status: 'در حال آماده‌سازی زیرساخت و تخصیص',
      progress: 85,
    },
    {
      id: 'site-2',
      county: 'میبد',
      name: 'شهرک پرنیان میبد',
      capacity: '۴,۲۰۰ قطعه زمین',
      type: 'ویلایی اقلیمی یزدی',
      status: 'آماده تحویل اسناد کاداستر',
      progress: 95,
    },
    {
      id: 'site-3',
      county: 'اردکان',
      name: 'سایت توسعه‌ای نهضت مسکن اردکان',
      capacity: '۳,۸۰۰ قطعه زمین',
      type: 'ویلایی دو طبقه سازگار با کویر',
      status: 'در حال تخصیص به متقاضیان',
      progress: 70,
    },
    {
      id: 'site-4',
      county: 'تفت',
      name: 'سایت مهرشهر تفت',
      capacity: '۱,۹۰۰ قطعه زمین',
      type: 'باغ‌ویلایی کم‌تراکم',
      status: 'در مرحله قرعه‌کشی نهایی',
      progress: 90,
    },
  ];

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = `YAZD-LAND-1405-${Math.floor(100000 + Math.random() * 900000)}`;
    setTrackingCode(code);
    setStep(4);
  };

  const handleInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryNationalCode) return;
    setInquiryResult({
      status: 'approved',
      siteName: 'سایت ویلایی کاریزبوم صفائیه یزد',
      allocatedPlot: 'بلوک B2 - قطعه ۱۴۲ (۲۲۰ متر مربع)',
      score: 185,
      date: '۱۲ خرداد ۱۴۰۵',
    });
  };

  const calculatedScore = (calcChildren * 35) + (calcResidency * 5) + (calcIsNative ? 30 : 0);

  const tabTitles: Record<string, string> = {
    register: 'ثبت‌نام واگذاری زمین و نهضت مسکن',
    inquiry: 'پیگیری وضعیت پرونده اراضی',
    calculator: 'محاسبه‌گر آنلاین امتیاز اولویت',
    sites: 'نقشه و اطلاعات سایت‌های ویلایی استان یزد',
  };

  const landBreadcrumbItems = [
    { label: 'صفحه اصلی', icon: 'fa-house', onClick: () => onNavigate('home') },
    { label: 'تخصیص اراضی و مسکن', onClick: () => setActiveTab('register') },
    { label: tabTitles[activeTab] || 'ثبت‌نام و پیگیری', active: true },
  ];

  return (
    <div className="min-h-screen bg-[#F5F6F8] pb-20 text-[#1F3A5F]" style={{ fontSize: `${16 * fontSizeScale}px` }}>
      <Breadcrumb
        currentPage="land-allocation"
        pageTitle="سامانه تخصیص اراضی و مسکن یزد"
        items={landBreadcrumbItems}
        onNavigate={onNavigate}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        {/* Top Navigation Tabs */}
        <div className="bg-white p-3 rounded-2xl shadow-md border border-gray-200 flex flex-wrap gap-2 justify-center">
          <button
            onClick={() => setActiveTab('register')}
            className={`px-6 py-3 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'register'
                ? 'bg-[#1F3A5F] text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <i className="fa-solid fa-file-pen text-[#2A9D8F]"></i>
            <span>ثبت درخواست واگذاری زمین</span>
          </button>

          <button
            onClick={() => setActiveTab('inquiry')}
            className={`px-6 py-3 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'inquiry'
                ? 'bg-[#1F3A5F] text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <i className="fa-solid fa-[#2A9D8F] fa-magnifying-glass-location"></i>
            <span>پیگیری وضعیت اراضی تخصیص یافته</span>
          </button>

          <button
            onClick={() => setActiveTab('calculator')}
            className={`px-6 py-3 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'calculator'
                ? 'bg-[#1F3A5F] text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <i className="fa-solid fa-calculator text-[#B76E4C]"></i>
            <span>محاسبه‌گر امتیاز اولویت</span>
          </button>

          <button
            onClick={() => setActiveTab('sites')}
            className={`px-6 py-3 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'sites'
                ? 'bg-[#1F3A5F] text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <i className="fa-solid fa-map-location-dot text-[#C98A5A]"></i>
            <span>نقشه سایت‌های توسعه مسکن استان</span>
          </button>
        </div>

        {/* TAB CONTENTS */}
        <AnimatePresence mode="wait">
          {/* TAB 1: REGISTRATION WIZARD */}
          {activeTab === 'register' && (
            <motion.div
              key="register"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-white rounded-3xl p-6 sm:p-10 shadow-lg border border-gray-200 space-y-8"
            >
              {/* Stepper Progress Bar */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-6 text-xs font-black text-gray-400 max-w-3xl mx-auto">
                <div className={`flex items-center gap-2 ${step >= 1 ? 'text-[#1F3A5F]' : ''}`}>
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-[#2A9D8F] text-white' : 'bg-gray-200'}`}>
                    ۱
                  </span>
                  <span>اطلاعات متقاضی</span>
                </div>
                <div className="h-0.5 flex-1 mx-2 bg-gray-200"></div>
                <div className={`flex items-center gap-2 ${step >= 2 ? 'text-[#1F3A5F]' : ''}`}>
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-[#2A9D8F] text-white' : 'bg-gray-200'}`}>
                    ۲
                  </span>
                  <span>انتخاب سایت یزد</span>
                </div>
                <div className="h-0.5 flex-1 mx-2 bg-gray-200"></div>
                <div className={`flex items-center gap-2 ${step >= 3 ? 'text-[#1F3A5F]' : ''}`}>
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-[#2A9D8F] text-white' : 'bg-gray-200'}`}>
                    ۳
                  </span>
                  <span>تایید و ارسال</span>
                </div>
              </div>

              {/* STEP 1 */}
              {step === 1 && (
                <div className="space-y-6 max-w-2xl mx-auto">
                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-black text-[#1F3A5F]">مرحله اول: ثبت مشخصات سرپرست خانوار</h3>
                    <p className="text-xs text-gray-500 font-bold">
                      اطلاعات جهت استعلام سبز بودن فرم ج و تطبیق با سازمان ثبت احوال استفاده می‌شود.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold">
                    <div>
                      <label className="block mb-1.5 text-gray-700">کد ملی سرپرست خانوار *</label>
                      <input
                        type="text"
                        maxLength={10}
                        value={formData.nationalCode}
                        onChange={(e) => setFormData({ ...formData, nationalCode: e.target.value })}
                        placeholder="مثال: 4430123456"
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#2A9D8F] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block mb-1.5 text-gray-700">نام و نام خانوادگی *</label>
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="نام و فامیل سرپرست"
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#2A9D8F] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block mb-1.5 text-gray-700">نام پدر</label>
                      <input
                        type="text"
                        value={formData.fatherName}
                        onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                        placeholder="نام پدر"
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#2A9D8F] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block mb-1.5 text-gray-700">شماره تلفن همراه (بنام سرپرست) *</label>
                      <input
                        type="tel"
                        maxLength={11}
                        value={formData.mobile}
                        onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                        placeholder="09131234567"
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#2A9D8F] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block mb-1.5 text-gray-700">تعداد فرزندان زیر ۲۰ سال</label>
                      <select
                        value={formData.childrenCount}
                        onChange={(e) => setFormData({ ...formData, childrenCount: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#2A9D8F] focus:outline-none bg-white"
                      >
                        <option value={0}>بدون فرزند / ۱ فرزند</option>
                        <option value={2}>۲ فرزند</option>
                        <option value={3}>۳ فرزند (مشمول طرح جوانی جمعیت)</option>
                        <option value={4}>۴ فرزند و بیشتر</option>
                      </select>
                    </div>

                    <div>
                      <label className="block mb-1.5 text-gray-700">سابقه سکونت مداوم در استان یزد</label>
                      <select
                        value={formData.residencyYears}
                        onChange={(e) => setFormData({ ...formData, residencyYears: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#2A9D8F] focus:outline-none bg-white"
                      >
                        <option value={5}>۵ سال کامل</option>
                        <option value={10}>بیش از ۱۰ سال</option>
                        <option value={20}>بومی و متولد استان یزد</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (!formData.nationalCode || !formData.fullName) {
                        alert('لطفاً کد ملی و نام خانوادگی را وارد کنید.');
                        return;
                      }
                      setStep(2);
                    }}
                    className="w-full py-3.5 bg-[#1F3A5F] hover:bg-[#1F3A5F]/90 text-white font-extrabold rounded-xl shadow-md cursor-pointer transition-all"
                  >
                    ادامه به مرحله بعد (انتخاب سایت زمین)
                  </button>
                </div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <div className="space-y-6 max-w-2xl mx-auto">
                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-black text-[#1F3A5F]">مرحله دوم: انتخاب شهرستان و پروژه زمین</h3>
                    <p className="text-xs text-gray-500 font-bold">
                      اراضی به صورت ویلایی تک واحدی یا دو واحدی با تسهیلات ساخت ارایه می‌شوند.
                    </p>
                  </div>

                  <div className="space-y-4 text-xs font-bold">
                    <div>
                      <label className="block mb-1.5 text-gray-700">شهرستان محل درخواست واگذاری</label>
                      <select
                        value={formData.county}
                        onChange={(e) => setFormData({ ...formData, county: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#2A9D8F] focus:outline-none bg-white"
                      >
                        <option value="یزد">یزد (مرکز استان)</option>
                        <option value="میبد">میبد</option>
                        <option value="اردکان">اردکان</option>
                        <option value="تفت">تفت</option>
                        <option value="مهریز">مهریز</option>
                        <option value="بافق">بافق</option>
                      </select>
                    </div>

                    <div>
                      <label className="block mb-1.5 text-gray-700">عنوان طرح تسهیلاتی</label>
                      <select
                        value={formData.schemeType}
                        onChange={(e) => setFormData({ ...formData, schemeType: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#2A9D8F] focus:outline-none bg-white"
                      >
                        <option value="جوانی جمعیت (خانواده‌های ۳ فرزند و بیشتر)">
                          قانون جوانی جمعیت (واگذاری زمین ۲۰۰ متری رایگان)
                        </option>
                        <option value="نهضت ملی مسکن (ساخت ویلایی)">
                          نهضت ملی مسکن (آماده‌سازی زمین و تسهیلات ساخت)
                        </option>
                        <option value="نخبگان و زوجین جوان">طرح حمایتی زوجین جوان و نخبگان</option>
                      </select>
                    </div>

                    <div>
                      <label className="block mb-1.5 text-gray-700">سایت اراضی مورد علاقه</label>
                      <div className="space-y-2">
                        {sitesList.map((site) => (
                          <label
                            key={site.id}
                            className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                              formData.selectedSite === site.name
                                ? 'border-[#2A9D8F] bg-[#2A9D8F]/10'
                                : 'border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="radio"
                                name="siteSelect"
                                checked={formData.selectedSite === site.name}
                                onChange={() => setFormData({ ...formData, selectedSite: site.name })}
                                className="accent-[#2A9D8F]"
                              />
                              <div>
                                <h5 className="font-extrabold text-[#1F3A5F] text-xs">{site.name}</h5>
                                <p className="text-[11px] text-gray-500 font-semibold">{site.type} • {site.capacity}</p>
                              </div>
                            </div>
                            <span className="text-[10px] bg-white border border-gray-200 px-2.5 py-1 rounded-md font-bold text-[#2A9D8F]">
                              {site.status}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep(1)}
                      className="w-1/3 py-3.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-extrabold rounded-xl transition-all"
                    >
                      مرحله قبلی
                    </button>
                    <button
                      onClick={() => setStep(3)}
                      className="w-2/3 py-3.5 bg-[#1F3A5F] hover:bg-[#1F3A5F]/90 text-white font-extrabold rounded-xl shadow-md transition-all"
                    >
                      ادامه به مرحله تایید
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <form onSubmit={handleRegisterSubmit} className="space-y-6 max-w-2xl mx-auto">
                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-black text-[#1F3A5F]">مرحله سوم: نهایی‌سازی و ثبت رسمی درخواست</h3>
                    <p className="text-xs text-gray-500 font-bold">
                      لطفاً خلاصه اطلاعات وارد شده را بررسی و تایید نمایید.
                    </p>
                  </div>

                  <div className="bg-[#F5F6F8] p-6 rounded-2xl border border-gray-200 space-y-3 text-xs font-bold">
                    <div className="flex justify-between border-b border-gray-200 pb-2">
                      <span className="text-gray-500">متقاضی:</span>
                      <span className="text-[#1F3A5F]">{formData.fullName} (کد ملی: {formData.nationalCode})</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 pb-2">
                      <span className="text-gray-500">شماره همراه:</span>
                      <span className="text-[#1F3A5F]">{formData.mobile}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 pb-2">
                      <span className="text-gray-500">طرح انتخابی:</span>
                      <span className="text-[#2A9D8F]">{formData.schemeType}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 pb-2">
                      <span className="text-gray-500">محل واگذاری اراضی:</span>
                      <span className="text-[#B76E4C]">{formData.selectedSite}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">استعلام فرم ج:</span>
                      <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">سبز (واجد شرایط)</span>
                    </div>
                  </div>

                  <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-xs font-semibold flex items-start gap-2">
                    <i className="fa-solid fa-triangle-exclamation text-amber-600 mt-0.5"></i>
                    <span>
                      با ثبت درخواست، صحت کلیه اطلاعات فوق توسط سازمان ثبت احوال و اداره واگذاری اراضی استان یزد استعلام خواهد شد.
                    </span>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="w-1/3 py-3.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-extrabold rounded-xl transition-all"
                    >
                      ویرایش اطلاعات
                    </button>
                    <button
                      type="submit"
                      className="w-2/3 py-3.5 bg-[#2A9D8F] hover:bg-[#2A9D8F]/90 text-white font-extrabold rounded-xl shadow-lg transition-all"
                    >
                      ثبت نهایی و دریافت رسید دیجیتال
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 4: SUCCESS RECEIPT */}
              {step === 4 && trackingCode && (
                <div className="text-center space-y-6 max-w-xl mx-auto py-6">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto shadow-md">
                    <i className="fa-solid fa-circle-check"></i>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-[#1F3A5F]">درخواست شما با موفقیت ثبت شد</h3>
                    <p className="text-xs text-gray-600 font-bold">
                      کد رهگیری اختصاصی کاداستر اراضی استان یزد برای شما صادر گردید.
                    </p>
                  </div>

                  <div className="bg-[#1F3A5F] text-white p-6 rounded-2xl shadow-inner space-y-2 font-mono">
                    <span className="text-xs text-[#E7D3B1] block font-sans font-bold">کد پیگیری کاداستر:</span>
                    <span className="text-2xl font-black tracking-wider text-[#2A9D8F] block">{trackingCode}</span>
                  </div>

                  <p className="text-xs text-gray-500 font-semibold">
                    پیامک تاییدیه و دعوت‌نامه حضور در جلسه تحویل زمین به شماره {formData.mobile} ارسال خواهد شد.
                  </p>

                  <button
                    onClick={() => {
                      setStep(1);
                      setActiveTab('inquiry');
                    }}
                    className="px-8 py-3 bg-[#1F3A5F] text-white font-bold text-xs rounded-xl shadow-md hover:bg-[#1F3A5F]/90 transition-all"
                  >
                    پیگیری وضعیت این درخواست
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 2: INQUIRY PANEL */}
          {activeTab === 'inquiry' && (
            <motion.div
              key="inquiry"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-white rounded-3xl p-6 sm:p-10 shadow-lg border border-gray-200 space-y-8 max-w-3xl mx-auto"
            >
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-black text-[#1F3A5F]">استعلام آنلاین وضعیت پرونده تخصیص زمین</h3>
                <p className="text-xs text-gray-500 font-bold">
                  جهت مشاهده آخرین وضعیت تخصیص قطعه زمین، کد ملی و کد رهگیری خود را وارد کنید.
                </p>
              </div>

              <form onSubmit={handleInquiry} className="space-y-4 text-xs font-bold">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1.5 text-gray-700">کد ملی سرپرست خانوار *</label>
                    <input
                      type="text"
                      value={inquiryNationalCode}
                      onChange={(e) => setInquiryNationalCode(e.target.value)}
                      placeholder="4430123456"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#2A9D8F] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block mb-1.5 text-gray-700">کد رهگیری سامانه (اختیاری)</label>
                    <input
                      type="text"
                      value={inquiryTrackingCode}
                      onChange={(e) => setInquiryTrackingCode(e.target.value)}
                      placeholder="YAZD-LAND-1405-XXXXXX"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#2A9D8F] focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#2A9D8F] hover:bg-[#2A9D8F]/90 text-white font-extrabold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <i className="fa-solid fa-magnifying-glass"></i>
                  <span>استعلام پرونده و جایابی زمین</span>
                </button>
              </form>

              {/* Inquiry Result Panel */}
              {inquiryResult && (
                <div className="p-6 bg-[#F5F6F8] rounded-2xl border border-gray-300 space-y-4 animate-fade-in-up">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                    <span className="text-xs font-black text-[#1F3A5F]">وضعیت پرونده:</span>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-black text-xs">
                      تایید نهایی و آماده تحویل سند کاداستر
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-bold text-gray-700">
                    <div>سایت اختصاص‌یافته: <span className="text-[#1F3A5F]">{inquiryResult.siteName}</span></div>
                    <div>قطعه و بلوک: <span className="text-[#B76E4C]">{inquiryResult.allocatedPlot}</span></div>
                    <div>امتیاز اولویت: <span className="text-[#2A9D8F]">{inquiryResult.score} امتیاز</span></div>
                    <div>تاریخ قرعه‌کشی: <span className="text-gray-600">{inquiryResult.date}</span></div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => alert('برگه تخصیص اراضی کاداستر یزد آماده دریافت می‌باشد.')}
                      className="px-4 py-2 bg-[#1F3A5F] text-white font-bold text-xs rounded-lg shadow-sm"
                    >
                      دانلود برگ تخصیص زمین
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 3: CALCULATOR */}
          {activeTab === 'calculator' && (
            <motion.div
              key="calculator"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-white rounded-3xl p-6 sm:p-10 shadow-lg border border-gray-200 space-y-6 max-w-2xl mx-auto"
            >
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-black text-[#1F3A5F]">محاسبه‌گر امتیاز اولویت واگذاری اراضی</h3>
                <p className="text-xs text-gray-500 font-bold">
                  بر اساس شیوه‌نامه تخصیص زمین اداره کل راه و شهرسازی استان یزد.
                </p>
              </div>

              <div className="space-y-4 text-xs font-bold">
                <div>
                  <label className="block mb-1 text-gray-700">تعداد فرزندان زیر ۲۰ سال ({calcChildren} فرزند)</label>
                  <input
                    type="range"
                    min={0}
                    max={6}
                    value={calcChildren}
                    onChange={(e) => setCalcChildren(parseInt(e.target.value))}
                    className="w-full accent-[#2A9D8F]"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-gray-700">سابقه سکونت در استان یزد ({calcResidency} سال)</label>
                  <input
                    type="range"
                    min={1}
                    max={25}
                    value={calcResidency}
                    onChange={(e) => setCalcResidency(parseInt(e.target.value))}
                    className="w-full accent-[#1F3A5F]"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="isNative"
                    checked={calcIsNative}
                    onChange={(e) => setCalcIsNative(e.target.checked)}
                    className="w-4 h-4 accent-[#2A9D8F]"
                  />
                  <label htmlFor="isNative" className="text-gray-700 cursor-pointer">
                    بومی و متولد شهرستان‌های استان یزد (+۳۰ امتیاز هدیه بومی‌سازی)
                  </label>
                </div>
              </div>

              <div className="bg-[#1F3A5F] text-white p-6 rounded-2xl text-center space-y-2 shadow-md">
                <span className="text-xs text-[#E7D3B1] font-bold block">مجموع امتیاز اولویت شما:</span>
                <span className="text-4xl font-black text-[#2A9D8F] block">{calculatedScore} امتیاز</span>
                <p className="text-[11px] text-gray-300 font-semibold">
                  امتیاز بالای ۱۲۰ در نوبت اول واگذاری اراضی ویلایی کاریزبوم و صفائیه قرار می‌گیرد.
                </p>
              </div>
            </motion.div>
          )}

          {/* TAB 4: SITES LIST */}
          {activeTab === 'sites' && (
            <motion.div
              key="sites"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {sitesList.map((site) => (
                <div key={site.id} className="bg-white rounded-3xl p-6 shadow-md border border-gray-200 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="bg-[#2A9D8F]/15 text-[#2A9D8F] px-3 py-1 rounded-full text-xs font-black mb-2 inline-block">
                        {site.county}
                      </span>
                      <h4 className="text-lg font-black text-[#1F3A5F]">{site.name}</h4>
                    </div>
                    <span className="text-xs text-gray-500 font-bold bg-gray-100 px-3 py-1 rounded-lg">
                      {site.capacity}
                    </span>
                  </div>

                  <p className="text-xs text-gray-600 font-semibold">نوع معماری: {site.type}</p>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-gray-600">
                      <span>پیشرفت آماده‌سازی زیرساخت:</span>
                      <span>{site.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#2A9D8F] rounded-full" style={{ width: `${site.progress}%` }}></div>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-between items-center text-xs font-bold">
                    <span className="text-[#B76E4C]">{site.status}</span>
                    <button
                      onClick={() => {
                        setFormData({ ...formData, selectedSite: site.name });
                        setActiveTab('register');
                      }}
                      className="px-4 py-2 bg-[#1F3A5F] text-white rounded-xl hover:bg-[#1F3A5F]/90 transition-all cursor-pointer"
                    >
                      ثبت‌نام در این سایت
                    </button>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
