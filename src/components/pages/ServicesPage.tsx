import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SERVICES_DATA } from '../../data';
import { ServiceItem, ActivePage, InquiryResult } from '../../types';
import Breadcrumb from '../Breadcrumb';

interface ServicesPageProps {
  fontSizeScale: number;
  onNavigate: (page: ActivePage, itemId?: number) => void;
  initialServiceId?: number | null;
}

export default function ServicesPage({ fontSizeScale, onNavigate, initialServiceId }: ServicesPageProps) {
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // States for Interactive Forms
  const [nationalId, setNationalId] = useState('');
  const [inquiryResult, setInquiryResult] = useState<InquiryResult | null>(null);
  const [trackingCode, setTrackingCode] = useState('');
  const [trackingResult, setTrackingResult] = useState<any>(null);
  const [complaintForm, setComplaintForm] = useState({ name: '', phone: '', subject: '', text: '' });
  const [complaintSuccess, setComplaintSuccess] = useState<string | null>(null);
  const [letterForm, setLetterForm] = useState({ title: '', body: '', sender: '', phone: '' });
  const [letterSuccess, setLetterSuccess] = useState<string | null>(null);
  const [appointmentForm, setAppointmentForm] = useState({ name: '', phone: '', date: '', unit: '' });
  const [appointmentSuccess, setAppointmentSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (initialServiceId) {
      const match = SERVICES_DATA.find((s) => s.id === initialServiceId);
      if (match) {
        setSelectedService(match);
      }
    } else {
      setSelectedService(null);
    }
  }, [initialServiceId]);

  const resetForms = () => {
    setNationalId('');
    setInquiryResult(null);
    setTrackingCode('');
    setTrackingResult(null);
    setComplaintSuccess(null);
    setLetterSuccess(null);
    setAppointmentSuccess(null);
    setComplaintForm({ name: '', phone: '', subject: '', text: '' });
    setLetterForm({ title: '', body: '', sender: '', phone: '' });
    setAppointmentForm({ name: '', phone: '', date: '', unit: '' });
  };

  const handleSelectService = (service: ServiceItem) => {
    setSelectedService(service);
    resetForms();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToList = () => {
    setSelectedService(null);
    resetForms();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Form J Inquiry Logic
  const handleFormJInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (nationalId.length !== 10 || isNaN(Number(nationalId))) {
      alert('لطفاً کد ملی معتبر ۱۰ رقمی وارد نمایید.');
      return;
    }

    const lastDigit = Number(nationalId.charAt(9));
    if (lastDigit % 3 === 0) {
      setInquiryResult({
        status: 'passed',
        message: 'تبریک! استعلام فرم ج شما سبز است. شما فاقد مالکیت مسکونی و تسهیلات فعال دولتی هستید و مجاز به ثبت‌نام در طرح مسکن ملی می‌باشید.',
        nationalId,
        fullName: 'علیرضا حسینی یزدی',
        date: '۱۴۰۵/۰۴/۰۶',
      });
    } else if (lastDigit % 3 === 1) {
      setInquiryResult({
        status: 'failed',
        message: 'توجه: استعلام فرم ج شما قرمز است. بر اساس رکوردهای ثبت شده، شما قبلاً از تسهیلات مسکن دولتی یا زمین واگذاری استفاده نموده‌اید.',
        nationalId,
        fullName: 'مرضیه باقری تفت',
        date: '۱۴۰۵/۰۴/۰۶',
      });
    } else {
      setInquiryResult({
        status: 'not_found',
        message: 'کد ملی وارد شده در سامانه یکپارچه نهضت ملی مسکن یافت نشد. جهت ثبت‌نام جدید اقدام نمایید.',
        nationalId,
      });
    }
  };

  // Request Tracking Logic
  const handleTrackRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingCode.trim()) {
      alert('لطفاً کد رهگیری وارد نمایید.');
      return;
    }

    setTrackingResult({
      code: trackingCode,
      steps: [
        { label: 'ثبت اولیه پرونده در پیشخوان', date: '۱۴۰۵/۰۱/۱۵', completed: true },
        { label: 'بررسی مدارک و تایید فرم ج', date: '۱۴۰۵/۰۲/۱۰', completed: true },
        { label: 'واریز سهم آورده اولیه (۴۰ میلیون)', date: '۱۴۰۵/۰۳/۰۵', completed: true },
        { label: 'تخصیص پروژه در کارگاه پردیس یزد', date: '۱۴۰۵/۰۳/۲۰', completed: true },
        { label: 'صدور معرفی‌نامه به بانک مسکن', date: 'در حال بررسی توسط کارشناس', completed: false },
      ],
      currentStep: 4,
    });
  };

  // Complaint Submit
  const handleComplaintSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintForm.name || !complaintForm.phone || !complaintForm.text) {
      alert('لطفاً موارد ستاره‌دار را تکمیل نمایید.');
      return;
    }
    const trackingNo = 'S-' + Math.floor(100000 + Math.random() * 900000);
    setComplaintSuccess(trackingNo);
  };

  // Letter Submit
  const handleLetterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!letterForm.title || !letterForm.body || !letterForm.sender) {
      alert('لطفاً فیلدهای ضروری را تکمیل فرمایید.');
      return;
    }
    const letterNo = 'M-' + Math.floor(10000 + Math.random() * 90000);
    setLetterSuccess(letterNo);
  };

  // Appointment Desk Submit
  const handleAppointmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointmentForm.name || !appointmentForm.phone || !appointmentForm.date) {
      alert('تکمیل کلیه فیلدها الزامی است.');
      return;
    }
    const ticketNo = 'T-' + Math.floor(100 + Math.random() * 900);
    setAppointmentSuccess(ticketNo);
  };

  const filteredServices = SERVICES_DATA.filter(
    (s) => s.title.includes(searchQuery) || s.description.includes(searchQuery)
  );

  const servicesBreadcrumbItems = selectedService
    ? [
        { label: 'صفحه اصلی', icon: 'fa-house', onClick: () => onNavigate('home') },
        { label: 'پیشخوان خدمات الکترونیک', onClick: handleBackToList },
        { label: selectedService.title, active: true },
      ]
    : searchQuery.trim() !== ''
    ? [
        { label: 'صفحه اصلی', icon: 'fa-house', onClick: () => onNavigate('home') },
        { label: 'پیشخوان خدمات الکترونیک', onClick: () => setSearchQuery('') },
        { label: `جستجو: ${searchQuery}`, active: true },
      ]
    : [
        { label: 'صفحه اصلی', icon: 'fa-house', onClick: () => onNavigate('home') },
        { label: 'میز پیشخوان خدمات الکترونیک', active: true },
      ];

  return (
    <div className="min-h-screen bg-[#F5F6F8] pb-20 text-[#1F3A5F]" style={{ fontSize: `${16 * fontSizeScale}px` }}>
      {/* Dynamic Breadcrumb Header */}
      <Breadcrumb
        currentPage="services"
        pageTitle="میز پیشخوان خدمات الکترونیک"
        items={servicesBreadcrumbItems}
        onNavigate={onNavigate}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <AnimatePresence mode="wait">
          {selectedService ? (
            /* DEDICATED INDIVIDUAL SERVICE PAGE VIEW */
            <motion.div
              key="single-service"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Service Hero Banner Panel */}
              <div className="glass-panel border border-white/60 rounded-3xl p-6 sm:p-8 shadow-xl bg-gradient-to-br from-white/90 via-white/70 to-emerald-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-start sm:items-center gap-5">
                  <div
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-white text-3xl sm:text-4xl shadow-lg shrink-0"
                    style={{ backgroundColor: selectedService.color }}
                  >
                    <i className={selectedService.icon}></i>
                  </div>
                  <div className="space-y-1">
                    <span className="inline-block bg-[#2A9D8F]/10 text-[#2A9D8F] font-extrabold text-xs px-3 py-1 rounded-full">
                      سامانه هوشمند کشوری و استانی
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-[#1F3A5F]">
                      {selectedService.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-600 font-bold leading-relaxed">
                      {selectedService.description}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 w-full md:w-auto justify-end">
                  <button
                    onClick={handleBackToList}
                    className="bg-[#1F3A5F] hover:bg-[#1F3A5F]/90 text-white text-xs font-bold px-5 py-3 rounded-xl flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    <i className="fa-solid fa-grid-2"></i>
                    <span>همه خدمات الکترونیک</span>
                  </button>
                  <button
                    onClick={() => onNavigate('home')}
                    className="bg-white hover:bg-gray-50 text-[#1F3A5F] border border-gray-200 text-xs font-bold px-4 py-3 rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <i className="fa-solid fa-house"></i>
                    <span>صفحه اصلی</span>
                  </button>
                </div>
              </div>

              {/* Main Service Interactive Workspace Panel */}
              <div className="glass-panel border border-white/60 rounded-3xl p-6 sm:p-10 shadow-lg bg-white/80">
                {/* SERVICE 1: پنجره واحد خدمات */}
                {selectedService.id === 1 && (
                  <div className="space-y-6">
                    <div className="border-b pb-4">
                      <h3 className="text-lg font-black text-[#1F3A5F] mb-1">پنجره یکپارچه خدمات الکترونیک راه و شهرسازی</h3>
                      <p className="text-xs text-gray-600 leading-relaxed font-semibold">
                        در این درگاه می‌توانید به تمامی سامانه‌های زیرمجموعه وزارت راه و شهرسازی استان یزد به صورت یکپارچه با ورود از طریق پنجره ملی خدمات دولت هوشمند دسترسی داشته باشید.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[
                        { title: 'سامانه نهضت ملی مسکن (سمن)', icon: 'fa-house-chimney-window', desc: 'ثبت‌نام، استعلام و تخصیص زمین', color: '#1F3A5F', id: 2 },
                        { title: 'استعلام فوراً سبز بودن فرم ج', icon: 'fa-file-signature', desc: 'استعلام کد ملی جهت فاقد مسکن بودن', color: '#2A9D8F', id: 3 },
                        { title: 'سامانه پیگیری پرونده', icon: 'fa-magnifying-glass-chart', desc: 'پیگیری نوبت، مجوزها و کمیسیون‌ها', color: '#B76E4C', id: 6 },
                        { title: 'سامانه دبیرخانه و مکاتبات', icon: 'fa-envelope-open-text', desc: 'ثبت الکترونیکی نامه‌ها و دریافت شماره ثبت', color: '#1F3A5F', id: 5 },
                        { title: 'میز شکایت و بازرسی آنلاین', icon: 'fa-shield-halved', desc: 'ثبت شکایات مردمی و گزارش تخلفات', color: '#B76E4C', id: 7 },
                        { title: 'نوبت‌دهی ملاقات حضوری', icon: 'fa-calendar-check', desc: 'دریافت نوبت الکترونیکی با مسئولان', color: '#C98A5A', id: 8 },
                      ].map((portal, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            const found = SERVICES_DATA.find((s) => s.id === portal.id);
                            if (found) handleSelectService(found);
                          }}
                          className="bg-white p-5 rounded-2xl border border-gray-200/80 hover:border-[#2A9D8F] shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-base shadow" style={{ backgroundColor: portal.color }}>
                              <i className={`fa-solid ${portal.icon}`}></i>
                            </div>
                            <div>
                              <h4 className="text-xs font-black text-[#1F3A5F] group-hover:text-[#2A9D8F] transition-colors">{portal.title}</h4>
                              <p className="text-[11px] text-gray-500 font-medium">{portal.desc}</p>
                            </div>
                          </div>
                          <div className="text-[11px] font-bold text-[#2A9D8F] flex items-center justify-end gap-1">
                            <span>ورود مستقیم</span>
                            <i className="fa-solid fa-arrow-left text-[9px] group-hover:-translate-x-1 transition-transform"></i>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SERVICE 2: نهضت ملی مسکن */}
                {selectedService.id === 2 && (
                  <div className="space-y-6">
                    <div className="bg-[#1F3A5F] text-white p-6 rounded-2xl space-y-3 shadow-md">
                      <div className="flex items-center gap-3">
                        <i className="fa-solid fa-house-chimney text-3xl text-[#2A9D8F]"></i>
                        <div>
                          <h3 className="text-lg font-black">درگاه نهضت ملی مسکن استان یزد</h3>
                          <p className="text-xs text-gray-300 font-medium">طرح جامع تامین مسکن ویلایی و آپارتمانی برای جوانان و خانوارها</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-200 leading-relaxed font-semibold pt-2 border-t border-white/10">
                        استان یزد در اجرای پروژه‌های ساخت مسکن ویلایی یک‌طبقه و دوطبقه حائز رتبه برتر کشور است. جهت استعلام شرایط یا پیگیری ثبت‌نام قبلی از گزینه‌های زیر استفاده نمایید.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div
                        onClick={() => {
                          const found = SERVICES_DATA.find((s) => s.id === 3);
                          if (found) handleSelectService(found);
                        }}
                        className="bg-emerald-50/80 p-5 rounded-2xl border border-emerald-200 cursor-pointer hover:bg-emerald-100/80 transition-all flex items-center gap-4"
                      >
                        <div className="w-12 h-12 rounded-xl bg-[#2A9D8F] text-white flex items-center justify-center text-xl shrink-0">
                          <i className="fa-solid fa-file-circle-check"></i>
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-emerald-900">استعلام آنلاین فرم ج</h4>
                          <p className="text-xs text-emerald-700 font-medium">بررسی سبز بودن فرم ج با وارد کردن کد ملی ۱۰ رقمی</p>
                        </div>
                      </div>

                      <div
                        onClick={() => {
                          const found = SERVICES_DATA.find((s) => s.id === 6);
                          if (found) handleSelectService(found);
                        }}
                        className="bg-blue-50/80 p-5 rounded-2xl border border-blue-200 cursor-pointer hover:bg-blue-100/80 transition-all flex items-center gap-4"
                      >
                        <div className="w-12 h-12 rounded-xl bg-[#1F3A5F] text-white flex items-center justify-center text-xl shrink-0">
                          <i className="fa-solid fa-magnifying-glass-chart"></i>
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-blue-900">پیگیری پرونده مسکن ملی</h4>
                          <p className="text-xs text-blue-700 font-medium">مشاهده تخصیص پروژه، سهم آورده و وام بانک مسکن</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* SERVICE 3: استعلام فرم ج */}
                {selectedService.id === 3 && (
                  <div className="space-y-6">
                    <div className="bg-emerald-50 text-emerald-900 p-4 sm:p-5 rounded-2xl text-xs sm:text-sm leading-relaxed border border-emerald-200">
                      <i className="fa-solid fa-circle-info ml-2 text-emerald-600 text-base"></i>
                      <strong>فرم ج چیست؟</strong> سبز بودن فرم ج نشان‌دهنده فاقد مسکن بودن متقاضی و همسر بوده و شرط اصلی بهره‌مندی از زمین‌های واگذاری دولت یا تسهیلات بانکی یارانه‌ای مسکن در استان یزد می‌باشد.
                    </div>

                    <form onSubmit={handleFormJInquiry} className="space-y-4 bg-gray-50/80 p-6 rounded-2xl border border-gray-200">
                      <label className="block text-xs sm:text-sm font-extrabold text-[#1F3A5F]">
                        کد ملی متقاضی جهت استعلام سیستمیک (۱۰ رقم):
                      </label>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <input
                          type="text"
                          maxLength={10}
                          placeholder="مثال: ۴۴۳۰۵۴۷۸۹۰"
                          value={nationalId}
                          onChange={(e) => setNationalId(e.target.value)}
                          className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm font-mono tracking-widest text-left focus:ring-2 focus:ring-[#2A9D8F] focus:outline-none bg-white shadow-sm"
                        />
                        <button
                          type="submit"
                          className="bg-[#1F3A5F] hover:bg-[#1F3A5F]/95 text-white font-black px-8 py-3 rounded-xl text-sm transition-colors cursor-pointer shadow-md"
                        >
                          استعلام فوری فرم ج
                        </button>
                      </div>
                    </form>

                    {inquiryResult && (
                      <div
                        className="p-6 rounded-2xl border animate-fade-in-up space-y-3"
                        style={{
                          backgroundColor: inquiryResult.status === 'passed' ? '#ECFDF5' : inquiryResult.status === 'failed' ? '#FEF2F2' : '#F9FAFB',
                          borderColor: inquiryResult.status === 'passed' ? '#10B981' : inquiryResult.status === 'failed' ? '#EF4444' : '#E5E7EB',
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <i
                            className={`text-2xl fa-solid ${
                              inquiryResult.status === 'passed'
                                ? 'fa-circle-check text-emerald-600'
                                : inquiryResult.status === 'failed'
                                ? 'fa-circle-xmark text-red-600'
                                : 'fa-circle-question text-gray-500'
                            }`}
                          ></i>
                          <span
                            className="font-extrabold text-base sm:text-lg"
                            style={{
                              color:
                                inquiryResult.status === 'passed'
                                  ? '#047857'
                                  : inquiryResult.status === 'failed'
                                  ? '#B91C1C'
                                  : '#374151',
                            }}
                          >
                            {inquiryResult.status === 'passed'
                              ? 'وضعیت فرم ج: سبز (واجد شرایط ثبت‌نام)'
                              : inquiryResult.status === 'failed'
                              ? 'وضعیت فرم ج: قرمز (دارای سابقه ملک یا تسهیلات)'
                              : 'کد ملی در سامانه ثبت نشده است'}
                          </span>
                        </div>

                        <p className="text-xs sm:text-sm leading-relaxed font-semibold text-gray-700">
                          {inquiryResult.message}
                        </p>

                        {inquiryResult.fullName && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono text-gray-600 border-t pt-3 border-dashed border-gray-300">
                            <div>نام و نام خانوادگی: <strong className="text-gray-900 font-bold">{inquiryResult.fullName}</strong></div>
                            <div>تاریخ استعلام: <strong className="text-gray-900 font-bold">{inquiryResult.date}</strong></div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* SERVICE 4: نظام مهندسی */}
                {selectedService.id === 4 && (
                  <div className="space-y-6">
                    <div className="bg-[#C98A5A]/10 border border-[#C98A5A]/30 p-5 rounded-2xl flex items-center gap-4 text-[#1F3A5F]">
                      <i className="fa-solid fa-compass-drafting text-4xl text-[#C98A5A]"></i>
                      <div>
                        <h3 className="text-base font-black">درگاه خدمات مهندسان و نظام مهندسی ساختمان استان یزد</h3>
                        <p className="text-xs text-gray-600 font-semibold mt-1">تسهیل امور صدور پروانه اشتغال، ارجاع کار نظارت و کنترل نقشه‌های ساختمانی</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-2">
                        <i className="fa-solid fa-id-card text-2xl text-[#1F3A5F]"></i>
                        <h4 className="text-xs font-black text-[#1F3A5F]">تمدید پروانه اشتغال</h4>
                        <p className="text-[11px] text-gray-500 font-medium">ارسال مدارک و پرداخت عوارض سالانه مهندسان</p>
                      </div>
                      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-2">
                        <i className="fa-solid fa-[#2A9D8F] fa-file-pen text-2xl text-[#2A9D8F]"></i>
                        <h4 className="text-xs font-black text-[#1F3A5F]">تایید و کنترل نقشه</h4>
                        <p className="text-[11px] text-gray-500 font-medium">بارگذاری نقشه محاسباتی، معماری و تاسیسات</p>
                      </div>
                      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-2">
                        <i className="fa-solid fa-building-circle-check text-2xl text-[#B76E4C]"></i>
                        <h4 className="text-xs font-black text-[#1F3A5F]">گزارش ناظر ساختمانی</h4>
                        <p className="text-[11px] text-gray-500 font-medium">ثبت گزارش مرحله‌ای فونداسیون، سقف و پایان‌کار</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* SERVICE 5: سامانه مکاتبات */}
                {selectedService.id === 5 && (
                  <div className="space-y-6">
                    {letterSuccess ? (
                      <div className="p-8 bg-emerald-50 rounded-2xl border border-emerald-300 text-center space-y-4 animate-fade-in-up">
                        <i className="fa-solid fa-file-circle-check text-5xl text-emerald-600"></i>
                        <h4 className="text-lg font-black text-emerald-800">نامه اداری شما با موفقیت در دبیرخانه الکترونیک ثبت شد.</h4>
                        <p className="text-xs sm:text-sm text-emerald-900 font-medium leading-relaxed max-w-lg mx-auto">
                          نامه شما برای مدیریت اداره کل راه و شهرسازی استان یزد صادر شد. شماره ثبت اندیکاتور صادر شده را جهت پیگیری یادداشت فرمایید.
                        </p>
                        <div className="inline-block bg-white border border-emerald-300 px-6 py-3 rounded-xl shadow-sm">
                          <span className="text-xs text-gray-500 block">شماره اندیکاتور پیگیری مکاتبه:</span>
                          <strong className="text-lg font-mono text-emerald-800 tracking-wider">{letterSuccess}</strong>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={handleLetterSubmit} className="space-y-4">
                        <div className="border-b pb-3">
                          <h3 className="text-base font-black text-[#1F3A5F]">ثبت نامه و درخواست رسمی الکترونیکی</h3>
                          <p className="text-xs text-gray-500 font-semibold">بدون نیاز به مراجعه حضوری، درخواست خود را مستقیماً به دبیرخانه ارسال نمایید.</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1.5">نام فرستنده / شرکت / سازمان *</label>
                            <input
                              type="text"
                              required
                              value={letterForm.sender}
                              onChange={(e) => setLetterForm({ ...letterForm, sender: e.target.value })}
                              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#2A9D8F] focus:outline-none bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1.5">شماره همراه فرستنده *</label>
                            <input
                              type="text"
                              required
                              value={letterForm.phone}
                              onChange={(e) => setLetterForm({ ...letterForm, phone: e.target.value })}
                              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-mono focus:ring-2 focus:ring-[#2A9D8F] focus:outline-none bg-white"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1.5">عنوان نامه / موضوع مکاتبه *</label>
                          <input
                            type="text"
                            required
                            value={letterForm.title}
                            onChange={(e) => setLetterForm({ ...letterForm, title: e.target.value })}
                            placeholder="مثال: درخواست تغییر کاربری زمین کارگاهی در شهرک صنعتی تفت"
                            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#2A9D8F] focus:outline-none bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1.5">متن صریح نامه اداری *</label>
                          <textarea
                            rows={5}
                            required
                            value={letterForm.body}
                            onChange={(e) => setLetterForm({ ...letterForm, body: e.target.value })}
                            placeholder="جناب آقای مدیرکل، با سلام و احترام، بدینوسیله به استحضار می‌رساند که..."
                            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#2A9D8F] focus:outline-none bg-white"
                          ></textarea>
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-[#1F3A5F] hover:bg-[#1F3A5F]/95 text-white font-bold py-3.5 rounded-xl text-sm transition-colors cursor-pointer shadow-md"
                        >
                          ثبت و صدور شماره اندیکاتور دبیرخانه
                        </button>
                      </form>
                    )}
                  </div>
                )}

                {/* SERVICE 6: پیگیری درخواست */}
                {selectedService.id === 6 && (
                  <div className="space-y-6">
                    <p className="text-xs sm:text-sm text-gray-600 font-semibold leading-relaxed">
                      با وارد کردن کد رهگیری پرونده مسکن، شهرسازی یا واگذاری اراضی، مراحل کارشناسی را به صورت شفاف پیگیری کنید.
                    </p>

                    <form onSubmit={handleTrackRequest} className="space-y-3 bg-gray-50/80 p-5 rounded-2xl border">
                      <label className="block text-xs font-extrabold text-[#1F3A5F]">کد رهگیری پرونده:</label>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <input
                          type="text"
                          placeholder="مثال: ۴۵۸۲۳"
                          value={trackingCode}
                          onChange={(e) => setTrackingCode(e.target.value)}
                          className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-mono focus:ring-2 focus:ring-[#2A9D8F] focus:outline-none bg-white"
                        />
                        <button
                          type="submit"
                          className="bg-[#2A9D8F] hover:bg-[#2A9D8F]/90 text-white font-black px-8 py-2.5 rounded-xl text-sm transition-colors cursor-pointer shadow-md"
                        >
                          بررسی وضعیت پرونده
                        </button>
                      </div>
                    </form>

                    {trackingResult && (
                      <div className="mt-4 border border-gray-200 rounded-2xl p-6 bg-gray-50/90 animate-fade-in-up space-y-4">
                        <h4 className="text-sm font-black text-[#1F3A5F]">
                          وضعیت گام‌به‌گام پرونده کد: <span className="font-mono text-[#B76E4C]">{trackingResult.code}</span>
                        </h4>

                        <div className="relative border-r-2 border-gray-300 pr-6 space-y-6 mr-3">
                          {trackingResult.steps.map((step: any, index: number) => (
                            <div key={index} className="relative">
                              <span
                                className={`absolute -right-[31px] top-1 w-4 h-4 rounded-full border-2 ${
                                  step.completed ? 'bg-[#2A9D8F] border-[#2A9D8F]' : 'bg-white border-gray-400'
                                }`}
                              ></span>
                              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                                <span className={`text-xs sm:text-sm font-bold ${step.completed ? 'text-gray-900' : 'text-gray-400 font-medium'}`}>
                                  {step.label}
                                </span>
                                <span className="text-xs font-mono text-gray-500 mt-1 sm:mt-0">{step.date}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* SERVICE 7: ثبت شکایت */}
                {selectedService.id === 7 && (
                  <div className="space-y-6">
                    {complaintSuccess ? (
                      <div className="p-8 bg-emerald-50 rounded-2xl border border-emerald-300 text-center space-y-4 animate-fade-in-up">
                        <i className="fa-solid fa-circle-check text-5xl text-emerald-600"></i>
                        <h4 className="text-lg font-black text-emerald-800">شکایت شما با موفقیت در سامانه بازرسی یزد ثبت شد.</h4>
                        <p className="text-xs sm:text-sm text-emerald-900 font-medium leading-relaxed max-w-md mx-auto">
                          گزارش شما مستقیماً به واحد ارزیابی عملکرد و بازرسی اداره کل ارسال شد. پاسخ حداکثر ظرف ۴۸ ساعت کاری در اختیارتان قرار می‌گیرد.
                        </p>
                        <div className="inline-block bg-white border border-emerald-300 px-6 py-3 rounded-xl shadow-sm">
                          <span className="text-xs text-gray-500 block">کد پیگیری شکایت:</span>
                          <strong className="text-lg font-mono text-emerald-800 tracking-wider">{complaintSuccess}</strong>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={handleComplaintSubmit} className="space-y-4">
                        <div className="border-b pb-3">
                          <h3 className="text-base font-black text-red-800">سامانه ثبت شکایات و گزارش‌های مردمی</h3>
                          <p className="text-xs text-gray-500 font-semibold">ارسال گزارش عدم رعایت تکریم ارباب رجوع یا تاخیر در پروژه‌ها به بازرسی اداره کل</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1.5">نام و نام خانوادگی شاکی *</label>
                            <input
                              type="text"
                              required
                              value={complaintForm.name}
                              onChange={(e) => setComplaintForm({ ...complaintForm, name: e.target.value })}
                              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#2A9D8F] focus:outline-none bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1.5">شماره تماس (موبایل) *</label>
                            <input
                              type="text"
                              required
                              value={complaintForm.phone}
                              onChange={(e) => setComplaintForm({ ...complaintForm, phone: e.target.value })}
                              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-mono focus:ring-2 focus:ring-[#2A9D8F] focus:outline-none bg-white"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1.5">موضوع شکایت / عنوان گزارش</label>
                          <input
                            type="text"
                            value={complaintForm.subject}
                            onChange={(e) => setComplaintForm({ ...complaintForm, subject: e.target.value })}
                            placeholder="مثال: تاخیر در پاسخگویی پرونده کمیسیون ماده ۵"
                            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#2A9D8F] focus:outline-none bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1.5">شرح کامل شکایت با جزئیات *</label>
                          <textarea
                            rows={4}
                            required
                            value={complaintForm.text}
                            onChange={(e) => setComplaintForm({ ...complaintForm, text: e.target.value })}
                            placeholder="لطفاً تاریخ مراجعه، شماره پرونده یا نام باجه مربوطه را ذکر نمایید..."
                            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#2A9D8F] focus:outline-none bg-white"
                          ></textarea>
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl text-sm transition-colors cursor-pointer shadow-md"
                        >
                          ارسال شکایت رسمی به بازرسی
                        </button>
                      </form>
                    )}
                  </div>
                )}

                {/* SERVICE 8: میز خدمت حضوری */}
                {selectedService.id === 8 && (
                  <div className="space-y-6">
                    {appointmentSuccess ? (
                      <div className="p-8 bg-emerald-50 rounded-2xl border border-emerald-300 text-center space-y-4 animate-fade-in-up">
                        <i className="fa-solid fa-calendar-check text-5xl text-emerald-600"></i>
                        <h4 className="text-lg font-black text-emerald-800">نوبت ملاقات حضوری شما با موفقیت رزرو گردید.</h4>
                        <p className="text-xs sm:text-sm text-emerald-900 font-medium leading-relaxed max-w-md mx-auto">
                          خواهشمند است در تاریخ تعیین‌شده رأس ساعت ۹:۳۰ همراه با کارت ملی و اصل مدارک پرونده به باجه میز خدمت اداره کل واقع در یزد مراجعه فرمایید.
                        </p>
                        <div className="inline-block bg-white border border-emerald-300 px-6 py-3 rounded-xl shadow-sm">
                          <span className="text-xs text-gray-500 block">کد رزرو نوبت الکترونیکی:</span>
                          <strong className="text-lg font-mono text-emerald-800 tracking-wider">{appointmentSuccess}</strong>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={handleAppointmentSubmit} className="space-y-4">
                        <div className="border-b pb-3">
                          <h3 className="text-base font-black text-[#1F3A5F]">سامانه نوبت‌دهی آنلاین میز خدمت و ملاقات مردمی</h3>
                          <p className="text-xs text-gray-500 font-semibold">جهت صرفه‌جویی در وقت، نوبت مراجعه حضوری خود را از قبل رزرو فرمایید.</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1.5">نام و نام خانوادگی ارباب‌رجوع *</label>
                            <input
                              type="text"
                              required
                              value={appointmentForm.name}
                              onChange={(e) => setAppointmentForm({ ...appointmentForm, name: e.target.value })}
                              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#2A9D8F] focus:outline-none bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1.5">تلفن همراه *</label>
                            <input
                              type="text"
                              required
                              value={appointmentForm.phone}
                              onChange={(e) => setAppointmentForm({ ...appointmentForm, phone: e.target.value })}
                              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-mono focus:ring-2 focus:ring-[#2A9D8F] focus:outline-none bg-white"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1.5">انتخاب واحد اداری مربوطه *</label>
                            <select
                              required
                              value={appointmentForm.unit}
                              onChange={(e) => setAppointmentForm({ ...appointmentForm, unit: e.target.value })}
                              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#2A9D8F] focus:outline-none bg-white"
                            >
                              <option value="">-- انتخاب بخش --</option>
                              <option value="معاونت املاک و حقوقی">معاونت املاک و حقوقی (واگذاری زمین)</option>
                              <option value="معاونت مسکن و ساختمان">معاونت مسکن و ساختمان (نهضت مسکن)</option>
                              <option value="شهرسازی و طرح‌های جامع">شهرسازی و طرح‌های جامع (کمیسیون ماده ۵)</option>
                              <option value="مدیرکل راه و شهرسازی">ملاقات مردمی مستقیم با مدیرکل</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1.5">انتخاب روز مراجعه *</label>
                            <select
                              required
                              value={appointmentForm.date}
                              onChange={(e) => setAppointmentForm({ ...appointmentForm, date: e.target.value })}
                              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#2A9D8F] focus:outline-none bg-white"
                            >
                              <option value="">-- انتخاب روز --</option>
                              <option value="شنبه ۱۰ تیر">شنبه ۱۰ تیر ۱۴۰۵</option>
                              <option value="دوشنبه ۱۲ تیر">دوشنبه ۱۲ تیر ۱۴۰۵</option>
                              <option value="چهارشنبه ۱۴ تیر">چهارشنبه ۱۴ تیر ۱۴۰۵</option>
                            </select>
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-[#C98A5A] hover:bg-[#C98A5A]/90 text-white font-bold py-3.5 rounded-xl text-sm transition-colors cursor-pointer shadow-md"
                        >
                          ثبت نهایی و دریافت نوبت حضور
                        </button>
                      </form>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            /* ALL SERVICES CATALOG GRID VIEW */
            <motion.div
              key="services-list"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Top Filter and Search Header */}
              <div className="glass-panel border border-white/60 rounded-3xl p-6 shadow-md flex flex-col md:flex-row justify-between items-center gap-4 bg-white/70">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-[#1F3A5F] flex items-center gap-2">
                    <i className="fa-solid fa-cubes text-[#B76E4C]"></i>
                    <span>کاتالوگ کامل پیشخوان خدمات هوشمند</span>
                  </h2>
                  <p className="text-xs text-gray-600 font-bold mt-1">
                    جهت ورود به هر سامانه روی خدمت مورد نظر کلیک فرمایید.
                  </p>
                </div>

                <div className="relative w-full md:w-80">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="جستجو در نام یا شرح خدمات..."
                    className="w-full bg-white border border-gray-300 rounded-xl pr-10 pl-4 py-2.5 text-xs font-semibold focus:ring-2 focus:ring-[#2A9D8F] focus:outline-none shadow-sm"
                  />
                  <i className="fa-solid fa-magnifying-glass absolute right-3.5 top-3 text-gray-400 text-sm"></i>
                </div>
              </div>

              {/* Services Grid (8 Services) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredServices.map((service, index) => (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -6 }}
                    onClick={() => handleSelectService(service)}
                    className="group relative bg-white/90 rounded-2xl p-6 text-right transition-all duration-300 flex flex-col justify-between min-h-[220px] cursor-pointer border border-white/80 hover:border-[#2A9D8F] shadow-md hover:shadow-xl"
                  >
                    <div>
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-4 shadow-md transition-transform group-hover:scale-110"
                        style={{ backgroundColor: service.color }}
                      >
                        <i className={`${service.icon} text-xl`}></i>
                      </div>
                      <h3 className="text-base font-extrabold text-[#1F3A5F] mb-2 group-hover:text-[#B76E4C] transition-colors">
                        {service.title}
                      </h3>
                      <p className="text-xs text-gray-600 font-bold leading-relaxed">
                        {service.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs font-bold text-[#2A9D8F] mt-6 border-t pt-3 border-gray-100">
                      <span className="group-hover:translate-x-1 transition-transform">ورود اختصاصی به صفحه خدمت</span>
                      <i className="fa-solid fa-arrow-left-long text-sm group-hover:-translate-x-1 transition-transform"></i>
                    </div>
                  </motion.div>
                ))}
              </div>

              {filteredServices.length === 0 && (
                <div className="text-center py-16 bg-white/60 rounded-3xl border border-dashed border-gray-300">
                  <i className="fa-solid fa-file-circle-xmark text-4xl text-gray-400 mb-3 block"></i>
                  <p className="text-sm font-bold text-gray-600">خدمتی متناظر با واژه وارد شده یافت نشد.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
