'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth, getRedirectPath } from '@/context/AuthContext';

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.replace(getRedirectPath(user.role));
    } else {
      router.replace('/login');
    }
  }, [user, router]);

  return null;
}
