/**
 * Languages Constant
 * A curated list of 60+ languages across Africa, Asia, Americas, and Europe.
 */

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  region: 'Africa' | 'Asia' | 'Americas' | 'Europe' | 'Oceania';
}

export const LANGUAGES: Language[] = [
  // AFRICA
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', region: 'Africa' },
  { code: 'rw', name: 'Kinyarwanda', nativeName: 'Ikinyarwanda', region: 'Africa' },
  { code: 'yo', name: 'Yoruba', nativeName: 'Èdè Yorùbá', region: 'Africa' },
  { code: 'zu', name: 'Zulu', nativeName: 'isiZulu', region: 'Africa' },
  { code: 'am', name: 'Amharic', nativeName: 'አማርኛ', region: 'Africa' },
  { code: 'om', name: 'Oromo', nativeName: 'Afaan Oromoo', region: 'Africa' },
  { code: 'ig', name: 'Igbo', nativeName: 'Asụsụ Igbo', region: 'Africa' },
  { code: 'sn', name: 'Shona', nativeName: 'chiShona', region: 'Africa' },
  { code: 'ha', name: 'Hausa', nativeName: 'Harshen Hausa', region: 'Africa' },
  { code: 'ak', name: 'Akan', nativeName: 'Akan', region: 'Africa' },
  { code: 'lg', name: 'Luganda', nativeName: 'Oluganda', region: 'Africa' },
  { code: 'st', name: 'Sesotho', nativeName: 'Sesotho', region: 'Africa' },

  // ASIA
  { code: 'zh', name: 'Chinese', nativeName: '中文', region: 'Asia' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', region: 'Asia' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', region: 'Asia' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', region: 'Asia' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', region: 'Asia' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', region: 'Asia' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', region: 'Asia' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', region: 'Asia' },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', region: 'Asia' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', region: 'Asia' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', region: 'Asia' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', region: 'Asia' },
  { code: 'fa', name: 'Persian', nativeName: 'فارسی', region: 'Asia' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', region: 'Asia' },

  // AMERICAS
  { code: 'en-US', name: 'English (US)', nativeName: 'English (US)', region: 'Americas' },
  { code: 'es-MX', name: 'Spanish (Mexico)', nativeName: 'Español (México)', region: 'Americas' },
  { code: 'pt-BR', name: 'Portuguese (Brazil)', nativeName: 'Português (Brasil)', region: 'Americas' },
  { code: 'qu', name: 'Quechua', nativeName: 'Runa Simi', region: 'Americas' },
  { code: 'gn', name: 'Guarani', nativeName: 'Avañe\'ẽ', region: 'Americas' },
  { code: 'ay', name: 'Aymara', nativeName: 'Aymar aru', region: 'Americas' },
  { code: 'fr-CA', name: 'French (Canada)', nativeName: 'Français (Canada)', region: 'Americas' },

  // EUROPE
  { code: 'en-GB', name: 'English (UK)', nativeName: 'English (UK)', region: 'Europe' },
  { code: 'es-ES', name: 'Spanish (Spain)', nativeName: 'Español (España)', region: 'Europe' },
  { code: 'fr-FR', name: 'French (France)', nativeName: 'Français (France)', region: 'Europe' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', region: 'Europe' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', region: 'Europe' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', region: 'Europe' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', region: 'Europe' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', region: 'Europe' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', region: 'Europe' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk', region: 'Europe' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk', region: 'Europe' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi', region: 'Europe' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', region: 'Europe' },
  { code: 'pt-PT', name: 'Portuguese (Portugal)', nativeName: 'Português (Portugal)', region: 'Europe' },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština', region: 'Europe' },
  { code: 'hu', name: 'Hungarian', nativeName: 'Magyar', region: 'Europe' },

  // OCEANIA
  { code: 'en-AU', name: 'English (Australia)', nativeName: 'English (Australia)', region: 'Oceania' },
  { code: 'mi', name: 'Maori', nativeName: 'Te Reo Māori', region: 'Oceania' },
  { code: 'fj', name: 'Fijian', nativeName: 'Na Vosa Vakaviti', region: 'Oceania' },
];
