"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import * as React from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2, Sparkles, Wand2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { PropertyType, Rental } from "@/lib/types";
import { suggestRentalAmount } from "@/app/actions";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import type { SuggestRentalAmountOutput } from "@/ai/flows/suggest-rental-amount";
import { useToast } from "@/hooks/use-toast";
import { NIGERIAN_STATES } from "@/lib/nigerian-states";

const formSchema = z.object({
  shopName: z.string().min(2, { message: "Shop name must be at least 2 characters." }),
  tenantName: z.string().min(2, { message: "Tenant name must be at least 2 characters." }),
  state: z.string().min(2, { message: "State must be selected." }),
  monthlyRent: z.coerce.number().min(0, { message: "Monthly rent must be a positive number." }),
  dueDate: z.date(),
  propertyType: z.enum(["apartment", "house", "shop", "office"]),
  bedrooms: z.coerce.number().int().min(0),
  bathrooms: z.coerce.number().int().min(0),
  squareFootage: z.coerce.number().int().min(1),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
});

type RentalFormValues = z.infer<typeof formSchema>;

interface RentalFormProps {
  rental?: Rental | null;
  onSave: (data: Rental) => void;
}

export default function RentalForm({ rental, onSave }: RentalFormProps) {
  const { toast } = useToast();
  const [suggestion, setSuggestion] = React.useState<SuggestRentalAmountOutput | null>(null);
  const [isSuggesting, setIsSuggesting] = React.useState(false);
  
  const form = useForm<RentalFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: rental ? {
      ...rental,
    } : {
      shopName: "",
      tenantName: "",
      state: "Lagos",
      monthlyRent: 50000,
      dueDate: new Date(),
      propertyType: "shop",
      bedrooms: 0,
      bathrooms: 1,
      squareFootage: 500,
      description: ""
    },
  });

  const onSubmit = (data: RentalFormValues) => {
    onSave({ ...data, id: rental?.id || "" });
  };
  
  const handleSuggestRent = async () => {
    const values = form.getValues();
    const validation = formSchema.pick({ state: true, propertyType: true, bedrooms: true, bathrooms: true, squareFootage: true, description: true }).safeParse(values);
    
    if (!validation.success) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in all property details before suggesting a rent.",
      });
      return;
    }

    setIsSuggesting(true);
    setSuggestion(null);
    try {
      const result = await suggestRentalAmount(validation.data);
      setSuggestion(result);
      form.setValue('monthlyRent', result.suggestedRentalAmount);
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Suggestion Failed",
        description: (error as Error).message,
      });
    } finally {
      setIsSuggesting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4 pr-2 max-h-[85vh] overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="shopName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Shop Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., The Daily Grind" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="tenantName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tenant Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Jane Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a state" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {NIGERIAN_STATES.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="propertyType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Property Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select property type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="shop">Shop</SelectItem>
                    <SelectItem value="office">Office</SelectItem>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="house">House</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <FormField
            control={form.control}
            name="bedrooms"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bedrooms</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="bathrooms"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bathrooms</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="squareFootage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Square Footage</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Describe the property, its features, and location." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="space-y-4 rounded-lg border p-4">
           <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Rental Details</h3>
            <Button type="button" variant="outline" size="sm" onClick={handleSuggestRent} disabled={isSuggesting}>
              {isSuggesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
              Suggest Rent
            </Button>
          </div>
          {suggestion && (
            <Alert>
              <Sparkles className="h-4 w-4" />
              <AlertTitle>AI Suggestion</AlertTitle>
              <AlertDescription>
                {suggestion.reasoning} We've updated the monthly rent field with our suggestion.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <FormField
              control={form.control}
              name="monthlyRent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monthly Rent (NGN)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 250000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Next Due Date</FormLabel>
                   <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <Button type="submit" className="w-full md:w-auto">Save Rental</Button>
      </form>
    </Form>
  );
}
