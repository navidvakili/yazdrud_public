import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { BACKEND_API_URL } from './shared-constants';
import fa from './locales/fa';

const resources = { fa };
const LANGUAGE_STORAGE_KEY = 'appLanguage';
const defaultLanguage = 'fa';

i18n.use(initReactI18next)
	.init({
		resources,
		lng: defaultLanguage,
		supportedLngs: ['fa'],
		fallbackLng: 'fa',
		initImmediate: false,
		keySeparator: '.',
		interpolation: {
			escapeValue: false
		}
	});

// The locale files are statically imported above, which bakes their content
// into the production bundle at build time. To make edits saved in the admin
// locale editor apply on an already-built site (without a rebuild), we also
// fetch the latest translations from the backend at runtime and merge them
// over the static bundle via addResourceBundle (deep merge + overwrite).
async function loadRuntimeLocale(code: string): Promise<boolean> {
	try {
		const res = await fetch(`${BACKEND_API_URL}/api/v1/languages/${code}/locale`);
		if (!res.ok) return false;
		const json = await res.json();
		const bundle = json?.data?.translation;
		if (!bundle || typeof bundle !== 'object') return false;
		i18n.addResourceBundle(code, 'translation', bundle, true, true);
		return true;
	} catch (error) {
		console.error(`Failed to load runtime locale for "${code}":`, error);
		return false;
	}
}

if (typeof window !== 'undefined') {
	// True while refreshCurrentLanguage() is re-emitting the event, so the
	// handler below doesn't re-fetch (avoids an infinite loop).
	let refreshing = false;

	i18n.on('languageChanged', (lng) => {
		localStorage.setItem(LANGUAGE_STORAGE_KEY, lng);
		// Pull the latest runtime translations for the newly active language.
		if (!refreshing) {
			void loadRuntimeLocale(lng).then((changed) => {
				if (!changed) return;
				// addResourceBundle updates the store; emit languageChanged so
				// every useTranslation component re-renders with fresh strings.
				refreshing = true;
				i18n.emit('languageChanged', lng);
				refreshing = false;
			});
		}
	});

	// Dynamically register any additional languages added in the admin panel.
	// New languages get an empty resource bundle, so UI strings fall back to
	// Persian (fallbackLng: 'fa'). Content is fetched per-language from the API.
	fetch(`${BACKEND_API_URL}/api/v1/languages`)
		.then((res) => (res.ok ? res.json() : null))
		.then((data) => {
			const languages = data?.data;
			if (!Array.isArray(languages) || languages.length === 0) return;
			const codes = languages.map((l: { code: string }) => l.code);
			// Extend supported languages with any new codes
			const current = (i18n.options.supportedLngs as string[]) || [];
			const merged = [...new Set([...current, ...codes])];
			i18n.options.supportedLngs = merged;
			// Register empty bundles for languages that have no static resources
			for (const code of codes) {
				if (!resources[code as keyof typeof resources]) {
					i18n.addResourceBundle(code, 'translation', {}, true, true);
				}
			}
			// Prefetch runtime translations for every active language so the
			// built site shows the latest editor changes on first load/switch.
			codes.forEach((code) => void loadRuntimeLocale(code));
		})
		.catch((error) => {
			console.error('Failed to load languages:', error);
		});

	// Initial load: fetch the runtime bundle for the current language too
	// (covers the case where the languages list request failed).
	void loadRuntimeLocale(i18n.language).then((changed) => {
		if (!changed) return;
		refreshing = true;
		i18n.emit('languageChanged', i18n.language);
		refreshing = false;
	});
}

export default i18n;
