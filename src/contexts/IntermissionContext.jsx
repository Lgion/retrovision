import { createContext, useContext } from 'react';

export const IntermissionContext = createContext(null);

export function useIntermissionContext() {
  return useContext(IntermissionContext);
}
