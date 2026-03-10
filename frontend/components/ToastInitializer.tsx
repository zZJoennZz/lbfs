'use client';

import { useEffect } from 'react';
import { useToast } from '@/context/ToastContext';
import { setToastFunction } from '@/lib/api';

export default function ToastInitializer() {
  const { showToast } = useToast();

  useEffect(() => {
    setToastFunction(showToast);
  }, [showToast]);

  return null;
}
