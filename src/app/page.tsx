"use client";

import { useState } from 'react';
import { institutions, categories } from '@/lib/data';
import { InstitutionSelector } from '@/components/institution-selector';
import { ItemCard } from '@/components/item-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/context/auth-context';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from '@/components/ui/card';

export default function Home() {
  const [currentInstitution, setCurrentInstitution] = useState(institutions[0].id);
  const [showResolved, setShowResolved] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const { items, toggleItemResolved } = useAuth();

  const filteredItems = items.filter(item => 
    item.institution === currentInstitution && 
    (showResolved || !item.resolved) &&
    (selectedCategory === "all" || item.category === selectedCategory)
  );
  
  const lostItems = filteredItems.filter(item => item.status === 'lost');
  const foundItems = filteredItems.filter(item => item.status === 'found');

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">Lost & Found</h1>
        <p className="text-muted-foreground mt-2">Browse items reported at your institution.</p>
      </div>
      
      <InstitutionSelector
        selectedInstitution={currentInstitution}
        onInstitutionChange={setCurrentInstitution}
      />
      
      <Card>
        <CardContent className="pt-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="flex items-center space-x-2">
            <Checkbox id="show-resolved" checked={showResolved} onCheckedChange={(checked) => setShowResolved(!!checked)} />
            <Label htmlFor="show-resolved" className="text-sm font-medium">
              Show resolved items
            </Label>
          </div>
          <div className="w-full sm:w-auto">
             <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>


      <Tabs defaultValue="lost" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="lost">Lost Items ({lostItems.length})</TabsTrigger>
          <TabsTrigger value="found">Found Items ({foundItems.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="lost">
          {lostItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
              {lostItems.map(item => (
                <ItemCard key={item.id} item={item} onResolveToggle={toggleItemResolved} />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-12">No lost items match the current filters.</p>
          )}
        </TabsContent>
        <TabsContent value="found">
          {foundItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
              {foundItems.map(item => (
                <ItemCard key={item.id} item={item} onResolveToggle={toggleItemResolved} />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-12">No found items match the current filters.</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
