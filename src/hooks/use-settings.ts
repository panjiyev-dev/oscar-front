// src/hooks/use-settings.ts

import { useQuery } from '@tanstack/react-query';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';

export const fetchUsdRate = async (): Promise<number> => {
  const docRef = doc(db, 'settings', 'usdRate');
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data()?.rate || 12600;
  }
  return 12600;  // Default
};

export const useUsdRateQuery = () => {
  return useQuery({
    queryKey: ['usdRate'],
    queryFn: fetchUsdRate,
  });
};