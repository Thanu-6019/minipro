import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function MedicinesScreen() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the full medicines screen
    router.replace('/medicines');
  }, [router]);
  
  return null;
}
