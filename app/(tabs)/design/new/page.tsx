'use client';

import { useAppStore } from '../../../lib/store';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DesignFormEmbedded } from '../../../components/DesignFormEmbedded';

export default function NewDesignPage() {
  const router = useRouter();
  const { drivers } = useAppStore();

  if (drivers.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-red-500 mb-4">No drivers available. Please create a driver first.</p>
        <Link href="/driver" className="text-blue-600 underline">
          Go to Drivers
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/design" className="text-blue-600 underline">
          ← Back to Designs
        </Link>
      </div>

      <div className="max-w-md">
        <DesignFormEmbedded
          onSave={() => {
            router.push('/design');
          }}
        />
      </div>
    </div>
  );
}
