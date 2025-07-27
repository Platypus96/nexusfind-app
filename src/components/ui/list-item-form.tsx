// src/components/list-item-form.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";

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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getListingOptimizationAction } from "@/app/actions";
import { institutions, categories } from "@/lib/data";
import { Lightbulb, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";

const formSchema = z.object({
  name: z.string().min(3, { message: "Item name must be at least 3 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  status: z.enum(["lost", "found"], { required_error: "You need to select a status." }),
  institution: z.enum(["IIITA", "IIITH", "IIITD", "IIITB"], { required_error: "Please select an institution." }),
  category: z.string().min(1, { message: "Please select a category." }),
  image: z.custom<FileList>().refine(files => files?.length === 1, "Image is required."),
});

export function ListItemForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const { addItem, verifiedInstitution } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "lost",
      category: "",
      institution: verifiedInstitution || undefined,
    },
  });

  const handleOptimize = async () => {
    const description = form.getValues("description");
    if (description.length < 10) {
      form.setError("description", { message: "Please provide a longer description to optimize." });
      return;
    }

    setIsOptimizing(true);
    setOptimizationResult(null);
    try {
      const result = await getListingOptimizationAction({ itemDescription: description });
      setOptimizationResult(result.suggestions);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Optimization failed",
        description: "Could not get suggestions from AI. Please try again.",
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);

    let imageUrl = 'https://placehold.co/600x400.png';
    if(values.image && values.image.length > 0) {
      try {
        imageUrl = await fileToDataUri(values.image[0]);
      } catch (error) {
        console.error("Error converting file to data URI", error);
        toast({
          variant: "destructive",
          title: "Image Upload Failed",
          description: "Could not process the image file. Please try another one.",
        });
        setIsSubmitting(false);
        return;
      }
    }
    
    await addItem({
      name: values.name,
      description: values.description,
      imageUrl,
      imageHint: values.name.toLowerCase().split(' ').slice(0,2).join(' '),
      status: values.status,
      institution: values.institution,
      category: values.category,
    });

    toast({
      title: "Item Listed Successfully!",
      description: `Your item "${values.name}" has been added to the board.`,
    });
    form.reset();
    setOptimizationResult(null);
    setIsSubmitting(false);
    router.push('/');
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Item Details</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Is the item...</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex items-center space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="lost" />
                        </FormControl>
                        <FormLabel className="font-normal">Lost</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="found" />
                        </FormControl>
                        <FormLabel className="font-normal">Found</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Blue Water Bottle" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center">
                    <FormLabel>Description</FormLabel>
                    <Button type="button" variant="link" size="sm" onClick={handleOptimize} disabled={isOptimizing} className="text-primary gap-1 px-0 h-auto">
                      {isOptimizing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Lightbulb className="h-4 w-4" />
                      )}
                      Optimize with AI
                    </Button>
                  </div>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the item, where you lost/found it, and any identifying marks."
                      className="resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {optimizationResult && (
              <Alert>
                <Lightbulb className="h-4 w-4" />
                <AlertTitle>AI Suggestions</AlertTitle>
                <AlertDescription>
                  <p className="whitespace-pre-wrap">{optimizationResult}</p>
                </AlertDescription>
              </Alert>
            )}

             <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                       {categories.map(cat => (
                         <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>A category to help classify the item.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        field.onChange(e.target.files);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Upload an image of the item.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />


            <FormField
              control={form.control}
              name="institution"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Institution</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an institution" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                       {institutions.map(inst => (
                         <SelectItem key={inst.id} value={inst.id}>{inst.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>You can only list items for your verified institution.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <CardFooter className="p-0 pt-4">
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                List Item
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
// src/components/list-item-form.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";

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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getListingOptimizationAction } from "@/app/actions";
import { institutions, categories } from "@/lib/data";
import { Lightbulb, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";

const formSchema = z.object({
  name: z.string().min(3, { message: "Item name must be at least 3 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  status: z.enum(["lost", "found"], { required_error: "You need to select a status." }),
  institution: z.enum(["IIITA", "IIITH", "IIITD", "IIITB"], { required_error: "Please select an institution." }),
  category: z.string().min(1, { message: "Please select a category." }),
  image: z.custom<FileList>().refine(files => files?.length === 1, "Image is required."),
});

export function ListItemForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const { addItem, verifiedInstitution } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "lost",
      category: "",
      institution: verifiedInstitution || undefined,
    },
  });

  const handleOptimize = async () => {
    const description = form.getValues("description");
    if (description.length < 10) {
      form.setError("description", { message: "Please provide a longer description to optimize." });
      return;
    }

    setIsOptimizing(true);
    setOptimizationResult(null);
    try {
      const result = await getListingOptimizationAction({ itemDescription: description });
      setOptimizationResult(result.suggestions);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Optimization failed",
        description: "Could not get suggestions from AI. Please try again.",
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);

    let imageUrl = 'https://placehold.co/600x400.png';
    if(values.image && values.image.length > 0) {
      try {
        imageUrl = await fileToDataUri(values.image[0]);
      } catch (error) {
        console.error("Error converting file to data URI", error);
        toast({
          variant: "destructive",
          title: "Image Upload Failed",
          description: "Could not process the image file. Please try another one.",
        });
        setIsSubmitting(false);
        return;
      }
    }
    
    await addItem({
      name: values.name,
      description: values.description,
      imageUrl,
      imageHint: values.name.toLowerCase().split(' ').slice(0,2).join(' '),
      status: values.status,
      institution: values.institution,
      category: values.category,
    });

    toast({
      title: "Item Listed Successfully!",
      description: `Your item "${values.name}" has been added to the board.`,
    });
    form.reset();
    setOptimizationResult(null);
    setIsSubmitting(false);
    router.push('/');
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Item Details</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Is the item...</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex items-center space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="lost" />
                        </FormControl>
                        <FormLabel className="font-normal">Lost</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="found" />
                        </FormControl>
                        <FormLabel className="font-normal">Found</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Blue Water Bottle" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center">
                    <FormLabel>Description</FormLabel>
                    <Button type="button" variant="link" size="sm" onClick={handleOptimize} disabled={isOptimizing} className="text-primary gap-1 px-0 h-auto">
                      {isOptimizing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Lightbulb className="h-4 w-4" />
                      )}
                      Optimize with AI
                    </Button>
                  </div>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the item, where you lost/found it, and any identifying marks."
                      className="resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {optimizationResult && (
              <Alert>
                <Lightbulb className="h-4 w-4" />
                <AlertTitle>AI Suggestions</AlertTitle>
                <AlertDescription>
                  <p className="whitespace-pre-wrap">{optimizationResult}</p>
                </AlertDescription>
              </Alert>
            )}

             <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                       {categories.map(cat => (
                         <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>A category to help classify the item.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        field.onChange(e.target.files);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Upload an image of the item.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />


            <FormField
              control={form.control}
              name="institution"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Institution</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an institution" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                       {institutions.map(inst => (
                         <SelectItem key={inst.id} value={inst.id}>{inst.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>You can only list items for your verified institution.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <CardFooter className="p-0 pt-4">
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                List Item
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
