"use client";

import { institutions, type InstitutionID } from '@/lib/data';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Dispatch, SetStateAction } from 'react';

type InstitutionSelectorProps = {
  selectedInstitution: string;
  onInstitutionChange: Dispatch<SetStateAction<InstitutionID>>;
};

export function InstitutionSelector({ selectedInstitution, onInstitutionChange }: InstitutionSelectorProps) {
  return (
    <Tabs value={selectedInstitution} onValueChange={(id) => onInstitutionChange(id as InstitutionID)} className="w-full">
      <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
        {institutions.map(inst => (
          <TabsTrigger key={inst.id} value={inst.id}>
            {inst.id}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
