import he from './he.js';
import en from './en.js';

const dicts = { he, en };
let currentLang = localStorage.getItem('family-chores-lang') || 'he';

export function t(key, params = {}) {
  let s = (dicts[currentLang] || dicts.he)[key] || dicts.he[key] || key;
  Object.entries(params).forEach(([k, v]) => {
    s = s.replace(`{${k}}`, v);
  });
  return s;
}

export function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('family-chores-lang', lang);
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr';
}

export function getLang() {
  return currentLang;
}

export function isRTL() {
  return currentLang === 'he';
}

// Initialize direction on load
document.documentElement.lang = currentLang;
document.documentElement.dir = currentLang === 'he' ? 'rtl' : 'ltr';
