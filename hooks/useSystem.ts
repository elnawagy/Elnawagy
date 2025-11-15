import { useContext } from 'react';
import { SystemContext } from '../context/SystemContext';

export const useSystem = () => {
  const context = useContext(SystemContext);
  if (context === undefined) {
    throw new Error('useSystem must be used within a SystemProvider');
  }
  return context;
};
