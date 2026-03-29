import React, { createContext, useContext } from 'react';

const WidgetContext = createContext({});

export function WidgetProvider({ children }: { children: React.ReactNode }) {
  return <WidgetContext.Provider value={{}}>{children}</WidgetContext.Provider>;
}

export function useWidget() {
  return useContext(WidgetContext);
}
