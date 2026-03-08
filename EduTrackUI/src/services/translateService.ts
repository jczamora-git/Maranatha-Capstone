/**
 * Google Translate GTX Service - FREE Translation without API Keys
 * Based on: https://github.com/ssut/py-googletrans/issues/268
 * 
 * Features:
 * - No API key required
 * - Unlimited translations (fair use)
 * - Fast and reliable
 * - Supports 100+ languages
 */

export type LanguageCode = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'ru' | 'zh' | 'ja' | 'ko' | 'ar' | 'tl';

export interface Language {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'tl', name: 'Filipino', nativeName: 'Filipino', flag: '🇵🇭' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
];

// Translation cache to avoid redundant API calls
const translationCache = new Map<string, string>();

/**
 * Generate cache key for translation
 */
function getCacheKey(text: string, from: string, to: string): string {
  return `${from}:${to}:${text}`;
}

/**
 * Translate text using Google Translate GTX API (Primary method)
 */
async function translateWithGoogleGTX(
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<string | null> {
  try {
    const encodedText = encodeURIComponent(text);
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodedText}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!response.ok) {
      console.warn(`Google GTX failed with status: ${response.status}`);
      return null;
    }

    const data = await response.json();
    
    // Parse response: [[["translated text","original text",...], ...], ...]
    if (Array.isArray(data) && data[0] && Array.isArray(data[0])) {
      const translations = data[0]
        .filter((item: any) => Array.isArray(item) && item[0])
        .map((item: any) => item[0]);
      
      return translations.join('');
    }

    return null;
  } catch (error) {
    console.error('Google GTX error:', error);
    return null;
  }
}

/**
 * Translate text using Google Chrome Extension API (Fallback method)
 */
async function translateWithGoogleChrome(
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<string | null> {
  try {
    const encodedText = encodeURIComponent(text);
    const url = `https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=${sourceLang}&tl=${targetLang}&q=${encodedText}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!response.ok) {
      console.warn(`Google Chrome API failed with status: ${response.status}`);
      return null;
    }

    const data = await response.json();
    
    // Parse response: {"sentences":[{"trans":"translated text","orig":"original",...}],...}
    if (data?.sentences && Array.isArray(data.sentences)) {
      const translations = data.sentences
        .filter((s: any) => s.trans)
        .map((s: any) => s.trans);
      
      return translations.join('');
    }

    return null;
  } catch (error) {
    console.error('Google Chrome API error:', error);
    return null;
  }
}

/**
 * Main translation function with fallback strategy
 * 
 * Strategy:
 * 1. Check cache
 * 2. Try Google GTX (primary, fastest)
 * 3. Try Google Chrome Extension (fallback)
 * 4. Return original text if all fail
 */
export async function translateText(
  text: string,
  targetLang: LanguageCode,
  sourceLang: LanguageCode = 'en'
): Promise<string> {
  // If target is same as source, return original
  if (targetLang === sourceLang) {
    return text;
  }

  // If text is empty or only whitespace, return as is
  if (!text || !text.trim()) {
    return text;
  }

  // Check cache first
  const cacheKey = getCacheKey(text, sourceLang, targetLang);
  const cached = translationCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  // Try Google GTX first (primary method)
  console.log(`🌐 Translating "${text.substring(0, 50)}..." from ${sourceLang} to ${targetLang}`);
  
  let translated = await translateWithGoogleGTX(text, sourceLang, targetLang);
  if (translated) {
    console.log(`✅ Success with Google GTX: ${translated.substring(0, 50)}...`);
    translationCache.set(cacheKey, translated);
    return translated;
  }

  // Fallback to Google Chrome Extension API
  console.log('🔄 Trying Google Chrome Extension API...');
  translated = await translateWithGoogleChrome(text, sourceLang, targetLang);
  if (translated) {
    console.log(`✅ Success with Google Chrome API: ${translated.substring(0, 50)}...`);
    translationCache.set(cacheKey, translated);
    return translated;
  }

  // If all methods fail, return original text
  console.warn('⚠️ All translation methods failed, returning original text');
  return text;
}

/**
 * Batch translate multiple texts
 * Useful for translating multiple UI elements at once
 */
export async function translateBatch(
  texts: string[],
  targetLang: LanguageCode,
  sourceLang: LanguageCode = 'en'
): Promise<string[]> {
  const promises = texts.map((text) => translateText(text, targetLang, sourceLang));
  return Promise.all(promises);
}

/**
 * Clear translation cache (useful for memory management or testing)
 */
export function clearTranslationCache(): void {
  translationCache.clear();
  console.log('🗑️ Translation cache cleared');
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { size: number; keys: string[] } {
  return {
    size: translationCache.size,
    keys: Array.from(translationCache.keys()).slice(0, 10), // First 10 keys
  };
}
