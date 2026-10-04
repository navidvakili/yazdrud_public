import React, { useEffect, useState } from 'react';
import { API, decodeHtmlEntities } from '../../shared-utils';
import { ActivePage, NewsItem } from '../../types';
import Breadcrumb from '../Breadcrumb';

interface SmartPagePageProps {
  fontSizeScale: number;
  onNavigate: (page: ActivePage, itemId?: number, itemTitle?: string) => void;
  slug: string;
}

// ============================================================
// شمای داده — نگاشتی مستقل و هم‌شکل با frontend/src/apps/page-builder/builderTypes.ts
// (دو اپ باندلر مشترک ندارند، پس این‌جا فقط فیلدهایی که MVP رندرر عمومی لازم دارد تکرار شده)
// ============================================================

interface WidgetStyle {
  textColor?: string;
  backgroundColor?: string;
  backgroundGradient?: string;
  fontSize?: string;
  fontWeight?: string | number;
  textAlign?: 'right' | 'center' | 'left' | 'justify';
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
  marginTop?: number;
  marginBottom?: number;
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none';
  shadow?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  fullWidth?: boolean;
}

interface WidgetDataBinding {
  dataSource: 'announcements' | 'news' | 'gallery' | 'awards' | 'staff' | 'files' | 'dedicated-page' | 'form' | 'none';
  formSlug?: string;
  limit?: number;
}

interface WidgetInstance {
  id: string;
  type: string;
  title: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  buttonUrl?: string;
  buttonText?: string;
  buttonTarget?: 'self' | 'new';
  settings: {
    style: WidgetStyle;
    binding: WidgetDataBinding;
    visibility?: { desktop: boolean; tablet: boolean; mobile: boolean };
  };
}

type ColumnBlock = { kind: 'widget'; widget: WidgetInstance } | { kind: 'section'; section: SectionInstance };

interface ColumnInstance {
  id: string;
  width: number;
  widths?: { desktop: number; tablet?: number; mobile?: number };
  widgets: WidgetInstance[];
  subSections?: SectionInstance[];
  blocks?: ColumnBlock[];
}

interface SectionInstance {
  id: string;
  name: string;
  layout: 'full-width' | 'boxed';
  backgroundColor?: string;
  backgroundGradient?: string;
  backgroundImage?: string;
  backgroundPosition?: string;
  backgroundSize?: string;
  backgroundRepeat?: string;
  paddingTop: number;
  paddingBottom: number;
  paddingLeft?: number;
  paddingRight?: number;
  columns: ColumnInstance[];
}

interface GlobalStyles {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  containerMaxWidth: number;
}

interface SmartPageSchema {
  id: string;
  title: string;
  slug: string;
  status: 'draft' | 'published';
  seo?: { title?: string; description?: string };
  globalStyles: GlobalStyles;
  sections: SectionInstance[];
}

interface SmartPageDto {
  id: number;
  title: string;
  slug: string;
  schema: SmartPageSchema;
}

/** فهرست یکپارچهٔ بلوک‌های یک ستون — یا blocks ذخیره‌شده، یا ساخته‌شده از widgets/subSections قدیمی */
const getColumnBlocks = (col: ColumnInstance): ColumnBlock[] => {
  if (Array.isArray(col.blocks) && col.blocks.length > 0) return col.blocks;
  return [
    ...(col.widgets ?? []).map((widget) => ({ kind: 'widget' as const, widget })),
    ...(col.subSections ?? []).map((section) => ({ kind: 'section' as const, section })),
  ];
};

const resolveBoxShadow = (shadow?: string): string | undefined => {
  const presets: Record<string, string> = {
    sm: '0 1px 2px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.1)',
    md: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
    lg: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)',
    xl: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
  };
  if (!shadow || shadow === 'none') return undefined;
  return presets[shadow] || shadow;
};

/** استایل اینلاین ظرف دور یک ویجت — نگاشت مستقیم فیلدهای WidgetStyle به CSS */
const resolveContainerStyle = (style: WidgetStyle): React.CSSProperties => ({
  color: style.textColor,
  backgroundColor: style.backgroundColor,
  backgroundImage: style.backgroundGradient || undefined,
  fontSize: style.fontSize,
  fontWeight: style.fontWeight as any,
  textAlign: style.textAlign,
  paddingTop: style.paddingTop !== undefined ? `${style.paddingTop}px` : undefined,
  paddingBottom: style.paddingBottom !== undefined ? `${style.paddingBottom}px` : undefined,
  paddingLeft: style.paddingLeft !== undefined ? `${style.paddingLeft}px` : undefined,
  paddingRight: style.paddingRight !== undefined ? `${style.paddingRight}px` : undefined,
  marginTop: style.marginTop !== undefined ? `${style.marginTop}px` : undefined,
  marginBottom: style.marginBottom !== undefined ? `${style.marginBottom}px` : undefined,
  borderRadius: style.borderRadius !== undefined ? `${style.borderRadius}px` : undefined,
  borderWidth: style.borderWidth !== undefined ? `${style.borderWidth}px` : undefined,
  borderColor: style.borderColor,
  borderStyle: style.borderWidth ? style.borderStyle || 'solid' : undefined,
  boxShadow: resolveBoxShadow(style.shadow),
});

/** خوراک خبر/اطلاعیه — برای news-feed و announcements-feed (بک‌اند یزدرود خبر و اطلاعیه را یک منبع می‌داند) */
const NewsFeedWidget: React.FC<{
  widget: WidgetInstance;
  onNavigate: (page: ActivePage, itemId?: number, itemTitle?: string) => void;
}> = ({ widget, onNavigate }) => {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    API<{ data: NewsItem[] }>(`news?per_page=${widget.settings.binding.limit || 4}`)
      .then((res) => {
        if (!cancelled) setItems(res.data || []);
      })
      .catch(() => {
        /* silent — widget simply renders empty */
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [widget.settings.binding.limit]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-gray-100 animate-pulse" />
        ))}
      </div>
    );
  }
  if (items.length === 0) return null;

  return (
    <div className="space-y-2">
      {widget.title && <h3 className="text-sm font-black text-[#1F3A5F] mb-2">{widget.title}</h3>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((n) => (
          <button
            key={n.id}
            onClick={() => onNavigate('news', n.id, n.title)}
            className="text-right glass-panel border border-white/60 rounded-2xl p-4 hover:shadow-md transition-all flex gap-3 items-start"
          >
            {n.image_url && (
              <img src={n.image_url} alt={n.title} className="w-16 h-16 rounded-xl object-cover shrink-0" />
            )}
            <div className="min-w-0">
              <p className="text-xs font-bold text-[#1F3A5F] line-clamp-2">{decodeHtmlEntities(n.title)}</p>
              {n.published_at && (
                <p className="text-[10px] text-gray-400 mt-1">{new Date(n.published_at).toLocaleDateString('fa-IR')}</p>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

/** رندر یک ویجت — فقط پرکاربردترین انواع (MVP)؛ بقیه با یک نگه‌دارندهٔ خنثی نمایش داده می‌شوند */
const WidgetBlock: React.FC<{
  widget: WidgetInstance;
  accent: string;
  onNavigate: (page: ActivePage, itemId?: number, itemTitle?: string) => void;
}> = ({ widget, accent, onNavigate }) => {
  const style = widget.settings?.style || {};
  const containerStyle = resolveContainerStyle(style);

  switch (widget.type) {
    case 'heading':
      return (
        <div style={containerStyle}>
          <h2 className="text-2xl font-black tracking-tight leading-tight" style={{ fontSize: style.fontSize }}>
            {widget.content || widget.title}
          </h2>
        </div>
      );

    case 'text':
      return (
        <div style={containerStyle}>
          <p className="whitespace-pre-line text-sm leading-relaxed">{widget.content}</p>
        </div>
      );

    case 'richtext':
      return (
        <div
          style={containerStyle}
          className="prose prose-sm max-w-none leading-relaxed"
          dangerouslySetInnerHTML={{ __html: widget.content || '' }}
        />
      );

    case 'image':
      return widget.imageUrl ? (
        <div style={containerStyle} className="overflow-hidden rounded-2xl">
          <img
            src={widget.imageUrl}
            alt={widget.title}
            className="w-full h-auto"
            style={{ objectFit: style.objectFit || 'cover' }}
          />
        </div>
      ) : null;

    case 'button':
      return (
        <div style={{ ...containerStyle, display: 'flex', justifyContent: style.textAlign === 'center' ? 'center' : style.textAlign === 'left' ? 'flex-end' : 'flex-start' }}>
          <a
            href={widget.buttonUrl || '#'}
            target={widget.buttonTarget === 'new' ? '_blank' : undefined}
            rel={widget.buttonTarget === 'new' ? 'noopener noreferrer' : undefined}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm text-white shadow-md hover:opacity-90 transition-all"
            style={{ backgroundColor: style.backgroundColor || accent, color: style.textColor }}
          >
            {widget.buttonText || widget.content || 'دکمه اقدام'}
          </a>
        </div>
      );

    case 'divider':
      return (
        <div style={containerStyle} className="py-3">
          <hr className="border-gray-200" style={{ borderColor: style.borderColor }} />
        </div>
      );

    case 'spacer':
      return <div style={{ height: `${style.paddingTop || 32}px` }} />;

    case 'callout':
      return (
        <div style={containerStyle} className="flex items-start gap-3 p-4 rounded-2xl border border-amber-300/40 bg-amber-50 text-amber-800">
          <i className="fa-solid fa-circle-info mt-0.5 text-amber-500" />
          <div>
            <div className="text-sm font-black">{widget.title}</div>
            {widget.content && <p className="text-xs leading-relaxed mt-1">{widget.content}</p>}
          </div>
        </div>
      );

    case 'news-feed':
    case 'announcements-feed':
      return <NewsFeedWidget widget={widget} onNavigate={onNavigate} />;

    case 'form':
      return widget.settings.binding.formSlug ? (
        <div style={containerStyle} className="p-6 rounded-2xl border border-dashed border-gray-300 text-center">
          <i className="fa-solid fa-file-pen text-xl text-gray-400 mb-2 block" />
          <p className="text-xs text-gray-500 mb-3">{widget.title || 'تکمیل فرم'}</p>
          <a
            href={`/forms/${widget.settings.binding.formSlug}`}
            className="inline-block px-5 py-2 rounded-xl text-xs font-bold text-white"
            style={{ backgroundColor: accent }}
          >
            تکمیل فرم
          </a>
        </div>
      ) : null;

    default:
      // انواع ویجت پیشرفته‌تر (نقشه، جدول اکسل، تب‌ها، گالری و...) هنوز در سایت عمومی پیاده نشده‌اند —
      // به‌جای حذف‌شدن بی‌صدا، یک نگه‌دارندهٔ خنثی نمایش داده می‌شود تا چیدمان صفحه حفظ شود
      return (
        <div style={containerStyle} className="p-4 rounded-xl bg-gray-50 border border-dashed border-gray-200 text-center">
          <p className="text-[11px] text-gray-400">{widget.title || widget.type}</p>
        </div>
      );
  }
};

const ColumnBlockView: React.FC<{
  block: ColumnBlock;
  accent: string;
  onNavigate: (page: ActivePage, itemId?: number, itemTitle?: string) => void;
}> = ({ block, accent, onNavigate }) =>
  block.kind === 'widget' ? (
    <WidgetBlock widget={block.widget} accent={accent} onNavigate={onNavigate} />
  ) : (
    <SectionView section={block.section} accent={accent} onNavigate={onNavigate} />
  );

const SectionView: React.FC<{
  section: SectionInstance;
  accent: string;
  onNavigate: (page: ActivePage, itemId?: number, itemTitle?: string) => void;
}> = ({ section, accent, onNavigate }) => {
  const sectionStyle: React.CSSProperties = {
    backgroundColor: section.backgroundColor,
    backgroundImage: section.backgroundGradient || (section.backgroundImage ? `url(${section.backgroundImage})` : undefined),
    backgroundPosition: section.backgroundPosition || 'center',
    backgroundSize: section.backgroundSize || 'cover',
    backgroundRepeat: section.backgroundRepeat || 'no-repeat',
    paddingTop: `${section.paddingTop}px`,
    paddingBottom: `${section.paddingBottom}px`,
    paddingLeft: section.paddingLeft !== undefined ? `${section.paddingLeft}px` : undefined,
    paddingRight: section.paddingRight !== undefined ? `${section.paddingRight}px` : undefined,
  };

  return (
    <section style={sectionStyle}>
      <div className={section.layout === 'boxed' ? 'max-w-[1200px] mx-auto px-4' : 'w-full px-4'}>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {section.columns.map((col) => (
            <div key={col.id} className="space-y-4" style={{ gridColumn: `span ${col.widths?.desktop || col.width || 12} / span ${col.widths?.desktop || col.width || 12}` }}>
              {getColumnBlocks(col).map((block, idx) => (
                <ColumnBlockView key={block.kind === 'widget' ? block.widget.id : block.section.id || idx} block={block} accent={accent} onNavigate={onNavigate} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default function SmartPagePage({ fontSizeScale, onNavigate, slug }: SmartPagePageProps) {
  const [page, setPage] = useState<SmartPageDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    setPage(null);
    API<{ data: SmartPageDto }>(`smart-pages/slug/${encodeURIComponent(slug)}/public`)
      .then((res) => {
        if (!cancelled) setPage(res.data);
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

  const accent = page?.schema?.globalStyles?.primaryColor || '#2A9D8F';

  return (
    <div className="min-h-screen bg-[#F5F6F8] pb-20 text-[#1F3A5F]" style={{ fontSize: `${16 * fontSizeScale}px` }}>
      <Breadcrumb currentPage="page" pageTitle={page?.schema?.title || 'صفحه'} onNavigate={onNavigate} />

      {loading && (
        <div className="flex items-center justify-center py-24 text-[#1F3A5F]/60">
          <i className="fa-solid fa-circle-notch fa-spin text-3xl"></i>
        </div>
      )}

      {!loading && notFound && (
        <div className="max-w-2xl mx-auto px-4 mt-8">
          <div className="glass-panel border border-white/60 rounded-2xl p-16 text-center text-[#1F3A5F]/70">
            <i className="fa-solid fa-file-circle-xmark text-4xl mb-3 block text-gray-300"></i>
            <p className="font-bold text-sm">این صفحه یافت نشد یا در حال حاضر منتشر نیست.</p>
          </div>
        </div>
      )}

      {!loading && !notFound && page && (
        <div className="mt-4">
          {page.schema.sections.map((section) => (
            <SectionView key={section.id} section={section} accent={accent} onNavigate={onNavigate} />
          ))}
        </div>
      )}
    </div>
  );
}
