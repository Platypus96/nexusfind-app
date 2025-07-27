// src/components/verification-form.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getVerificationSafeguardsAction } from "@/app/actions";
import { institutions, type InstitutionID } from "@/lib/data";
import { Loader2, ShieldAlert, ShieldCheck } from "lucide-react";
import type { VerificationSafeguardsOutput } from "@/ai/flows/verification-safeguards";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";

const formSchema = z.object({
  institution: z.enum(["IIITA", "IIITH", "IIITD", "IIITB"], {
    required_error: "Please select an institution.",
  }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  location: z.string().min(2, {
    message: "Location must be at least 2 characters.",
  }),
});

export function VerificationForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<VerificationSafeguardsOutput | null>(null);
  const { toast } = useToast();
  const { setVerified } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      location: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const safeguards = await getVerificationSafeguardsAction(values);
      setResult(safeguards);
      setVerified(true, values.institution as InstitutionID);
      toast({
        title: "Verification Submitted",
        description: "You are now a verified user. Review the security recommendations below.",
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "An error occurred",
        description: "Failed to get verification safeguards. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verification Details</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="institution"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Institution</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your institution" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {institutions.map(inst => (
                         <SelectItem key={inst.id} value={inst.id}>{inst.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Institution Email</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., user@iiita.ac.in" {...field} />
                  </FormControl>
                  <FormDescription>
                    Use your official institution email address.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Location</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Allahabad, India" {...field} />
                  </FormControl>
                  <FormDescription>
                    Your city and country for verification purposes.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verify
            </Button>
          </form>
        </Form>
        {result && (
          <div className="mt-8 space-y-6">
            <Alert>
              <ShieldCheck className="h-4 w-4" />
              <AlertTitle>Suggested Safeguards</AlertTitle>
              <AlertDescription>
                <p className="whitespace-pre-wrap">{result.safeguards}</p>
              </AlertDescription>
            </Alert>
            <Alert variant="destructive">
              <ShieldAlert className="h-4 w-4" />
              <AlertTitle>User Warnings</AlertTitle>
              <AlertDescription>
                <p className="whitespace-pre-wrap">{result.warnings}</p>
              </AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
