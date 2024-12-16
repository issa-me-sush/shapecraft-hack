import { useUser } from "@account-kit/react";
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import dynamic from 'next/dynamic';

// Import map component dynamically to avoid SSR issues
const WorldMap = dynamic(() => import('../components/WorldMap'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-screen flex items-center justify-center bg-black">
      <div className="text-2xl font-bold text-white">
        Loading Map...
      </div>
    </div>
  )
});

export default function WorldPage() {
  const user = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/?open=true');
    }
  }, [user, router]);

  return (
    <div className="h-screen w-full bg-black">
      <WorldMap />
    </div>
  );
}