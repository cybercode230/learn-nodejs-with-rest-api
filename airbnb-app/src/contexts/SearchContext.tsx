import React, { createContext, useContext, useState, useCallback } from 'react';

export type SearchMode = 'AI' | 'NORMAL' | 'MAP';

interface SearchContextType {
  mode: SearchMode;
  setMode: (mode: SearchMode) => void;
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
  toggleExpanded: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<SearchMode>('NORMAL');
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  return (
    <SearchContext.Provider value={{
      mode,
      setMode,
      isExpanded,
      setIsExpanded,
      toggleExpanded
    }}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearchState = () => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearchState must be used within a SearchProvider');
  }
  return context;
};
