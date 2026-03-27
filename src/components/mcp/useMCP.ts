'use client';

import { useContext } from 'react';
import { MCPServerContext } from './MCPServerContext';

export function useMCP() {
  const context = useContext(MCPServerContext);
  if (!context) {
    throw new Error('useMCP must be used within a MCPServerProvider');
  }
  return context;
}
