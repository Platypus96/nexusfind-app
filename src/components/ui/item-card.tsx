"use client";

import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { Item } from '@/lib/data';
import { Archive, ArchiveRestore } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';

type ItemCardProps = {
  item: Item;
  onResolveToggle: (itemId: string) => void;
};

export function ItemCard({ item, onResolveToggle }: ItemCardProps) {
  const { userId } = useAuth();
  const isOwner = item.userId === userId;

  return (
    <Card className={cn("flex flex-col transition-all hover:shadow-lg hover:shadow-primary/10", item.resolved && "opacity-60")}>
      <CardHeader>
        <div className="relative aspect-video">
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            className="rounded-t-lg object-cover"
            data-ai-hint={item.imageHint}
          />
        </div>
        <CardTitle className="pt-4">{item.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-muted-foreground text-sm">{item.description}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <Badge variant={item.status === 'lost' ? 'destructive' : 'secondary'}>
          {item.status === 'lost' ? 'Lost' : 'Found'}
        </Badge>
        {isOwner && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onResolveToggle(item.id)}
            aria-label={item.resolved ? 'Mark as unresolved' : 'Mark as resolved'}
          >
            {item.resolved ? <ArchiveRestore className="mr-2 h-4 w-4" /> : <Archive className="mr-2 h-4 w-4" />}
            {item.resolved ? 'Unarchive' : 'Resolved'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
