import React, { useState } from 'react';
import { motion } from 'motion/react';
import { SERVICES_DATA } from '../data';
import { ServiceItem, ActivePage, InquiryResult } from '../types';

interface ServicesProps {
  fontSizeScale: number;
  onNavigate?: (page: ActivePage, itemId?: number) => void;
}

export default function Services({ fontSizeScale, onNavigate }: ServicesProps) {
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);

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

  const handleOpenService = (service: ServiceItem) => {
    if (onNavigate) {
      onNavigate('services', service.id);
      return;
    }
    setSelectedService(service);
    // Reset forms
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

  // Form J Inquiry Logic
  const handleFormJInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (nationalId.length !== 10 || isNaN(Number(nationalId))) {
      alert('لطفاً کد ملی معتبر ۱۰ رقمی وارد نمایید.');
      return;
    }

    // Interactive simulated check
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

    // Simple tracking visual responses
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

  return (
    <section
      id="services"
      className="py-16 px-4 max-w-7xl mx-auto"
      style={{ fontSize: `${16 * fontSizeScale}px` }}
    >
      {/* Yazd Architectural Decorative Tile Frame Heading */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="text-center mb-12"
      >
        <span className="text-[#2A9D8F] font-bold text-sm tracking-widest block mb-2 uppercase">
          💠 پیشخوان خدمات هوشمند شهروندان
        </span>
        <h3 className="text-3xl md:text-4xl font-black text-[#1F3A5F] flex items-center justify-center gap-2">
          <i className="fa-solid fa-cubes text-[#B76E4C] text-2xl"></i>
          <span>خدمات الکترونیک اداره کل</span>
        </h3>
        <p className="text-[#C98A5A] text-sm md:text-base font-semibold max-w-xl mx-auto mt-3">
          برای دسترسی سریع و پیگیری امور بدون نیاز به مراجعه حضوری، روی یکی از خدمات زیر کلیک کنید.
        </p>
        <div className="w-24 h-1 bg-gradient-to-r from-[#2A9D8F] via-[#B76E4C] to-[#2A9D8F] mx-auto mt-4 rounded-full"></div>
      </motion.div>

      {/* Conditional View: Services Grid OR Selected Service Dedicated Page */}
      {!selectedService ? (
        /* Services Grid (4 Columns) */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SERVICES_DATA.map((service, index) => (
            <motion.button
              key={service.id}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{
                duration: 0.5,
                delay: index * 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
              whileHover={{ y: -6, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleOpenService(service)}
              className="group relative glass-card rounded-2xl p-6 text-right transition-shadow duration-300 flex flex-col justify-between min-h-[190px] focus:outline-none cursor-pointer border border-white/40 hover:border-[#2A9D8F]/50 shadow-md hover:shadow-xl"
            >
              {/* Tile Background Decor */}
              <div className="absolute top-2 left-2 opacity-5 group-hover:opacity-15 transition-opacity pointer-events-none text-2xl">
                <i className="fa-solid fa-mosque"></i>
              </div>

              <div>
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white mb-4 shadow-sm transition-transform group-hover:rotate-6"
                  style={{ backgroundColor: service.color }}
                >
                  <i className={`${service.icon} text-lg`}></i>
                </div>
                <h4 className="text-base font-extrabold text-[#1F3A5F] mb-2 group-hover:text-[#B76E4C] transition-colors">
                  {service.title}
                </h4>
                <p className="text-xs text-gray-600 font-bold leading-relaxed">
                  {service.description}
                </p>
              </div>

              <div className="flex items-center justify-end gap-1 text-xs font-bold text-[#2A9D8F] mt-4 opacity-85 group-hover:opacity-100">
                <span>ورود به سامانه</span>
                <i className="fa-solid fa-arrow-left-long text-[10px] group-hover:-translate-x-1 transition-transform"></i>
              </div>
            </motion.button>
          ))}
        </div>
      ) : (
        /* Dedicated Service Page View */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel border border-white/50 rounded-3xl shadow-2xl max-w-4xl mx-auto overflow-hidden"
        >
          {/* Header & Back Button */}
          <div className="bg-white/60 backdrop-blur-md p-6 border-b border-white/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl shadow-md shrink-0"
                style={{ backgroundColor: selectedService.color }}
              >
                <i className={selectedService.icon}></i>
              </div>
              <div>
                <span className="text-[11px] font-bold text-[#2A9D8F] block">درگاه اختصاصی خدمات غیرحضوری</span>
                <h4 className="text-xl sm:text-2xl font-black text-[#1F3A5F]">{selectedService.title}</h4>
                <p className="text-xs text-gray-600 font-bold mt-0.5">{selectedService.description}</p>
              </div>
            </div>

            <button
              onClick={() => setSelectedService(null)}
              className="px-5 py-2.5 rounded-xl bg-[#1F3A5F] hover:bg-[#1F3A5F]/90 text-white font-extrabold text-xs flex items-center gap-2 cursor-pointer transition-all shadow-md active:scale-95 shrink-0 self-end sm:self-auto"
            >
              <i className="fa-solid fa-arrow-right"></i>
              <span>بازگشت به لیست پیشخوان خدمات</span>
            </button>
          </div>

          {/* Form & Interactive Content Body */}
          <div className="p-6 sm:p-10 bg-white/40">
            {/* INTERACTIVE FORM 1: استعلام فرم ج */}
            {selectedService.id === 3 && (
              <div className="space-y-4">
                <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl text-xs leading-relaxed border border-emerald-100">
                  <i className="fa-solid fa-circle-info ml-1.5 text-emerald-600 text-sm"></i>
                  <strong>راهنمای استعلام فرم ج:</strong> سبز بودن فرم ج به این معناست که متقاضی از هیچ‌یک از تسهیلات دولتی مسکن یا زمین واگذاری استفاده نکرده است. جهت استعلام آنلاین کد ملی ۱۰ رقمی خود را وارد نمایید.
                </div>

                <form onSubmit={handleFormJInquiry} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-[#1F3A5F] mb-1.5">کد ملی متقاضی (۱۰ رقم)</label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        maxLength={10}
                        placeholder="مثال: ۴۴۳۰۵۴۷۸۹۰"
                        value={nationalId}
                        onChange={(e) => setNationalId(e.target.value)}
                        className="flex-1 border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm font-mono tracking-widest text-left focus:ring-2 focus:ring-[#2A9D8F] focus:outline-none bg-white"
                      />
                      <button
                        type="submit"
                        className="bg-[#1F3A5F] hover:bg-[#1F3A5F]/95 text-white font-bold px-6 py-2.5 rounded-lg text-sm transition-colors cursor-pointer shadow-md"
                      >
                        استعلام فوری فرم ج
                      </button>
                    </div>
                  </div>
                </form>

                {inquiryResult && (
                  <div className="mt-4 p-5 rounded-xl border animate-fade-in-up"
                       style={{
                         backgroundColor: inquiryResult.status === 'passed' ? '#ECFDF5' : inquiryResult.status === 'failed' ? '#FEF2F2' : '#F9FAFB',
                         borderColor: inquiryResult.status === 'passed' ? '#10B981' : inquiryResult.status === 'failed' ? '#EF4444' : '#E5E7EB'
                       }}>
                    <div className="flex items-center gap-2.5 mb-2.5">
                      <i className={`text-xl fa-solid ${
                        inquiryResult.status === 'passed' ? 'fa-circle-check text-emerald-600' :
                        inquiryResult.status === 'failed' ? 'fa-circle-xmark text-red-600' : 'fa-circle-question text-gray-500'
                      }`}></i>
                      <span className="font-extrabold text-sm sm:text-base"
                            style={{ color: inquiryResult.status === 'passed' ? '#047857' : inquiryResult.status === 'failed' ? '#B91C1C' : '#374151' }}>
                        {inquiryResult.status === 'passed' ? 'وضعیت فرم ج: سبز (مجاز به ثبت‌نام)' :
                         inquiryResult.status === 'failed' ? 'وضعیت فرم ج: قرمز (دارای سابقه ملک یا وام)' : 'اطلاعات در سامانه یافت نشد'}
                      </span>
                    </div>
                    
                    <p className="text-xs leading-relaxed font-semibold mb-3 text-gray-700">
                      {inquiryResult.message}
                    </p>

                    {inquiryResult.fullName && (
                      <div className="grid grid-cols-2 gap-2 text-xs font-mono text-gray-600 border-t pt-3 border-dashed border-gray-300">
                        <div>نام متقاضی: <strong className="text-gray-900 font-bold">{inquiryResult.fullName}</strong></div>
                        <div>تاریخ استعلام: <strong className="text-gray-900 font-bold">{inquiryResult.date}</strong></div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* INTERACTIVE FORM 2: پیگیری درخواست */}
            {selectedService.id === 6 && (
              <div className="space-y-4">
                <p className="text-xs text-gray-600 font-medium">
                  با وارد کردن کد پرونده یا کد رهگیری، مراحل کارشناسی، واگذاری یا مجوزهای شهرسازی خود را گام‌به‌گام پیگیری کنید.
                </p>
                <form onSubmit={handleTrackRequest} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-[#1F3A5F] mb-1.5">کد رهگیری پرونده</label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        placeholder="مثال: ۴۵۸۲۳"
                        value={trackingCode}
                        onChange={(e) => setTrackingCode(e.target.value)}
                        className="flex-1 border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm font-mono focus:ring-2 focus:ring-[#2A9D8F] focus:outline-none bg-white"
                      />
                      <button
                        type="submit"
                        className="bg-[#2A9D8F] hover:bg-[#2A9D8F]/90 text-white font-bold px-6 py-2.5 rounded-lg text-sm transition-colors cursor-pointer shadow-md"
                      >
                        بررسی وضعیت پرونده
                      </button>
                    </div>
                  </div>
                </form>

                {trackingResult && (
                  <div className="mt-4 border border-gray-200 rounded-xl p-6 bg-gray-50/80 animate-fade-in-up">
                    <h5 className="text-sm font-bold text-[#1F3A5F] mb-4">وضعیت گام‌به‌گام پرونده کد: <span className="font-mono text-[#B76E4C]">{trackingResult.code}</span></h5>
                    
                    {/* Timeline Steps */}
                    <div className="relative border-r-2 border-gray-300 pr-5 space-y-5 mr-3">
                      {trackingResult.steps.map((step: any, index: number) => (
                        <div key={index} className="relative">
                          {/* Checkpoint Dot */}
                          <span className={`absolute -right-[27px] top-1.5 w-3.5 h-3.5 rounded-full border-2 ${
                            step.completed ? 'bg-[#2A9D8F] border-[#2A9D8F]' : 'bg-white border-gray-400'
                          }`}></span>
                          
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                            <span className={`text-xs sm:text-sm font-bold ${step.completed ? 'text-gray-900' : 'text-gray-400 font-medium'}`}>
                              {step.label}
                            </span>
                            <span className="text-xs font-mono text-gray-500 mt-1 sm:mt-0">
                              {step.date}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* INTERACTIVE FORM 3: ثبت شکایت */}
            {selectedService.id === 7 && (
              <div className="space-y-4">
                {complaintSuccess ? (
                  <div className="p-6 bg-emerald-50 rounded-xl border border-emerald-300 text-center space-y-3 animate-fade-in-up">
                    <i className="fa-solid fa-circle-check text-4xl text-emerald-600"></i>
                    <h5 className="text-base font-black text-emerald-800">شکایت شما با موفقیت در سیستم ثبت گردید.</h5>
                    <p className="text-xs text-emerald-900 font-medium leading-relaxed">
                      گزارش یا شکایت مردمی شما مستقیماً به واحد بازرسی و عملکرد اداره کل یزد ارجاع شد. کارشناسان ظرف ۴۸ ساعت کاری پاسخ را در همین سامانه قرار خواهند داد.
                    </p>
                    <div className="inline-block bg-white border border-emerald-300 px-5 py-2.5 rounded-lg mt-2">
                      <span className="text-xs text-gray-500 block">کد رهگیری پیگیری شکایت:</span>
                      <strong className="text-base font-mono text-emerald-800">{complaintSuccess}</strong>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleComplaintSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">نام و نام خانوادگی *</label>
                        <input
                          type="text"
                          required
                          value={complaintForm.name}
                          onChange={(e) => setComplaintForm({ ...complaintForm, name: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-[#2A9D8F] focus:outline-none bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">شماره تماس (موبایل) *</label>
                        <input
                          type="text"
                          required
                          value={complaintForm.phone}
                          onChange={(e) => setComplaintForm({ ...complaintForm, phone: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm font-mono focus:ring-2 focus:ring-[#2A9D8F] focus:outline-none bg-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">موضوع شکایت</label>
                      <input
                        type="text"
                        value={complaintForm.subject}
                        onChange={(e) => setComplaintForm({ ...complaintForm, subject: e.target.value })}
                        placeholder="مثال: تاخیر در تحویل فاز ۲ مسکن ملی تفت"
                        className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-[#2A9D8F] focus:outline-none bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">شرح دقیق شکایت / گزارش مردمی *</label>
                      <textarea
                        rows={4}
                        required
                        value={complaintForm.text}
                        onChange={(e) => setComplaintForm({ ...complaintForm, text: e.target.value })}
                        placeholder="شرح شکایت خود را با ذکر جزئیات، آدرس پروژه یا کد ملی بنویسید..."
                        className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-[#2A9D8F] focus:outline-none bg-white"
                      ></textarea>
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl text-sm transition-colors cursor-pointer shadow-md"
                    >
                      ارسال شکایت رسمی به بازرسی یزد
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* INTERACTIVE FORM 4: سامانه مکاتبات */}
            {selectedService.id === 5 && (
              <div className="space-y-4">
                {letterSuccess ? (
                  <div className="p-6 bg-emerald-50 rounded-xl border border-emerald-300 text-center space-y-3 animate-fade-in-up">
                    <i className="fa-solid fa-file-circle-check text-4xl text-emerald-600"></i>
                    <h5 className="text-base font-black text-emerald-800">مکاتبه شما در دبیرخانه الکترونیک ثبت شد.</h5>
                    <p className="text-xs text-emerald-900 font-medium leading-relaxed">
                      نامه اداری شما ثبت گردید و برای مدیرکل یا معاون مربوطه ارسال شد. شماره ثبت اندیکاتور صادر شده را برای پیگیری‌های بعدی یادداشت فرمایید.
                    </p>
                    <div className="inline-block bg-white border border-emerald-300 px-5 py-2.5 rounded-lg mt-2">
                      <span className="text-xs text-gray-500 block">شماره ثبت اندیکاتور:</span>
                      <strong className="text-base font-mono text-emerald-800">{letterSuccess}</strong>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleLetterSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">نام فرستنده / شرکت *</label>
                        <input
                          type="text"
                          required
                          value={letterForm.sender}
                          onChange={(e) => setLetterForm({ ...letterForm, sender: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-[#2A9D8F] focus:outline-none bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">تلفن تماس *</label>
                        <input
                          type="text"
                          required
                          value={letterForm.phone}
                          onChange={(e) => setLetterForm({ ...letterForm, phone: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm font-mono focus:ring-2 focus:ring-[#2A9D8F] focus:outline-none bg-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">عنوان نامه / درخواست رسمی *</label>
                      <input
                        type="text"
                        required
                        value={letterForm.title}
                        onChange={(e) => setLetterForm({ ...letterForm, title: e.target.value })}
                        placeholder="مثال: درخواست الحاق به محدوده اراضی میبد جهت توسعه کارگاهی"
                        className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-[#2A9D8F] focus:outline-none bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">متن نامه اداری *</label>
                      <textarea
                        rows={5}
                        required
                        value={letterForm.body}
                        onChange={(e) => setLetterForm({ ...letterForm, body: e.target.value })}
                        placeholder="جناب آقای مدیرکل، با سلام و احترام، بدینوسیله به استحضار می‌رساند که..."
                        className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-[#2A9D8F] focus:outline-none bg-white"
                      ></textarea>
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-[#1F3A5F] hover:bg-[#1F3A5F]/90 text-white font-bold py-3 rounded-xl text-sm transition-colors cursor-pointer shadow-md"
                    >
                      ثبت و صدور شماره اندیکاتور دبیرخانه
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* INTERACTIVE FORM 5: میز خدمت (نوبت‌دهی آنلاین) */}
            {selectedService.id === 8 && (
              <div className="space-y-4">
                {appointmentSuccess ? (
                  <div className="p-6 bg-emerald-50 rounded-xl border border-emerald-300 text-center space-y-3 animate-fade-in-up">
                    <i className="fa-solid fa-calendar-check text-4xl text-emerald-600"></i>
                    <h5 className="text-base font-black text-emerald-800">نوبت ملاقات شما با موفقیت رزرو شد.</h5>
                    <p className="text-xs text-emerald-900 font-medium leading-relaxed">
                      توجه فرمایید: در تاریخ انتخاب شده رأس ساعت ۹:۳۰ صبح همراه با اصل مدارک مالکیتی/ثبت‌نامی به باجه ۲ میز خدمت در ساختمان اصلی یزد مراجعه نمایید.
                    </p>
                    <div className="inline-block bg-white border border-emerald-300 px-5 py-2.5 rounded-lg mt-2">
                      <span className="text-xs text-gray-500 block">شماره نوبت الکترونیکی:</span>
                      <strong className="text-base font-mono text-emerald-800">{appointmentSuccess}</strong>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleAppointmentSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">نام و نام خانوادگی ارباب رجوع *</label>
                        <input
                          type="text"
                          required
                          value={appointmentForm.name}
                          onChange={(e) => setAppointmentForm({ ...appointmentForm, name: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-[#2A9D8F] focus:outline-none bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">تلفن همراه متقاضی *</label>
                        <input
                          type="text"
                          required
                          value={appointmentForm.phone}
                          onChange={(e) => setAppointmentForm({ ...appointmentForm, phone: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm font-mono focus:ring-2 focus:ring-[#2A9D8F] focus:outline-none bg-white"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">انتخاب بخش اداری مربوطه *</label>
                        <select
                          required
                          value={appointmentForm.unit}
                          onChange={(e) => setAppointmentForm({ ...appointmentForm, unit: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-[#2A9D8F] focus:outline-none bg-white"
                        >
                          <option value="">-- انتخاب کنید --</option>
                          <option value="معاونت املاک و حقوقی">معاونت املاک و حقوقی (واگذاری زمین)</option>
                          <option value="معاونت مسکن و ساختمان">معاونت مسکن و ساختمان (مسکن ملی)</option>
                          <option value="شهرسازی و طرح‌های جامع">شهرسازی و طرح‌های جامع (تغییر کاربری)</option>
                          <option value="مدیرکل راه و شهرسازی">ملاقات مردمی مستقیم با مدیرکل</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">انتخاب روز مراجعه حضوری *</label>
                        <select
                          required
                          value={appointmentForm.date}
                          onChange={(e) => setAppointmentForm({ ...appointmentForm, date: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-3.5 py-2 text-sm focus:ring-2 focus:ring-[#2A9D8F] focus:outline-none bg-white"
                        >
                          <option value="">-- انتخاب روز --</option>
                          <option value="شنبه هفته آینده">شنبه آینده (۱۰ تیر ۱۴۰۵)</option>
                          <option value="دوشنبه هفته آینده">دوشنبه آینده (۱۲ تیر ۱۴۰۵)</option>
                          <option value="چهارشنبه هفته آینده">چهارشنبه آینده (۱۴ تیر ۱۴۰۵)</option>
                        </select>
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-[#C98A5A] hover:bg-[#C98A5A]/90 text-white font-bold py-3 rounded-xl text-sm transition-colors cursor-pointer shadow-md"
                    >
                      دریافت نوبت نهایی میز خدمت حضوری
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* DEFAULT FALLBACK FOR OTHER SERVICES */}
            {selectedService.id !== 3 && selectedService.id !== 5 && selectedService.id !== 6 && selectedService.id !== 7 && selectedService.id !== 8 && (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 bg-[#2A9D8F]/10 text-[#2A9D8F] rounded-2xl flex items-center justify-center text-3xl mx-auto shadow-sm">
                  <i className="fa-solid fa-cloud-arrow-up"></i>
                </div>
                <h5 className="font-extrabold text-base text-[#1F3A5F]">در حال انتقال به درگاه ملی یکپارچه دولت هوشمند...</h5>
                <p className="text-xs text-gray-600 font-medium max-w-md mx-auto leading-relaxed">
                  این خدمت مستقیماً به بستر کشوری و امن پنجره ملی خدمات دولت متصل است. جهت استعلامات سراسری و هوشمند، وارد درگاه دولت شوید.
                </p>
                <button
                  onClick={() => {
                    alert('شبیه‌سازی ارتباط با درگاه ملی دولت هوشمند (سجا) برقرار شد.');
                    setSelectedService(null);
                  }}
                  className="bg-[#2A9D8F] hover:bg-[#2A9D8F]/90 text-white font-bold px-6 py-2.5 rounded-xl text-xs transition-colors cursor-pointer shadow-md"
                >
                  تایید و انتقال به درگاه دولت
                </button>
              </div>
            )}
          </div>

          {/* Dedicated View Footer */}
          <div className="bg-gray-50/90 p-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-gray-500 font-mono">
            <span>درگاه الکترونیک اداره کل راه و شهرسازی استان یزد</span>
            <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
              <i className="fa-solid fa-lock text-xs"></i>
              <span>رمزنگاری امن داده‌ها (SSL)</span>
            </span>
          </div>
        </motion.div>
      )}
    </section>
  );
}
