import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import type { Map as LeafletMap, Marker as LeafletMarker } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import DatePicker, { DateObject } from 'react-multi-date-picker';
import persianCalendar from 'react-date-object/calendars/persian';
import persianLocaleFa from 'react-date-object/locales/persian_fa';
import gregorianCalendar from 'react-date-object/calendars/gregorian';
import 'react-multi-date-picker/styles/colors/teal.css';
import { API, toPersianDigits, toEnglishDigits } from '../../shared-utils';
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
    allowedExtensions?: string[];
    maxFileSizeMb?: number;
    regexPattern?: string;
    customErrorMessage?: string;
    phoneFormat?: 'iran_mobile' | 'iran_landline' | 'international' | 'custom';
    allowedDomains?: string[];
    blockFreeEmailProviders?: boolean;
    disallowPastDates?: boolean;
    disallowFutureDates?: boolean;
  };
  // Text & textarea
  charTypeAllowed?: 'any' | 'persian_letters' | 'english_letters' | 'numeric' | 'alphanumeric';
  // Number / currency / percentage / slider
  decimalPlaces?: number;
  numberUnit?: string;
  currencyUnit?: string;
  useThousandSeparator?: boolean;
  // Auto-calculation
  autoCalculationEnabled?: boolean;
  formula?: string;
  // Auto-fill / prefill
  prefillSource?: 'none' | 'user_fullname' | 'user_email' | 'user_phone' | 'user_national_id' | 'user_role' | 'query_param';
  prefillQueryParam?: string;
  // Address / location components
  includeProvince?: boolean;
  includePostalCode?: boolean;
  includeGeoCoordinates?: boolean;
  // Dropdown (select) specific
  allowSearchOptions?: boolean;
  allowCreateCustomOption?: boolean;
  // Choice fields (radio/checkbox) layout
  choiceLayout?: 'vertical' | 'horizontal' | 'grid_2_col';
  // Yes/No (two-state) field
  yesLabel?: string;
  noLabel?: string;
  // Date / time
  calendarType?: 'jalali' | 'gregorian';
  defaultDateOption?: 'none' | 'today' | 'custom';
  iconColor?: string;
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

const TEXT_LIKE_TYPES = new Set(['text', 'email', 'password', 'url', 'richtext', 'matrix', 'likert', 'ranking', 'cascading', 'qrcode', 'signature']);
const INPUT_TYPE_MAP: Record<string, string> = {
  email: 'email',
  password: 'password',
  url: 'url',
  time: 'time',
  color: 'color',
};

/** ارقام فارسی/عربی را به ارقام لاتین تبدیل می‌کند — چون خیلی از موبایل‌ها با کیبورد فارسی رقم می‌فرستند */
const toLatinDigits = (str: string): string =>
  str
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - '۰'.charCodeAt(0)))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - '٠'.charCodeAt(0)));

/** پیکربندی مَسک و اعتبارسنجی برای هر «قالب و فرمت شماره» تعریف‌شده روی فیلد phone در فرم‌ساز */
const FREE_EMAIL_PROVIDERS = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'live.com', 'icloud.com', 'aol.com', 'mail.com', 'protonmail.com', 'yandex.com'];

const PHONE_FORMAT_CONFIG: Record<'iran_mobile' | 'iran_landline' | 'international', {
  maxDigits: number;
  pattern: RegExp;
  placeholder: string;
  mask: (digits: string) => string;
  errorMessage: string;
}> = {
  iran_mobile: {
    maxDigits: 11,
    pattern: /^09\d{9}$/,
    placeholder: '0912 345 6789',
    mask: (d) => [d.slice(0, 4), d.slice(4, 7), d.slice(7, 11)].filter(Boolean).join(' '),
    errorMessage: 'شمارهٔ موبایل معتبر نیست — باید با ۰۹ شروع شود و ۱۱ رقم باشد.',
  },
  iran_landline: {
    maxDigits: 11,
    pattern: /^0\d{9,10}$/,
    placeholder: '021 1234 5678',
    mask: (d) => {
      const areaLen = d.length > 10 ? 4 : 3;
      return [d.slice(0, areaLen), d.slice(areaLen, areaLen + 4), d.slice(areaLen + 4)].filter(Boolean).join(' ');
    },
    errorMessage: 'شمارهٔ تلفن ثابت معتبر نیست — باید با پیش‌شمارهٔ شهر (۰) شروع شود.',
  },
  international: {
    maxDigits: 15,
    pattern: /^\+\d{6,15}$/,
    placeholder: '+98 912 345 6789',
    mask: (d) => `+${[d.slice(0, 2), d.slice(2, 5), d.slice(5, 8), d.slice(8, 12)].filter(Boolean).join(' ')}`,
    errorMessage: 'شمارهٔ بین‌المللی معتبر نیست — باید با + و کد کشور شروع شود.',
  },
};

const IRAN_PROVINCES = [
  'آذربایجان شرقی', 'آذربایجان غربی', 'اردبیل', 'اصفهان', 'البرز', 'ایلام', 'بوشهر',
  'تهران', 'چهارمحال و بختیاری', 'خراسان جنوبی', 'خراسان رضوی', 'خراسان شمالی',
  'خوزستان', 'زنجان', 'سمنان', 'سیستان و بلوچستان', 'فارس', 'قزوین', 'قم', 'کردستان',
  'کرمان', 'کرمانشاه', 'کهگیلویه و بویراحمد', 'گلستان', 'گیلان', 'لرستان', 'مازندران',
  'مرکزی', 'هرمزگان', 'همدان', 'یزد',
];

const CHAR_TYPE_RULES: Record<string, { pattern: RegExp; message: string }> = {
  persian_letters: { pattern: /^[؀-ۿ\s]*$/, message: 'فقط حروف فارسی مجاز است.' },
  english_letters: { pattern: /^[A-Za-z\s]*$/, message: 'فقط حروف انگلیسی مجاز است.' },
  numeric: { pattern: /^[0-9۰-۹]*$/, message: 'فقط عدد مجاز است.' },
  alphanumeric: { pattern: /^[A-Za-z0-9؀-ۿ۰-۹\s]*$/, message: 'کاراکتر خاص مجاز نیست.' },
};

/** کاراکترهای غیرمجاز را همان لحظهٔ تایپ حذف می‌کند — تا اعتبارسنجی charTypeAllowed فقط موقع ارسال فرم معلوم نشود */
const CHAR_TYPE_FILTERS: Record<string, RegExp> = {
  persian_letters: /[^؀-ۿ\s]/g,
  english_letters: /[^A-Za-z\s]/g,
  numeric: /[^0-9۰-۹]/g,
  alphanumeric: /[^A-Za-z0-9؀-ۿ۰-۹\s]/g,
};
const filterByCharType = (value: string, charType?: string): string => {
  if (!charType || charType === 'any') return value;
  const pattern = CHAR_TYPE_FILTERS[charType];
  return pattern ? value.replace(pattern, '') : value;
};

/**
 * ارزیابی امن فرمول محاسبهٔ خودکار — عمداً از eval()/Function() استفاده نمی‌شود
 * (فرمول توسط ادمین در فرم‌ساز تعریف می‌شود، اما اجرای کد دلخواه در مرورگر پاسخ‌دهنده
 * همیشه باید پرهیز شود). فقط چهار عمل اصلی، پرانتز و شناسهٔ فیلدها را پشتیبانی می‌کند.
 */
const evaluateFormula = (formula: string, values: Record<string, number>): number | null => {
  const tokens = formula.match(/[A-Za-z_][A-Za-z0-9_]*|\d+(?:\.\d+)?|[()+\-*/]/g);
  if (!tokens) return null;
  let pos = 0;
  const peek = () => tokens[pos];
  const next = () => tokens[pos++];

  const parseFactor = (): number | null => {
    const t = peek();
    if (t === undefined) return null;
    if (t === '(') {
      next();
      const v = parseExpr();
      if (peek() === ')') next();
      return v;
    }
    if (t === '-') {
      next();
      const v = parseFactor();
      return v === null ? null : -v;
    }
    next();
    if (/^\d/.test(t)) return parseFloat(t);
    const fieldVal = values[t];
    return typeof fieldVal === 'number' && !isNaN(fieldVal) ? fieldVal : 0;
  };

  const parseTerm = (): number | null => {
    let v = parseFactor();
    if (v === null) return null;
    while (peek() === '*' || peek() === '/') {
      const op = next();
      const rhs = parseFactor();
      if (rhs === null) return null;
      v = op === '*' ? v * rhs : v / rhs;
    }
    return v;
  };

  const parseExpr = (): number | null => {
    let v = parseTerm();
    if (v === null) return null;
    while (peek() === '+' || peek() === '-') {
      const op = next();
      const rhs = parseTerm();
      if (rhs === null) return null;
      v = op === '+' ? v + rhs : v - rhs;
    }
    return v;
  };

  const result = parseExpr();
  return result === null || isNaN(result) ? null : result;
};

const formatNumberDisplay = (value: number, decimalPlaces = 0, useThousandSeparator = true): string => {
  const fixed = value.toFixed(decimalPlaces);
  if (!useThousandSeparator) return fixed;
  const [intPart, decPart] = fixed.split('.');
  const withSeparators = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return decPart ? `${withSeparators}.${decPart}` : withSeparators;
};

/**
 * انتخاب مختصات از روی نقشهٔ ماهواره‌ای (Esri World Imagery — رایگان، بدون نیاز به کلید API).
 * leaflet به‌صورت پویا import می‌شود تا کتابخانهٔ نقشه فقط برای فرم‌هایی بارگذاری شود که
 * واقعاً از این قابلیت استفاده می‌کنند، نه در بستهٔ اصلی همهٔ صفحات عمومی سایت.
 */
const GeoMapPicker: React.FC<{
  lat?: number;
  lng?: number;
  accent: string;
  onChange: (lat: number, lng: number) => void;
}> = ({ lat, lng, accent, onChange }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<LeafletMarker | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    let cancelled = false;

    import('leaflet').then((L) => {
      if (cancelled || !containerRef.current || mapRef.current) return;

      const defaultCenter: [number, number] = [32.4279, 53.688]; // مرکز جغرافیایی ایران
      const startCenter: [number, number] = lat !== undefined && lng !== undefined ? [lat, lng] : defaultCenter;

      const map = L.map(containerRef.current, {
        center: startCenter,
        zoom: lat !== undefined ? 15 : 5,
      });
      mapRef.current = map;

      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri',
        maxZoom: 19,
      }).addTo(map);

      const pinIcon = L.divIcon({
        html: `<i class="fa-solid fa-location-dot" style="font-size:28px;color:${accent};filter:drop-shadow(0 1px 2px rgba(0,0,0,.5))"></i>`,
        className: '',
        iconSize: [28, 28],
        iconAnchor: [14, 28],
      });

      if (lat !== undefined && lng !== undefined) {
        markerRef.current = L.marker([lat, lng], { icon: pinIcon, draggable: true }).addTo(map);
        markerRef.current.on('dragend', () => {
          const pos = markerRef.current!.getLatLng();
          onChangeRef.current(pos.lat, pos.lng);
        });
      }

      map.on('click', (e: any) => {
        const { lat: clickLat, lng: clickLng } = e.latlng;
        if (markerRef.current) {
          markerRef.current.setLatLng([clickLat, clickLng]);
        } else {
          markerRef.current = L.marker([clickLat, clickLng], { icon: pinIcon, draggable: true }).addTo(map);
          markerRef.current.on('dragend', () => {
            const pos = markerRef.current!.getLatLng();
            onChangeRef.current(pos.lat, pos.lng);
          });
        }
        onChangeRef.current(clickLat, clickLng);
      });
    });

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // وقتی مختصات از بیرون (مثلاً دکمهٔ GPS) تغییر کند، نقشه و پین همگام می‌شوند
  useEffect(() => {
    if (!mapRef.current || lat === undefined || lng === undefined) return;
    import('leaflet').then((L) => {
      if (!mapRef.current) return;
      mapRef.current.setView([lat, lng], 15);
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        const pinIcon = L.divIcon({
          html: `<i class="fa-solid fa-location-dot" style="font-size:28px;color:${accent};filter:drop-shadow(0 1px 2px rgba(0,0,0,.5))"></i>`,
          className: '',
          iconSize: [28, 28],
          iconAnchor: [14, 28],
        });
        markerRef.current = L.marker([lat, lng], { icon: pinIcon, draggable: true }).addTo(mapRef.current);
        markerRef.current.on('dragend', () => {
          const pos = markerRef.current!.getLatLng();
          onChangeRef.current(pos.lat, pos.lng);
        });
      }
    });
  }, [lat, lng]);

  return <div ref={containerRef} className="w-full h-56 rounded-xl overflow-hidden border border-gray-200" />;
};

const CUSTOM_OPTION_VALUE = '__custom_other__';

/**
 * فیلد منوی کشویی — هم حالت select ساده و هم دو تنظیم فرم‌ساز که قبلاً هیچ‌جا اعمال
 * نمی‌شدند را پیاده می‌کند: allowSearchOptions (کمبوباکس با جستجو) و allowCreateCustomOption
 * (گزینهٔ «سایر» که یک ورودی متنی آزاد باز می‌کند).
 */
/** ترکیب کلاس چیدمان گزینه‌های فیلدهای چندگزینه‌ای (رادیو/چک‌باکس گروهی) بر اساس تنظیم choiceLayout */
const choiceLayoutClass = (layout?: 'vertical' | 'horizontal' | 'grid_2_col'): string =>
  layout === 'horizontal' ? 'flex flex-wrap gap-4'
    : layout === 'grid_2_col' ? 'grid grid-cols-2 gap-2'
    : 'flex flex-col gap-2';

/** کلید دو‌حالته (سوییچ) — برای فیلدهای yesno و switch به‌جای چک‌باکس ساده */
const ToggleSwitch: React.FC<{
  id?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  accent: string;
  disabled?: boolean;
  onLabel?: string;
  offLabel?: string;
}> = ({ id, checked, onChange, accent, disabled, onLabel, offLabel }) => (
  <div className="flex items-center gap-3">
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="relative w-12 h-6 rounded-full transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
      style={{ backgroundColor: checked ? accent : '#D1D5DB' }}
    >
      <span
        className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all"
        style={{ right: checked ? '2px' : '26px' }}
      />
    </button>
    {(onLabel || offLabel) && (
      <span className="text-xs font-bold text-[#1F3A5F]">{checked ? onLabel : offLabel}</span>
    )}
  </div>
);

const SelectField: React.FC<{
  field: FormField;
  value: any;
  onChange: (v: any) => void;
  accent: string;
  baseInputClass: string;
  disabled?: boolean;
}> = ({ field, value, onChange, accent, baseInputClass, disabled }) => {
  const options = field.options || [];
  const allowCustom = !!field.allowCreateCustomOption;
  const isSearchable = !!field.allowSearchOptions;

  const matchedOption = options.find((o) => o.value === value);
  const [customMode, setCustomMode] = useState(allowCustom && !!value && !matchedOption);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isSearchable) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isSearchable]);

  const selectCustom = () => {
    setCustomMode(true);
    setOpen(false);
    onChange('');
  };
  const selectOption = (v: string) => {
    setCustomMode(false);
    setOpen(false);
    setSearch('');
    onChange(v);
  };

  if (isSearchable) {
    const filtered = options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()));
    const displayText = customMode ? 'سایر (مقدار دلخواه)' : matchedOption?.label || '';
    return (
      <div className="space-y-2">
        <div ref={containerRef} className="relative">
          <button
            id={field.id}
            type="button"
            disabled={disabled}
            onClick={() => setOpen((o) => !o)}
            className={`${baseInputClass} text-right flex items-center justify-between gap-2`}
          >
            <span className={displayText ? '' : 'text-gray-400'}>{displayText || '— انتخاب کنید —'}</span>
            <i className="fa-solid fa-chevron-down text-[10px] text-gray-400 shrink-0"></i>
          </button>
          {open && (
            <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 flex flex-col overflow-hidden">
              <div className="p-2 border-b border-gray-100 shrink-0">
                <input
                  autoFocus
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="جستجو در گزینه‌ها..."
                  className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none"
                  style={{ ['--tw-ring-color' as any]: accent }}
                />
              </div>
              <div className="overflow-y-auto">
                {filtered.length === 0 && <p className="p-3 text-xs text-gray-400 text-center">موردی یافت نشد</p>}
                {filtered.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => selectOption(opt.value)}
                    className="w-full text-right px-3 py-2 text-xs hover:bg-gray-50 block"
                    style={opt.value === value ? { color: accent, fontWeight: 700 } : undefined}
                  >
                    {opt.label}
                  </button>
                ))}
                {allowCustom && (
                  <button
                    type="button"
                    onClick={selectCustom}
                    className="w-full text-right px-3 py-2 text-xs hover:bg-gray-50 border-t border-gray-100 text-gray-500"
                  >
                    سایر (تایپ کنید)
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
        {customMode && (
          <input
            type="text"
            autoFocus
            value={value || ''}
            disabled={disabled}
            placeholder="مقدار دلخواه خود را بنویسید..."
            onChange={(e) => onChange(e.target.value)}
            className={baseInputClass}
            style={{ ['--tw-ring-color' as any]: accent }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <select
        id={field.id}
        value={customMode ? CUSTOM_OPTION_VALUE : value || ''}
        disabled={disabled}
        onChange={(e) => (e.target.value === CUSTOM_OPTION_VALUE ? selectCustom() : selectOption(e.target.value))}
        className={baseInputClass}
        style={{ ['--tw-ring-color' as any]: accent }}
      >
        <option value="">— انتخاب کنید —</option>
        {options.map((opt) => (
          <option key={opt.id} value={opt.value}>{opt.label}</option>
        ))}
        {allowCustom && <option value={CUSTOM_OPTION_VALUE}>سایر (تایپ کنید)</option>}
      </select>
      {customMode && (
        <input
          type="text"
          autoFocus
          value={value || ''}
          disabled={disabled}
          placeholder="مقدار دلخواه خود را بنویسید..."
          onChange={(e) => onChange(e.target.value)}
          className={baseInputClass}
          style={{ ['--tw-ring-color' as any]: accent }}
        />
      )}
    </div>
  );
};

/** «امروز» به تقویم شمسی، به‌صورت رشتهٔ YYYY/MM/DD با رقم فارسی */
const todayJalaliString = (): string => toPersianDigits(new DateObject({ calendar: persianCalendar }).format('YYYY/MM/DD'));

/** «امروز» به فرمت ISO میلادی (YYYY-MM-DD) — برای ورودی‌های native تقویم میلادی */
const todayIsoString = (): string => new Date().toISOString().slice(0, 10);

/** تبدیل تاریخ ثابت میلادی (ISO، از ورودی native تاریخ در فرم‌ساز) به رشتهٔ شمسی YYYY/MM/DD */
const gregorianIsoToJalaliString = (iso: string): string => {
  try {
    const g = new DateObject({ date: iso, format: 'YYYY-MM-DD', calendar: gregorianCalendar });
    return toPersianDigits(g.convert(persianCalendar).format('YYYY/MM/DD'));
  } catch {
    return '';
  }
};

/** انتخاب‌گر تاریخ شمسی (Jalali) — برای فیلدهای date/datetime وقتی calendarType روی jalali تنظیم شده */
const JalaliDateField: React.FC<{
  value: string;
  onChange: (v: string) => void;
  accent: string;
  iconColor?: string;
  minDate?: string;
  maxDate?: string;
  disabled?: boolean;
}> = ({ value, onChange, accent, iconColor, minDate, maxDate, disabled }) => {
  const toDateObject = (v?: string): DateObject | undefined => {
    if (!v) return undefined;
    const eng = toEnglishDigits(v);
    return new DateObject({ calendar: persianCalendar, date: eng, format: 'YYYY/MM/DD' });
  };

  return (
    <DatePicker
      calendar={persianCalendar}
      locale={persianLocaleFa}
      value={toDateObject(value)}
      onChange={(d: DateObject | null) => onChange(d ? toPersianDigits(d.format('YYYY/MM/DD')) : '')}
      minDate={toDateObject(minDate)}
      maxDate={toDateObject(maxDate)}
      disabled={disabled}
      format="YYYY/MM/DD"
      inputClass="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 bg-white cursor-pointer"
      containerClassName="w-full"
      calendarPosition="bottom-right"
      render={<JalaliDateInputButton iconColor={iconColor} accent={accent} />}
    />
  );
};

const JalaliDateInputButton: React.FC<any> = ({ openCalendar, value, iconColor, accent }) => (
  <div
    onClick={openCalendar}
    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white cursor-pointer flex items-center gap-2"
    style={{ ['--tw-ring-color' as any]: accent }}
  >
    <i className="fa-solid fa-calendar-days" style={{ color: iconColor || '#94a3b8' }}></i>
    <span className={value ? '' : 'text-gray-400'}>{value ? toPersianDigits(value) : 'انتخاب تاریخ'}</span>
  </div>
);

export default function FormPage({ fontSizeScale, onNavigate, slug }: FormPageProps) {
  const [form, setForm] = useState<FormDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [securityValues, setSecurityValues] = useState<Record<string, string>>({});
  const [securityTokens, setSecurityTokens] = useState<Record<string, { token: string; image: string }>>({});
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  // فایل‌های انتخاب‌شده فقط لحظهٔ ارسال نهایی فرم آپلود می‌شوند، نه بلافاصله هنگام انتخاب —
  // اگر کاربر فرم را رها کند، هیچ فایلی روی سرور باقی نمی‌ماند.
  const [pendingFiles, setPendingFiles] = useState<Record<string, File>>({});
  const [dragOverFieldId, setDragOverFieldId] = useState<string | null>(null);
  const [geoLocating, setGeoLocating] = useState<Record<string, boolean>>({});
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
        const queryParams = new URLSearchParams(window.location.search);
        (res.data.fields || []).forEach((f) => {
          if (f.defaultValue !== undefined && f.defaultValue !== null) defaults[f.id] = f.defaultValue;
          // پرشدن خودکار از پارامتر URL — سایر مقادیر prefillSource (نام/ایمیل/... کاربر)
          // نیاز به کاربر واردشده (لاگین) دارند که فرم عمومی فاقد آن است
          if (f.prefillSource === 'query_param' && f.prefillQueryParam) {
            const fromQuery = queryParams.get(f.prefillQueryParam);
            if (fromQuery) defaults[f.id] = fromQuery;
          }
          // مقدار پیش‌فرض تاریخ/ساعت — «امروز/اکنون» همیشه محاسبه می‌شود، «سفارشی» هم اگر تقویم
          // شمسی باشد باید از میلادیِ ذخیره‌شده در defaultValue به شمسی تبدیل شود
          if ((f.type === 'date' || f.type === 'datetime') && f.defaultDateOption && f.defaultDateOption !== 'none') {
            const isJalali = (f.calendarType || 'jalali') === 'jalali';
            if (f.defaultDateOption === 'today') {
              defaults[f.id] = isJalali ? todayJalaliString() : todayIsoString();
            } else if (f.defaultDateOption === 'custom' && f.defaultValue) {
              defaults[f.id] = isJalali ? gregorianIsoToJalaliString(f.defaultValue) : f.defaultValue;
            }
          } else if (f.type === 'time' && f.defaultDateOption === 'today') {
            defaults[f.id] = new Date().toTimeString().slice(0, 5);
          }
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
  const calculatedFields = useMemo(
    () => visibleFields.filter((f) => f.autoCalculationEnabled && f.formula),
    [visibleFields]
  );

  // محاسبهٔ خودکار — هر بار مقدار یکی از فیلدها تغییر می‌کند، فیلدهای دارای فرمول
  // دوباره از روی فرمول‌شان محاسبه می‌شوند (خودشان توسط کاربر قابل ویرایش نیستند)
  useEffect(() => {
    if (calculatedFields.length === 0) return;
    const numericValues: Record<string, number> = {};
    Object.entries(answers).forEach(([key, v]) => {
      const n = typeof v === 'number' ? v : parseFloat(v);
      if (!isNaN(n)) numericValues[key] = n;
    });
    setAnswers((prev) => {
      let changed = false;
      const next = { ...prev };
      calculatedFields.forEach((f) => {
        const computed = evaluateFormula(f.formula!, numericValues);
        if (computed !== null && next[f.id] !== computed) {
          next[f.id] = computed;
          changed = true;
        }
      });
      return changed ? next : prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, calculatedFields]);

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

  /** مَسک زندهٔ فیلد شماره تلفن — روی هر ضربهٔ کیبورد بر اساس phoneFormat فرمت می‌شود */
  const handlePhoneChange = (field: FormField, rawInput: string) => {
    const format = field.validation?.phoneFormat;
    if (!format || format === 'custom') {
      setAnswer(field.id, rawInput);
      return;
    }
    const config = PHONE_FORMAT_CONFIG[format];
    const normalized = toLatinDigits(rawInput);
    const digits = normalized.replace(/\D/g, '').slice(0, config.maxDigits);
    setAnswer(field.id, config.mask(digits));
  };

  /** پسوند فایل انتخاب‌شده را در همان لحظهٔ انتخاب (پیش از ارسال فرم) با تنظیمات فیلد می‌سنجد */
  const validateSelectedFile = (field: FormField, file: File): string | null => {
    const allowed = field.validation?.allowedExtensions;
    if (allowed && allowed.length > 0) {
      const ext = '.' + (file.name.split('.').pop() || '').toLowerCase();
      const normalized = allowed.map((e) => (e.startsWith('.') ? e.toLowerCase() : `.${e.toLowerCase()}`));
      if (!normalized.includes(ext)) {
        return `فرمت مجاز: ${normalized.join('، ')}`;
      }
    }
    const maxMb = field.validation?.maxFileSizeMb || 10;
    if (file.size > maxMb * 1024 * 1024) {
      return `حجم فایل نباید بیشتر از ${maxMb} مگابایت باشد.`;
    }
    return null;
  };

  // فایل فقط اعتبارسنجی و محلی نگه داشته می‌شود — آپلود واقعی در handleSubmit و فقط
  // هنگام ارسال نهایی فرم انجام می‌شود (نه بلافاصله هنگام انتخاب فایل).
  const handleFileSelect = (field: FormField, file: File | null) => {
    if (!file) {
      setPendingFiles((prev) => {
        const next = { ...prev };
        delete next[field.id];
        return next;
      });
      setAnswer(field.id, null);
      return;
    }
    const error = validateSelectedFile(field, file);
    if (error) {
      setFieldErrors((prev) => ({ ...prev, [field.id]: error }));
      return;
    }
    setPendingFiles((prev) => ({ ...prev, [field.id]: file }));
    // فقط به‌عنوان نشانگر محلی «این فیلد پر شده» برای اعتبارسنجی required — مقدار واقعی
    // (URL) بعد از آپلود موفق در زمان ارسال فرم جایگزین می‌شود.
    setAnswer(field.id, file.name);
  };

  /** آپلود واقعی یک فایل معلق به سرور — فقط از داخل handleSubmit فراخوانی می‌شود */
  const uploadPendingFile = async (formId: number, fieldId: string, file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('field_id', fieldId);
    const res = await fetch(`${API_BASE_URL}/forms/${formId}/upload-answer-file`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      throw new Error(body?.message || 'آپلود فایل ناموفق بود.');
    }
    const json = await res.json();
    return json.data?.url;
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    for (const field of visibleFields) {
      if (field.type === 'security' || field.autoCalculationEnabled) continue;
      const v = answers[field.id];
      const isAddressType = field.type === 'address' || field.type === 'location';
      const isEmpty = isAddressType
        ? !v || typeof v !== 'object' || !String(v.full || '').trim()
        : v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0);
      const customMsg = field.validation?.customErrorMessage;

      if (field.validation?.required && isEmpty) {
        errors[field.id] = customMsg || 'تکمیل این فیلد الزامی است.';
        continue;
      }
      if (isEmpty) continue;

      if (typeof v === 'string') {
        if (field.validation?.minLength && v.length < field.validation.minLength) {
          errors[field.id] = customMsg || `حداقل ${field.validation.minLength} کاراکتر وارد کنید.`;
          continue;
        }
        if (field.type === 'phone' && field.validation?.phoneFormat && field.validation.phoneFormat !== 'custom') {
          const config = PHONE_FORMAT_CONFIG[field.validation.phoneFormat];
          if (!config.pattern.test(v.replace(/\s/g, ''))) {
            errors[field.id] = customMsg || config.errorMessage;
            continue;
          }
        }
        if (field.type === 'email') {
          const domain = v.split('@')[1]?.toLowerCase().trim();
          if (domain) {
            const allowed = field.validation?.allowedDomains;
            if (allowed && allowed.length > 0 && !allowed.some((d) => domain === d.toLowerCase().trim())) {
              errors[field.id] = customMsg || `ایمیل باید از یکی از این دامنه‌ها باشد: ${allowed.join('، ')}`;
              continue;
            }
            if (field.validation?.blockFreeEmailProviders && FREE_EMAIL_PROVIDERS.includes(domain)) {
              errors[field.id] = customMsg || 'استفاده از ایمیل‌های عمومی رایگان (Gmail، Yahoo و...) مجاز نیست.';
              continue;
            }
          }
        }
        if ((field.type === 'date' || field.type === 'datetime') && (field.validation?.disallowPastDates || field.validation?.disallowFutureDates)) {
          const isJalali = (field.calendarType || 'jalali') === 'jalali';
          let isoDate: string | null = null;
          if (isJalali) {
            try {
              const d = new DateObject({ calendar: persianCalendar, date: toEnglishDigits(v), format: 'YYYY/MM/DD' });
              isoDate = d.convert(gregorianCalendar).format('YYYY-MM-DD');
            } catch {
              isoDate = null;
            }
          } else {
            isoDate = v.slice(0, 10);
          }
          if (isoDate) {
            const today = todayIsoString();
            if (field.validation?.disallowPastDates && isoDate < today) {
              errors[field.id] = customMsg || 'امکان انتخاب تاریخ‌های گذشته وجود ندارد.';
              continue;
            }
            if (field.validation?.disallowFutureDates && isoDate > today) {
              errors[field.id] = customMsg || 'امکان انتخاب تاریخ‌های آینده وجود ندارد.';
              continue;
            }
          }
        }
        const charRule = field.charTypeAllowed && field.charTypeAllowed !== 'any' ? CHAR_TYPE_RULES[field.charTypeAllowed] : null;
        if (charRule && !charRule.pattern.test(v)) {
          errors[field.id] = customMsg || charRule.message;
          continue;
        }
        if (field.validation?.regexPattern) {
          try {
            if (!new RegExp(field.validation.regexPattern).test(v)) {
              errors[field.id] = customMsg || 'فرمت واردشده معتبر نیست.';
              continue;
            }
          } catch {
            // الگوی نامعتبر در تنظیمات فیلد — نادیده گرفته می‌شود تا فرم غیرقابل‌ارسال نشود
          }
        }
      }

      if (field.includePostalCode !== false && v && typeof v === 'object' && v.postalCode) {
        if (!/^\d{10}$/.test(v.postalCode)) {
          errors[field.id] = 'کد پستی باید دقیقاً ۱۰ رقم باشد.';
        }
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
      // فایل‌های انتخاب‌شده تا همین لحظه هنوز روی سرور آپلود نشده‌اند — فقط حالا که
      // فرم واقعاً ارسال می‌شود، یکی‌یکی آپلود و URL واقعی آن‌ها جایگزین می‌شود.
      const finalAnswers = { ...answers };
      const pendingEntries = Object.entries(pendingFiles);
      if (pendingEntries.length > 0) {
        setUploading((prev) => {
          const next = { ...prev };
          pendingEntries.forEach(([fieldId]) => { next[fieldId] = true; });
          return next;
        });
        try {
          for (const [fieldId, file] of pendingEntries) {
            finalAnswers[fieldId] = await uploadPendingFile(form.id, fieldId, file);
          }
        } catch (uploadErr: any) {
          setSubmitError(uploadErr?.message || 'آپلود یکی از فایل‌ها ناموفق بود. دوباره تلاش کنید.');
          return;
        } finally {
          setUploading((prev) => {
            const next = { ...prev };
            pendingEntries.forEach(([fieldId]) => { next[fieldId] = false; });
            return next;
          });
        }
      }

      const completionSeconds = Math.round((Date.now() - startedAtRef.current) / 1000);
      const res = await API<{ data: { tracking_code: string; score_total: number | null; grade_label: string | null } }>(
        `forms/${form.id}/submit`,
        {
          answers: finalAnswers,
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
          <label htmlFor={field.id} className="block text-xs font-bold text-[#1F3A5F]">
            {field.label?.trim() || 'کد امنیتی'}
            {field.validation?.required && <span className="text-red-500 mr-1">*</span>}
          </label>
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
              id={field.id}
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

    // برخی فیلدها (وقتی ادمین متن برچسب را خالی گذاشته) label خالی دارند — بدون این
    // fallback، تگ <label> رندر می‌شود ولی کاملاً خالی و نامرئی به نظر می‌رسد
    const labelText = field.label?.trim() || field.placeholder?.trim() || 'این فیلد';
    const label = (
      <label htmlFor={field.id} className="block text-xs font-bold text-[#1F3A5F]">
        {labelText}
        {field.validation?.required && <span className="text-red-500 mr-1">*</span>}
      </label>
    );

    let control: React.ReactNode;
    if (field.type === 'textarea') {
      control = (
        <textarea
          id={field.id}
          rows={4}
          value={value || ''}
          disabled={field.disabled || field.readOnly}
          placeholder={field.placeholder}
          maxLength={field.validation?.maxLength}
          onChange={(e) => setAnswer(field.id, filterByCharType(e.target.value, field.charTypeAllowed))}
          className={baseInputClass}
          style={{ ['--tw-ring-color' as any]: accent }}
        />
      );
    } else if (field.type === 'number' || field.type === 'currency' || field.type === 'percentage') {
      const unitLabel = field.type === 'currency' ? (field.currencyUnit || 'تومان') : field.type === 'percentage' ? '٪' : field.numberUnit;
      const isCalculated = !!field.autoCalculationEnabled;
      const numericValue = typeof value === 'number' ? value : (value === '' || value === null || value === undefined ? null : Number(value));
      control = (
        <div>
          <div className="relative">
            <input
              id={field.id}
              type="number"
              value={value ?? ''}
              disabled={field.disabled || field.readOnly || isCalculated}
              readOnly={isCalculated}
              min={field.validation?.min}
              max={field.validation?.max}
              step={field.decimalPlaces ? 1 / Math.pow(10, field.decimalPlaces) : undefined}
              placeholder={field.placeholder}
              onChange={(e) => setAnswer(field.id, e.target.value === '' ? null : Number(e.target.value))}
              className={`${baseInputClass} ${isCalculated ? 'bg-gray-100 text-gray-500' : ''}`}
              style={{ ['--tw-ring-color' as any]: accent, paddingLeft: unitLabel ? '4rem' : undefined }}
            />
            {unitLabel && (
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 pointer-events-none select-none">
                {unitLabel}
              </span>
            )}
          </div>
          {numericValue !== null && !isNaN(numericValue) && (
            <p className="text-[11px] text-gray-400 mt-1">
              {isCalculated && 'مقدار محاسبه‌شده: '}
              {formatNumberDisplay(numericValue, field.decimalPlaces || 0, field.useThousandSeparator !== false)}
              {unitLabel ? ` ${unitLabel}` : ''}
            </p>
          )}
        </div>
      );
    } else if (field.type === 'phone') {
      const format = field.validation?.phoneFormat;
      const config = format && format !== 'custom' ? PHONE_FORMAT_CONFIG[format] : null;
      control = (
        <input
          id={field.id}
          type="tel"
          value={value || ''}
          disabled={field.disabled || field.readOnly}
          placeholder={field.placeholder || config?.placeholder}
          onChange={(e) => handlePhoneChange(field, e.target.value)}
          className={baseInputClass}
          dir="ltr"
          style={{ ['--tw-ring-color' as any]: accent }}
        />
      );
    } else if (field.type === 'date' || field.type === 'datetime') {
      const isDisabled = field.disabled || field.readOnly;
      const isJalali = (field.calendarType || 'jalali') === 'jalali';
      if (isJalali) {
        control = (
          <JalaliDateField
            value={value || ''}
            onChange={(v) => setAnswer(field.id, v)}
            accent={accent}
            iconColor={field.iconColor}
            minDate={field.validation?.disallowPastDates ? todayJalaliString() : undefined}
            maxDate={field.validation?.disallowFutureDates ? todayJalaliString() : undefined}
            disabled={isDisabled}
          />
        );
      } else {
        control = (
          <input
            id={field.id}
            type={field.type === 'datetime' ? 'datetime-local' : 'date'}
            value={value || ''}
            disabled={isDisabled}
            min={field.validation?.disallowPastDates ? todayIsoString() : undefined}
            max={field.validation?.disallowFutureDates ? todayIsoString() : undefined}
            onChange={(e) => setAnswer(field.id, e.target.value)}
            className={baseInputClass}
            style={{ ['--tw-ring-color' as any]: accent }}
          />
        );
      }
    } else if (field.type === 'select') {
      control = (
        <SelectField
          field={field}
          value={value}
          onChange={(v) => setAnswer(field.id, v)}
          accent={accent}
          baseInputClass={baseInputClass}
          disabled={field.disabled || field.readOnly}
        />
      );
    } else if (field.type === 'multiselect') {
      const selected: string[] = Array.isArray(value) ? value : [];
      const isFieldDisabled = field.disabled || field.readOnly;
      control = (
        <div className="flex flex-wrap gap-2">
          {(field.options || []).map((opt) => {
            const isChecked = selected.includes(opt.value);
            return (
              <button
                type="button"
                key={opt.id}
                disabled={isFieldDisabled}
                onClick={() =>
                  setAnswer(field.id, isChecked ? selected.filter((v) => v !== opt.value) : [...selected, opt.value])
                }
                className={`px-3 py-1.5 text-xs font-bold rounded-full border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
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
    } else if (field.type === 'yesno') {
      control = (
        <ToggleSwitch
          id={field.id}
          checked={value === 'yes'}
          disabled={field.disabled || field.readOnly}
          onChange={(v) => setAnswer(field.id, v ? 'yes' : 'no')}
          accent={accent}
          onLabel={field.yesLabel || 'بله'}
          offLabel={field.noLabel || 'خیر'}
        />
      );
    } else if (field.type === 'switch') {
      control = (
        <ToggleSwitch
          id={field.id}
          checked={!!value}
          disabled={field.disabled || field.readOnly}
          onChange={(v) => setAnswer(field.id, v)}
          accent={accent}
          onLabel={field.placeholder || 'فعال'}
          offLabel="غیرفعال"
        />
      );
    } else if (field.type === 'radio') {
      control = (
        <div className={choiceLayoutClass(field.choiceLayout)}>
          {(field.options || []).map((opt) => (
            <label key={opt.id} className="flex items-center gap-2 text-xs font-bold text-[#1F3A5F] cursor-pointer">
              <input
                type="radio"
                name={field.id}
                checked={value === opt.value}
                disabled={field.disabled || field.readOnly}
                onChange={() => setAnswer(field.id, opt.value)}
                style={{ accentColor: accent }}
              />
              {opt.label}
            </label>
          ))}
        </div>
      );
    } else if (field.type === 'checkbox') {
      const selected: string[] = Array.isArray(value) ? value : [];
      control = (
        <div className={choiceLayoutClass(field.choiceLayout)}>
          {(field.options || []).map((opt) => {
            const isChecked = selected.includes(opt.value);
            return (
              <label key={opt.id} className="flex items-center gap-2 text-xs font-bold text-[#1F3A5F] cursor-pointer">
                <input
                  type="checkbox"
                  checked={isChecked}
                  disabled={field.disabled || field.readOnly}
                  onChange={() =>
                    setAnswer(field.id, isChecked ? selected.filter((v) => v !== opt.value) : [...selected, opt.value])
                  }
                  style={{ accentColor: accent }}
                />
                {opt.label}
              </label>
            );
          })}
        </div>
      );
    } else if (field.type === 'rating') {
      const rating = Number(value) || 0;
      const isFieldDisabled = field.disabled || field.readOnly;
      control = (
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              disabled={isFieldDisabled}
              onClick={() => setAnswer(field.id, n)}
              className="text-2xl transition-transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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
            id={field.id}
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
    } else if (field.type === 'address' || field.type === 'location') {
      const addr = (value && typeof value === 'object') ? value : {};
      const updateAddr = (key: string, val: any) => setAnswer(field.id, { ...addr, [key]: val });
      const isLocating = !!geoLocating[field.id];
      control = (
        <div className="space-y-2">
          <textarea
            id={field.id}
            rows={2}
            value={addr.full || ''}
            disabled={field.disabled || field.readOnly}
            placeholder={field.placeholder || 'آدرس کامل را وارد کنید...'}
            onChange={(e) => updateAddr('full', e.target.value)}
            className={baseInputClass}
            style={{ ['--tw-ring-color' as any]: accent }}
          />
          {field.includeProvince !== false && (
            <div className="grid grid-cols-2 gap-2">
              <select
                value={addr.province || ''}
                onChange={(e) => updateAddr('province', e.target.value)}
                className={baseInputClass}
                style={{ ['--tw-ring-color' as any]: accent }}
              >
                <option value="">— استان —</option>
                {IRAN_PROVINCES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <input
                type="text"
                value={addr.city || ''}
                onChange={(e) => updateAddr('city', e.target.value)}
                placeholder="شهر"
                className={baseInputClass}
                style={{ ['--tw-ring-color' as any]: accent }}
              />
            </div>
          )}
          {field.includePostalCode !== false && (
            <input
              type="text"
              inputMode="numeric"
              maxLength={10}
              value={addr.postalCode || ''}
              onChange={(e) => updateAddr('postalCode', e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="کد پستی ده‌رقمی"
              dir="ltr"
              className={baseInputClass}
              style={{ ['--tw-ring-color' as any]: accent }}
            />
          )}
          {field.includeGeoCoordinates !== false && (
            <div className="space-y-2">
              <GeoMapPicker
                lat={addr.lat}
                lng={addr.lng}
                accent={accent}
                onChange={(newLat, newLng) => setAnswer(field.id, { ...addr, lat: newLat, lng: newLng })}
              />
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    if (!navigator.geolocation) return;
                    setGeoLocating((prev) => ({ ...prev, [field.id]: true }));
                    navigator.geolocation.getCurrentPosition(
                      (pos) => {
                        setAnswer(field.id, { ...addr, lat: pos.coords.latitude, lng: pos.coords.longitude });
                        setGeoLocating((prev) => ({ ...prev, [field.id]: false }));
                      },
                      () => setGeoLocating((prev) => ({ ...prev, [field.id]: false })),
                      { enableHighAccuracy: true, timeout: 10000 }
                    );
                  }}
                  disabled={isLocating}
                  className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-white flex items-center gap-1.5 disabled:opacity-60"
                  style={{ backgroundColor: accent }}
                >
                  <i className={`fa-solid ${isLocating ? 'fa-circle-notch fa-spin' : 'fa-location-crosshairs'}`}></i>
                  {isLocating ? 'در حال دریافت موقعیت...' : 'استفاده از موقعیت فعلی من'}
                </button>
                <span className="text-[10px] text-gray-400">یا روی نقشه کلیک کنید / پین را جابه‌جا کنید</span>
                {addr.lat && addr.lng && (
                  <span className="text-[11px] font-mono text-gray-500" dir="ltr">
                    {addr.lat.toFixed(5)}, {addr.lng.toFixed(5)}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      );
    } else if (field.type === 'file' || field.type === 'image') {
      const allowedExt = field.validation?.allowedExtensions;
      const acceptAttr = allowedExt && allowedExt.length > 0
        ? allowedExt.map((e) => (e.startsWith('.') ? e : `.${e}`)).join(',')
        : field.type === 'image' ? 'image/*' : undefined;
      const hint = [
        allowedExt && allowedExt.length > 0 ? `فرمت‌های مجاز: ${allowedExt.join('، ')}` : null,
        field.validation?.maxFileSizeMb ? `حداکثر حجم: ${field.validation.maxFileSizeMb} مگابایت` : null,
      ].filter(Boolean).join(' — ');
      const isDropDisabled = uploading[field.id] || submitting;
      const isDragOver = dragOverFieldId === field.id;
      control = (
        <div>
          <label
            htmlFor={`file-input-${field.id}`}
            onDragOver={(e) => {
              e.preventDefault();
              if (!isDropDisabled) setDragOverFieldId(field.id);
            }}
            onDragLeave={() => setDragOverFieldId((id) => (id === field.id ? null : id))}
            onDrop={(e) => {
              e.preventDefault();
              setDragOverFieldId((id) => (id === field.id ? null : id));
              if (!isDropDisabled) handleFileSelect(field, e.dataTransfer.files?.[0] || null);
            }}
            className={`flex flex-col items-center justify-center gap-1.5 p-5 border-2 border-dashed text-center transition-colors ${radiusClass} ${
              isDropDisabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
            }`}
            style={{
              borderColor: isDragOver ? accent : '#D1D5DB',
              backgroundColor: isDragOver ? `${accent}14` : '#FAFAFA',
            }}
          >
            <i className="fa-solid fa-cloud-arrow-up text-xl" style={{ color: accent }}></i>
            <span className="text-xs font-bold text-[#1F3A5F]">
              برای انتخاب فایل کلیک کنید یا آن را اینجا رها کنید
            </span>
            <input
              id={`file-input-${field.id}`}
              type="file"
              accept={acceptAttr}
              disabled={isDropDisabled}
              onChange={(e) => {
                handleFileSelect(field, e.target.files?.[0] || null);
                e.target.value = '';
              }}
              className="hidden"
            />
          </label>
          {hint && !error && <p className="text-[10px] text-gray-400 mt-1">{hint}</p>}
          {uploading[field.id] && <p className="text-[11px] text-gray-400 mt-1">در حال آپلود...</p>}
          {pendingFiles[field.id] && !uploading[field.id] && (
            <p className="text-[11px] text-teal-600 mt-1 flex items-center gap-1">
              <i className="fa-solid fa-paperclip"></i> «{pendingFiles[field.id].name}» انتخاب شد — هنگام ارسال فرم آپلود می‌شود
            </p>
          )}
        </div>
      );
    } else if (INPUT_TYPE_MAP[field.type]) {
      control = (
        <input
          id={field.id}
          type={INPUT_TYPE_MAP[field.type]}
          value={value || ''}
          disabled={field.disabled || field.readOnly}
          placeholder={field.placeholder}
          maxLength={field.validation?.maxLength}
          onChange={(e) => setAnswer(field.id, e.target.value)}
          className={baseInputClass}
          dir={field.type === 'email' || field.type === 'url' ? 'ltr' : undefined}
          style={{ ['--tw-ring-color' as any]: accent }}
        />
      );
    } else if (TEXT_LIKE_TYPES.has(field.type)) {
      control = (
        <input
          id={field.id}
          type="text"
          value={value || ''}
          disabled={field.disabled || field.readOnly}
          placeholder={field.placeholder}
          maxLength={field.validation?.maxLength}
          onChange={(e) => setAnswer(field.id, filterByCharType(e.target.value, field.charTypeAllowed))}
          className={baseInputClass}
          style={{ ['--tw-ring-color' as any]: accent }}
        />
      );
    } else {
      // Unsupported/exotic field type — plain text fallback keeps the form fully submittable
      control = (
        <input
          id={field.id}
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
        {label}
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
