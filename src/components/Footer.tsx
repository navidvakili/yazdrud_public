import { useTranslation } from 'react-i18next';

interface FooterProps {
  fontSizeScale: number;
  onNavigate: (section: string) => void;
}

export default function Footer({ fontSizeScale, onNavigate }: FooterProps) {
  const { t } = useTranslation();
  const currentYearPersian = '۱۴۰۵';

  const handleSystemLink = (name: string) => {
    alert(t('yazdrud.footer.systemLinkAlert', { name }));
  };

  return (
    <footer
      id="footer"
      className="backdrop-blur-md bg-[#1F3A5F]/90 text-white pt-16 pb-8 px-4 border-t border-white/15 relative overflow-hidden shadow-2xl"
      style={{ fontSize: `${16 * fontSizeScale}px` }}
    >
      {/* Decorative Subtle Line top */}
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-white/25 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

        {/* Column 1: Intro and National Emblem */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg p-1 flex items-center justify-center">
              <img 
                src="/assets/images/logo-white.png" 
                alt={t('yazdrud.footer.logoAlt')}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h4 className="text-base font-black text-white">{t('yazdrud.footer.orgName')}</h4>
              <p className="text-[10px] text-[#E7D3B1] font-medium">{t('yazdrud.footer.tagline')}</p>
            </div>
          </div>

          <p className="text-xs text-gray-300 font-bold leading-relaxed">
            {t('yazdrud.footer.aboutText')}
          </p>

          {/* Social Network Links */}
          <div className="space-y-2 pt-2">
            <span className="text-xs font-bold text-[#E7D3B1] block">{t('yazdrud.footer.followUs')}</span>
            <div className="flex gap-3">
              {/* Eitaa */}
              <button
                onClick={() => handleSystemLink(t('yazdrud.footer.eitaa'))}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-[#B76E4C] hover:scale-105 active:scale-95 transition-all border border-white/20 flex items-center justify-center cursor-pointer"
                title={t('yazdrud.footer.eitaaTitle')}
              >
                <i className="fa-solid fa-paper-plane text-xs text-white"></i>
              </button>
              {/* Bale */}
              <button
                onClick={() => handleSystemLink(t('yazdrud.footer.bale'))}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-[#2A9D8F] hover:scale-105 active:scale-95 transition-all border border-white/20 flex items-center justify-center cursor-pointer"
                title={t('yazdrud.footer.baleTitle')}
              >
                <i className="fa-solid fa-comments text-xs text-white"></i>
              </button>
              {/* Aparat */}
              <button
                onClick={() => handleSystemLink(t('yazdrud.footer.aparat'))}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-red-600 hover:scale-105 active:scale-95 transition-all border border-white/20 flex items-center justify-center cursor-pointer"
                title={t('yazdrud.footer.aparatTitle')}
              >
                <i className="fa-solid fa-video text-xs text-white"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div className="space-y-3">
          <h4 className="text-sm font-black text-[#E7D3B1] border-r-4 border-[#2A9D8F] pr-2">{t('yazdrud.footer.quickAccess')}</h4>
          <ul className="space-y-2 text-xs font-bold text-gray-300">
            <li>
              <button onClick={() => onNavigate('hero')} className="hover:text-white transition-colors">
                <i className="fa-solid fa-chevron-left text-[8px] text-[#2A9D8F] ml-1.5"></i>
                <span>{t('yazdrud.footer.home')}</span>
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('services')} className="hover:text-white transition-colors">
                <i className="fa-solid fa-chevron-left text-[8px] text-[#2A9D8F] ml-1.5"></i>
                <span>{t('yazdrud.footer.eServices')}</span>
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('interactive-map')} className="hover:text-white transition-colors">
                <i className="fa-solid fa-chevron-left text-[8px] text-[#2A9D8F] ml-1.5"></i>
                <span>{t('yazdrud.footer.mapCounties')}</span>
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('news')} className="hover:text-white transition-colors">
                <i className="fa-solid fa-chevron-left text-[8px] text-[#2A9D8F] ml-1.5"></i>
                <span>{t('yazdrud.footer.eventsNews')}</span>
              </button>
            </li>
          </ul>
        </div>

        {/* Column 3: Related Systems */}
        <div className="space-y-3">
          <h4 className="text-sm font-black text-[#E7D3B1] border-r-4 border-[#C98A5A] pr-2">{t('yazdrud.footer.relatedSystems')}</h4>
          <ul className="space-y-2 text-xs font-bold text-gray-300">
            <li>
              <button onClick={() => handleSystemLink(t('yazdrud.footer.ministryPortal'))} className="hover:text-white text-right transition-colors">
                <i className="fa-solid fa-link text-[8px] text-[#C98A5A] ml-1.5"></i>
                <span>{t('yazdrud.footer.ministryPortalLabel')}</span>
              </button>
            </li>
            <li>
              <button onClick={() => handleSystemLink(t('yazdrud.footer.nationalSmartGov'))} className="hover:text-white text-right transition-colors">
                <i className="fa-solid fa-link text-[8px] text-[#C98A5A] ml-1.5"></i>
                <span>{t('yazdrud.footer.nationalSmartGovLabel')}</span>
              </button>
            </li>
            <li>
              <button onClick={() => handleSystemLink(t('yazdrud.footer.amlakPortal'))} className="hover:text-white text-right transition-colors">
                <i className="fa-solid fa-link text-[8px] text-[#C98A5A] ml-1.5"></i>
                <span>{t('yazdrud.footer.amlakPortalLabel')}</span>
              </button>
            </li>
            <li>
              <button onClick={() => handleSystemLink(t('yazdrud.footer.shahrdariPortal'))} className="hover:text-white text-right transition-colors">
                <i className="fa-solid fa-link text-[8px] text-[#C98A5A] ml-1.5"></i>
                <span>{t('yazdrud.footer.shahrdariPortalLabel')}</span>
              </button>
            </li>
          </ul>
        </div>

        {/* Column 4: Address and Contacts */}
        <div className="space-y-3">
          <h4 className="text-sm font-black text-[#E7D3B1] border-r-4 border-[#B76E4C] pr-2">{t('yazdrud.footer.contactInfo')}</h4>
          <ul className="space-y-2.5 text-xs text-gray-300 font-medium leading-relaxed">
            <li className="flex items-start gap-2">
              <i className="fa-solid fa-map-location-dot text-[#B76E4C] mt-1 text-[11px]"></i>
              <span>{t('yazdrud.footer.addressLabel')} {t('yazdrud.footer.addressValue')}</span>
            </li>
            <li className="flex items-center gap-2">
              <i className="fa-solid fa-phone text-[#2A9D8F] text-[11px]"></i>
              <span>{t('yazdrud.footer.phoneLabel')} <span dir="ltr" className="font-mono">035-36236200</span></span>
            </li>
            <li className="flex items-center gap-2">
              <i className="fa-solid fa-fax text-[#C98A5A] text-[11px]"></i>
              <span>{t('yazdrud.footer.faxLabel')} <span dir="ltr" className="font-mono">035-36235065</span></span>
            </li>
            <li className="flex items-center gap-2">
              <i className="fa-solid fa-envelope text-white/60 text-[11px]"></i>
              <span>{t('yazdrud.footer.emailLabel')} <span dir="ltr" className="font-mono">info@yazdrud.ir</span></span>
            </li>
          </ul>
        </div>

      </div>

      {/* Decorative Traditional Border Divider */}
      <div className="w-full h-[1px] bg-white/10 my-10"></div>

      {/* Copyright Bar */}
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center text-[11px] font-bold text-gray-400 gap-4">
        <div className="text-center sm:text-right">
          <span>{t('yazdrud.footer.copyrightPrefix')} </span>
          <strong className="text-white">{t('yazdrud.footer.orgName')}</strong>
          <span> {t('yazdrud.footer.copyrightSuffix', { year: currentYearPersian })}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>{t('yazdrud.footer.designedBy')} </span>
          <a
            href="https://karanet.info"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#2A9D8F] text-white px-2 py-0.5 rounded text-[10px] font-black hover:bg-[#1F3A5F] transition-colors"
          >
            {t('yazdrud.footer.companyName')}
          </a>
        </div>
      </div>
    </footer>
  );
}
