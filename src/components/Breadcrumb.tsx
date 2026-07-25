import React, { useState } from 'react';
import { ActivePage } from '../types';

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
  page?: ActivePage;
  active?: boolean;
  icon?: string;
}

interface BreadcrumbProps {
  currentPage: ActivePage;
  pageTitle: string;
  subTitle?: string;
  items?: BreadcrumbItem[];
  onNavigate: (page: ActivePage, itemId?: number) => void;
}

export default function Breadcrumb({
  currentPage,
  pageTitle,
  subTitle,
  items,
  onNavigate,
}: BreadcrumbProps) {
  const [copied, setCopied] = useState(false);

  // Default dynamic hierarchy generation if items array is not explicitly provided
  const breadcrumbItems: BreadcrumbItem[] = items || [
    {
      label: 'صفحه اصلی',
      icon: 'fa-house',
      onClick: () => onNavigate('home'),
    },
    {
      label: pageTitle,
      onClick: subTitle ? () => onNavigate(currentPage) : undefined,
      active: !subTitle,
    },
    ...(subTitle
      ? [
          {
            label: subTitle,
            active: true,
          },
        ]
      : []),
  ];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const activeLeaf = breadcrumbItems[breadcrumbItems.length - 1];

  return (
    <div className="bg-[#152843] text-white pt-36 sm:pt-40 lg:pt-44 pb-8 sm:pb-10 px-4 sm:px-8 border-b border-white/10 shadow-lg relative overflow-hidden">
      {/* Decorative Yazd Persian Tile / Glow Accents */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#2A9D8F]/15 blur-3xl rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 left-10 w-60 h-60 bg-[#C98A5A]/10 blur-2xl rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div className="max-w-3xl space-y-2">
          {/* Dynamic Breadcrumb Navigation Trail */}
          <nav aria-label="مسیر راهنما (Breadcrumb)">
            <ol className="flex flex-wrap items-center gap-2 text-xs font-semibold text-gray-300">
              {breadcrumbItems.map((item, index) => {
                const isLast = index === breadcrumbItems.length - 1;
                return (
                  <li key={index} className="flex items-center gap-2">
                    {index > 0 && (
                      <i className="fa-solid fa-chevron-left text-[10px] text-gray-500 shrink-0"></i>
                    )}

                    {item.onClick && !isLast ? (
                      <button
                        onClick={item.onClick}
                        className="hover:text-[#2A9D8F] text-gray-300 transition-colors flex items-center gap-1.5 cursor-pointer py-1 px-1.5 rounded-lg hover:bg-white/5"
                        title={`بازگشت به ${item.label}`}
                      >
                        {item.icon && <i className={`fa-solid ${item.icon} text-[11px]`}></i>}
                        <span className="line-clamp-1">{item.label}</span>
                      </button>
                    ) : (
                      <span
                        className={`flex items-center gap-1.5 py-1 px-2 rounded-lg font-extrabold ${
                          isLast || item.active
                            ? 'bg-[#2A9D8F]/20 text-[#2A9D8F] border border-[#2A9D8F]/30'
                            : 'text-gray-300'
                        }`}
                        aria-current={isLast ? 'page' : undefined}
                      >
                        {item.icon && <i className={`fa-solid ${item.icon} text-[11px]`}></i>}
                        <span className="line-clamp-1">{item.label}</span>
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>

          {/* Dynamic Page Header Title */}
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3 pt-1">
            <span className="w-2.5 h-8 bg-[#2A9D8F] rounded-full inline-block shrink-0 shadow-sm"></span>
            <span className="line-clamp-2">{activeLeaf ? activeLeaf.label : pageTitle}</span>
          </h1>
        </div>

        {/* Quick Utilities: Share / Back Button */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          <button
            onClick={handleCopyLink}
            className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95"
            title="اشتراک‌گذاری لینک صفحه"
          >
            <i className={`fa-solid ${copied ? 'fa-check text-emerald-400' : 'fa-share-nodes'}`}></i>
            <span className="hidden sm:inline">{copied ? 'لینک کپی شد' : 'اشتراک‌گذاری'}</span>
          </button>

          <button
            onClick={() => onNavigate('home')}
            className="px-4 py-2.5 rounded-xl bg-[#2A9D8F] hover:bg-[#2A9D8F]/90 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md active:scale-95"
          >
            <i className="fa-solid fa-arrow-right"></i>
            <span>صفحه اصلی</span>
          </button>
        </div>
      </div>
    </div>
  );
}
