import React, { createContext, useState, useEffect, useContext } from 'react';
import { getLanguageCode, setLanguageCode, t } from './translations';

export const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [uiLanguage, setUiLanguage] = useState(() => getLanguageCode());

  useEffect(() => {
    setLanguageCode(uiLanguage);
  }, [uiLanguage]);

  const translate = (key, paramsOrFallback = {}, fallback = '') => {
    const params =
      paramsOrFallback && typeof paramsOrFallback === 'object'
        ? paramsOrFallback
        : {};
    const fallbackText =
      typeof paramsOrFallback === 'string'
        ? paramsOrFallback
        : fallback;
    const value = t(key, uiLanguage, params);
    return value === key ? fallbackText || key : value;
  };

  const value = {
    uiLanguage,
    setUiLanguage,
    t: translate,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }

  return context;
};
