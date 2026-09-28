import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { API } from '../../shared-utils';
import { API_BASE_URL } from '../../shared-constants';
import { ActivePage } from '../../types';
import Breadcrumb from '../Breadcrumb';

interface FormPageProps {
  fontSizeScale: number;
  onNavigate: (page: ActivePage) => void;
  slug: string;
}

interface FieldOption {
  id: string;
  label: string;
  value: string;
}

interface FormField {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  helpText?: string;
  defaultValue?: any;
  options?: FieldOption[];
  order?: number;
  hidden?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  securityType?: 'image_captcha' | 'numeric_code' | 'image_challenge' | 'honeypot';
  validation?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
  };
}

interface FormTheme {
  primaryColor?: string;
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'full';
}

interface FormSettings {
  customSuccessMessage?: string;
  completionDescription?: string;
}

interface FormDto {
  id: number;
  title: string;
  description: string | null;
  type: string;
  fields: FormField[];
  theme: FormTheme | null;
  settings: FormSettings | null;
}

const TEXT_LIKE_TYPES = new Set(['text', 'email', 'phone', 'password', 'url', 'richtext', 'matrix', 'likert', 'ranking', 'cascading', 'location', 'address', 'qrcode', 'signature']);
const INPUT_TYPE_MAP: Record<string, string> = {
  email: 'email',
  phone: 'tel',
  password: 'password',
  url: 'url',
  date: 'date',
  time: 'time',
  datetime: 'datetime-local',
  color: 'color',
};

export default function FormPage({ fontSizeScale, onNavigate, slug }: FormPageProps) {
  const [form, setForm] = useState<FormDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [securityValues, setSecurityValues] = useState<Record<string, string>>({});
  const [securityTokens, setSecurityTokens] = useState<Record<string, { token: string; image: string }>>({});
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ trackingCode: string; scoreTotal: number | null; gradeLabel: string | null } | null>(null);
  const startedAtRef = React.useRef<number>(Date.now());

  const accent = form?.theme?.primaryColor || '#2A9D8F';
  const radiusClass =
    form?.theme?.borderRadius === 'none' ? 'rounded-none'
    : form?.theme?.borderRadius === 'sm' ? 'rounded-md'
    : form?.theme?.borderRadius === 'full' ? 'rounded-full'
    : 'rounded-xl';

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    setForm(null);
    setResult(null);
    startedAtRef.current = Date.now();
    API<{ data: FormDto }>(`forms/slug/${encodeURIComponent(slug)}/public`)
      .then((res) => {
        if (cancelled) return;
        setForm(res.data);
        const defaults: Record<string, any> = {};
        (res.data.fields || []).forEach((f) => {
          if (f.defaultValue !== undefined && f.defaultValue !== null) defaults[f.id] = f.defaultValue;
        });
        setAnswers(defaults);
      })
      .catch(() => {
        if (!cancelled) setNotFound(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const visibleFields = useMemo(() => {
    if (!form) return [];
    return [...(form.fields || [])]
      .filter((f) => !f.hidden && f.type !== 'hidden' && f.type !== 'calculated')
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [form]);

  const securityFields = useMemo(
    () => visibleFields.filter((f) => f.type === 'security' && f.securityType !== 'honeypot'),
    [visibleFields]
  );
  const honeypotFields = useMemo(
    () => visibleFields.filter((f) => f.type === 'security' && f.securityType === 'honeypot'),
    [visibleFields]
  );

  // Generate a CAPTCHA-family challenge for each security field once the form loads
  useEffect(() => {
    securityFields.forEach((field) => {
      if (securityTokens[field.id]) return;
      API<{ data: { token: string; image: string; expires_in: number } }>(
        'forms/security-challenge/generate',
        { type: field.securityType || 'image_captcha' },
        'POST'
      )
        .then((res) => {
          setSecurityTokens((prev) => ({ ...prev, [field.id]: { token: res.data.token, image: res.data.image } }));
        })
        .catch(() => {
          /* Silent — verified authoritatively server-side on submit; user can retry via the button */
        });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [securityFields.map((f) => f.id).join(',')]);

  const refreshChallenge = (field: FormField) => {
    setSecurityTokens((prev) => {
      const next = { ...prev };
      delete next[field.id];
      return next;
    });
    setSecurityValues((prev) => ({ ...prev, [field.id]: '' }));
  };

  const setAnswer = (fieldId: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }));
    setFieldErrors((prev) => {
      if (!prev[fieldId]) return prev;
      const next = { ...prev };
      delete next[fieldId];
      return next;
    });
  };

  const handleFileSelect = async (field: FormField, file: File | null) => {
    if (!file || !form) return;
    setUploading((prev) => ({ ...prev, [field.id]: true }));
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${API_BASE_URL}/forms/${form.id}/upload-answer-file`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error();
      const json = await res.json();
      setAnswer(field.id, json.data?.url || null);
    } catch {
      setFieldErrors((prev) => ({ ...prev, [field.id]: 'آپلود فایل ناموفق بود. دوباره تلاش کنید.' }));
    } finally {
      setUploading((prev) => ({ ...prev, [field.id]: false }));
    }
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    for (const field of visibleFields) {
      if (field.type === 'security') continue;
      const v = answers[field.id];
      if (field.validation?.required && (v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0))) {
        errors[field.id] = 'تکمیل این فیلد الزامی است.';
      }
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form || submitting) return;
    setSubmitError(null);
    if (!validate()) {
      setSubmitError('لطفاً فیلدهای الزامی را تکمیل کنید.');
      return;
    }

    const securityChallenges: Record<string, { token: string; value: string }> = {};
    for (const field of securityFields) {
      const tok = securityTokens[field.id];
      if (!tok) {
        setSubmitError('کد امنیتی هنوز آماده نشده — لحظه‌ای صبر کنید و دوباره تلاش کنید.');
        return;
      }
      securityChallenges[field.id] = { token: tok.token, value: securityValues[field.id] || '' };
    }
    // Honeypot fields must stay empty; their (invisible) value is submitted as-is under security_challenges
    for (const field of honeypotFields) {
      securityChallenges[field.id] = { token: 'honeypot', value: answers[field.id] || '' } as any;
    }

    setSubmitting(true);
    try {
      const completionSeconds = Math.round((Date.now() - startedAtRef.current) / 1000);
      const res = await API<{ data: { tracking_code: string; score_total: number | null; grade_label: string | null } }>(
        `forms/${form.id}/submit`,
        {
          answers,
          security_challenges: securityChallenges,
          completion_time_seconds: completionSeconds,
        },
        'POST'
      );
      setResult({
        trackingCode: res.data.tracking_code,
        scoreTotal: res.data.score_total,
        gradeLabel: res.data.grade_label,
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      if (err?.errors) {
        const flat: Record<string, string> = {};
        Object.entries(err.errors as Record<string, string[]>).forEach(([key, msgs]) => {
          flat[key] = msgs[0];
        });
        setFieldErrors((prev) => ({ ...prev, ...flat }));
        // Refresh challenges since a failed security check consumes/expires the token
        securityFields.forEach(refreshChallenge);
      }
      setSubmitError(err?.message || 'ارسال فرم با خطا مواجه شد. لطفاً دوباره تلاش کنید.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field: FormField) => {
    const value = answers[field.id];
    const error = fieldErrors[field.id];
    const baseInputClass = `w-full px-4 py-2.5 text-sm border ${error ? 'border-red-400' : 'border-gray-200'} ${radiusClass} focus:outline-none focus:ring-2 bg-white`;

    if (field.type === 'security') {
      if (field.securityType === 'honeypot') {
        // Never shown to real visitors; a filled honeypot flags the submission as automated server-side.
        return (
          <div key={field.id} className="hidden" aria-hidden="true">
            <label>
              Leave this field empty
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={answers[field.id] || ''}
                onChange={(e) => setAnswer(field.id, e.target.value)}
              />
            </label>
          </div>
        );
      }
      const tok = securityTokens[field.id];
      return (
        <div key={field.id} className="space-y-2">
          <label className="block text-xs font-bold text-[#1F3A5F]">{field.label}</label>
          <div className="flex items-center gap-3 flex-wrap">
            {tok ? (
              <img src={tok.image} alt="کد امنیتی" className="h-14 rounded-lg border border-gray-200" />
            ) : (
              <div className="h-14 w-36 rounded-lg bg-gray-100 flex items-center justify-center text-[10px] text-gray-400">
                <i className="fa-solid fa-circle-notch fa-spin"></i>
              </div>
            )}
            <button
              type="button"
              onClick={() => refreshChallenge(field)}
              className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
              title="کد جدید"
            >
              <i className="fa-solid fa-rotate-right text-xs"></i>
            </button>
            <input
              type="text"
              value={securityValues[field.id] || ''}
              onChange={(e) => setSecurityValues((prev) => ({ ...prev, [field.id]: e.target.value }))}
              placeholder="کد را وارد کنید"
              className={`${baseInputClass} flex-1 min-w-[140px]`}
              style={{ ['--tw-ring-color' as any]: accent }}
            />
          </div>
          {error && <p className="text-[11px] text-red-500 font-bold">{error}</p>}
        </div>
      );
    }

    const label = (
      <label className="block text-xs font-bold text-[#1F3A5F]">
        {field.label}
        {field.validation?.required && <span className="text-red-500 mr-1">*</span>}
      </label>
    );

    let control: React.ReactNode;
    if (field.type === 'textarea') {
      control = (
        <textarea
          rows={4}
          value={value || ''}
          disabled={field.disabled || field.readOnly}
          placeholder={field.placeholder}
          onChange={(e) => setAnswer(field.id, e.target.value)}
          className={baseInputClass}
          style={{ ['--tw-ring-color' as any]: accent }}
        />
      );
    } else if (field.type === 'number' || field.type === 'currency' || field.type === 'percentage') {
      control = (
        <input
          type="number"
          value={value ?? ''}
          disabled={field.disabled || field.readOnly}
          min={field.validation?.min}
          max={field.validation?.max}
          placeholder={field.placeholder}
          onChange={(e) => setAnswer(field.id, e.target.value === '' ? null : Number(e.target.value))}
          className={baseInputClass}
          style={{ ['--tw-ring-color' as any]: accent }}
        />
      );
    } else if (field.type === 'select') {
      control = (
        <select
          value={value || ''}
          disabled={field.disabled || field.readOnly}
          onChange={(e) => setAnswer(field.id, e.target.value)}
          className={baseInputClass}
          style={{ ['--tw-ring-color' as any]: accent }}
        >
          <option value="">— انتخاب کنید —</option>
          {(field.options || []).map((opt) => (
            <option key={opt.id} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      );
    } else if (field.type === 'multiselect') {
      const selected: string[] = Array.isArray(value) ? value : [];
      control = (
        <div className="flex flex-wrap gap-2">
          {(field.options || []).map((opt) => {
            const isChecked = selected.includes(opt.value);
            return (
              <button
                type="button"
                key={opt.id}
                onClick={() =>
                  setAnswer(field.id, isChecked ? selected.filter((v) => v !== opt.value) : [...selected, opt.value])
                }
                className={`px-3 py-1.5 text-xs font-bold rounded-full border transition-colors ${
                  isChecked ? 'text-white border-transparent' : 'bg-white text-[#1F3A5F] border-gray-200'
                }`}
                style={isChecked ? { backgroundColor: accent } : undefined}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      );
    } else if (field.type === 'radio' || field.type === 'yesno') {
      const opts = field.type === 'yesno'
        ? [{ id: 'yes', label: 'بله', value: 'yes' }, { id: 'no', label: 'خیر', value: 'no' }]
        : (field.options || []);
      control = (
        <div className="flex flex-wrap gap-4">
          {opts.map((opt) => (
            <label key={opt.id} className="flex items-center gap-2 text-xs font-bold text-[#1F3A5F] cursor-pointer">
              <input
                type="radio"
                name={field.id}
                checked={value === opt.value}
                onChange={() => setAnswer(field.id, opt.value)}
                style={{ accentColor: accent }}
              />
              {opt.label}
            </label>
          ))}
        </div>
      );
    } else if (field.type === 'checkbox' || field.type === 'switch') {
      control = (
        <label className="flex items-center gap-2 text-xs font-bold text-[#1F3A5F] cursor-pointer">
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e) => setAnswer(field.id, e.target.checked)}
            style={{ accentColor: accent }}
          />
          {field.placeholder || 'تأیید می‌کنم'}
        </label>
      );
    } else if (field.type === 'rating') {
      const rating = Number(value) || 0;
      control = (
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setAnswer(field.id, n)}
              className="text-2xl transition-transform hover:scale-110"
              style={{ color: n <= rating ? accent : '#E5E7EB' }}
            >
              <i className="fa-solid fa-star"></i>
            </button>
          ))}
        </div>
      );
    } else if (field.type === 'slider') {
      control = (
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={field.validation?.min ?? 0}
            max={field.validation?.max ?? 100}
            value={value ?? field.validation?.min ?? 0}
            onChange={(e) => setAnswer(field.id, Number(e.target.value))}
            className="flex-1"
            style={{ accentColor: accent }}
          />
          <span className="text-xs font-mono font-bold text-[#1F3A5F] w-10 text-center">{value ?? field.validation?.min ?? 0}</span>
        </div>
      );
    } else if (field.type === 'file' || field.type === 'image') {
      control = (
        <div>
          <input
            type="file"
            accept={field.type === 'image' ? 'image/*' : undefined}
            disabled={uploading[field.id]}
            onChange={(e) => handleFileSelect(field, e.target.files?.[0] || null)}
            className="block w-full text-xs text-[#1F3A5F] file:ml-3 file:px-3 file:py-2 file:rounded-lg file:border-0 file:bg-[var(--file-bg)] file:text-white file:text-xs file:font-bold file:cursor-pointer cursor-pointer"
            style={{ ['--file-bg' as any]: accent }}
          />
          {uploading[field.id] && <p className="text-[11px] text-gray-400 mt-1">در حال آپلود...</p>}
          {value && !uploading[field.id] && (
            <p className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1">
              <i className="fa-solid fa-circle-check"></i> فایل با موفقیت آپلود شد
            </p>
          )}
        </div>
      );
    } else if (INPUT_TYPE_MAP[field.type]) {
      control = (
        <input
          type={INPUT_TYPE_MAP[field.type]}
          value={value || ''}
          disabled={field.disabled || field.readOnly}
          placeholder={field.placeholder}
          onChange={(e) => setAnswer(field.id, e.target.value)}
          className={baseInputClass}
          dir={field.type === 'email' || field.type === 'url' ? 'ltr' : undefined}
          style={{ ['--tw-ring-color' as any]: accent }}
        />
      );
    } else if (TEXT_LIKE_TYPES.has(field.type)) {
      control = (
        <input
          type="text"
          value={value || ''}
          disabled={field.disabled || field.readOnly}
          placeholder={field.placeholder}
          maxLength={field.validation?.maxLength}
          onChange={(e) => setAnswer(field.id, e.target.value)}
          className={baseInputClass}
          style={{ ['--tw-ring-color' as any]: accent }}
        />
      );
    } else {
      // Unsupported/exotic field type — plain text fallback keeps the form fully submittable
      control = (
        <input
          type="text"
          value={value || ''}
          placeholder={field.placeholder}
          onChange={(e) => setAnswer(field.id, e.target.value)}
          className={baseInputClass}
          style={{ ['--tw-ring-color' as any]: accent }}
        />
      );
    }

    return (
      <div key={field.id} className="space-y-1.5">
        {field.type !== 'checkbox' && field.type !== 'switch' && label}
        {control}
        {field.helpText && <p className="text-[11px] text-gray-400">{field.helpText}</p>}
        {error && <p className="text-[11px] text-red-500 font-bold">{error}</p>}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F5F6F8] pb-20 text-[#1F3A5F]" style={{ fontSize: `${16 * fontSizeScale}px` }}>
      <Breadcrumb currentPage="form" pageTitle={form?.title || 'فرم آنلاین'} onNavigate={onNavigate} />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {loading && (
          <div className="flex items-center justify-center py-24 text-[#1F3A5F]/60">
            <i className="fa-solid fa-circle-notch fa-spin text-3xl"></i>
          </div>
        )}

        {!loading && notFound && (
          <div className="glass-panel border border-white/60 rounded-2xl p-16 text-center text-[#1F3A5F]/70">
            <i className="fa-solid fa-file-circle-xmark text-4xl mb-3 block text-gray-300"></i>
            <p className="font-bold text-sm">این فرم یافت نشد یا در حال حاضر منتشر نیست.</p>
          </div>
        )}

        {!loading && !notFound && form && result && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel border border-white/60 rounded-2xl p-8 text-center"
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl text-white mx-auto mb-4"
              style={{ backgroundColor: accent }}
            >
              <i className="fa-solid fa-check"></i>
            </div>
            <h2 className="text-lg font-black mb-2">
              {form.settings?.customSuccessMessage || 'پاسخ شما با موفقیت ثبت شد'}
            </h2>
            {form.settings?.completionDescription && (
              <p className="text-xs text-gray-500 mb-4">{form.settings.completionDescription}</p>
            )}
            <div className="bg-gray-50 rounded-xl p-4 inline-block">
              <p className="text-[11px] text-gray-400 mb-1">کد رهگیری شما</p>
              <p className="font-mono font-black text-lg" dir="ltr">{result.trackingCode}</p>
            </div>
            {result.gradeLabel && (
              <p className="mt-4 text-sm font-bold">
                نتیجه: {result.gradeLabel} {result.scoreTotal !== null && `(امتیاز: ${result.scoreTotal})`}
              </p>
            )}
            <button
              onClick={() => onNavigate('home')}
              className="mt-6 px-5 py-2.5 rounded-xl text-white text-xs font-bold transition-transform hover:scale-[1.02] active:scale-95"
              style={{ backgroundColor: accent }}
            >
              بازگشت به صفحه اصلی
            </button>
          </motion.div>
        )}

        {!loading && !notFound && form && !result && (
          <motion.form
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="glass-panel border border-white/60 rounded-2xl p-6 sm:p-8 space-y-6"
          >
            <div>
              <h1 className="text-xl font-black">{form.title}</h1>
              {form.description && <p className="text-xs text-gray-500 mt-1.5">{form.description}</p>}
            </div>

            <div className="space-y-5">
              {visibleFields.map(renderField)}
            </div>

            {submitError && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-xs font-bold text-red-600">
                {submitError}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl text-white text-sm font-bold transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ backgroundColor: accent }}
            >
              {submitting ? (
                <>
                  <i className="fa-solid fa-circle-notch fa-spin"></i>
                  در حال ارسال...
                </>
              ) : (
                'ارسال فرم'
              )}
            </button>
          </motion.form>
        )}
      </div>
    </div>
  );
}
