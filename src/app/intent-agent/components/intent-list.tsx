'use client';

import { useState } from 'react';
import { predefinedIntents, type IntentDef } from '../lib/intent-registry';
import { IntentDetailDialog } from './intent-detail-dialog';

export function IntentList() {
  const [selectedIntent, setSelectedIntent] = useState<IntentDef | null>(null);

  return (
    <>
      <div className="flex flex-wrap gap-2 px-4 pb-3">
        {predefinedIntents.map((intent) => (
          <button
            key={intent.name}
            onClick={() => setSelectedIntent(intent)}
            className="px-3 py-1.5 rounded-full border bg-background text-sm hover:bg-muted transition-colors"
          >
            {intent.label}
          </button>
        ))}
      </div>
      <IntentDetailDialog
        intent={selectedIntent}
        onClose={() => setSelectedIntent(null)}
      />
    </>
  );
}
