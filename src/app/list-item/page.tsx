"use client";

import { ListItemForm } from "@/components/list-item-form";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { ListPlus, ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function ListItemPage() {
  const { isVerified } = useAuth();

  if (!isVerified) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <ShieldAlert className="h-16 w-16 text-destructive mx-auto mb-6" />
        <h1 className="text-4xl font-bold">Verification Required</h1>
        <p className="text-muted-foreground mt-4 mb-8 text-lg">
          You must be a verified user to list an item. Please complete the verification process first.
        </p>
        <Button asChild size="lg">
          <Link href="/verify">Get Verified</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex flex-col items-center text-center mb-8">
        <ListPlus className="h-12 w-12 text-primary mb-4" />
        <h1 className="text-3xl font-bold">List a New Item</h1>
        <p className="text-muted-foreground mt-2">
          Found something? Lost something? Fill out the details below to create a new listing.
        </p>
      </div>
      <ListItemForm />
    </div>
  );
}
