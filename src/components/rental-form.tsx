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
import { format, parseISO } from "date-fns";
import type { Rental } from "@/lib/types";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { useToast } from "@/hooks/use-toast";
import { NIGERIAN_STATES } from "@/lib/nigerian-states";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";

// This schema now reflects the form's UI state, not just the DB schema
const formSchema = z.object({
  shop_name: z.string().min(2, { message: "Shop name must be at least 2 characters." }),
  tenant_name: z.string().min(2, { message: "Tenant name must be at least 2 characters." }),
  state: z.string().min(1, { message: "State must be selected." }),
  city: z.string().optional(),
  address: z.string().optional(),
  rent_amount: z.coerce.number().min(0, { message: "Rent amount must be a positive number." }),
  due_date: z.date(),
  frequency: z.enum(['monthly', 'quarterly', 'yearly', 'custom']),
  status: z.enum(['active', 'terminated']),
  notes: z.string().optional(),
  // These fields are for the form UI but won't be directly sent to the 'rentals' table insert.
  property_type: z.enum(["apartment", "house", "shop", "office"]),
  bedrooms: z.coerce.number().int().min(0),
  bathrooms: z.coerce.number().int().min(0),
  square_footage: z.coerce.number().int().min(1),
  description: z.string().optional(),
});

type RentalFormValues = z.infer<typeof formSchema>;

interface RentalFormProps {
  rental?: Rental | null;
  onSave: (data: any) => void;
}

export default function RentalForm({ rental, onSave }: RentalFormProps) {
  const { toast } = useToast();
  const [isSuggesting, setIsSuggesting] = React.useState(false);
  
  const form = useForm<RentalFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: rental ? {
      ...rental,
      due_date: rental.due_date ? parseISO(rental.due_date) : new Date(),
    } : {
      shop_name: "",
      tenant_name: "",
      state: "Lagos",
      city: "",
      address: "",
      rent_amount: 50000,
      due_date: new Date(),
      frequency: 'monthly',
      status: 'active',
      notes: "",
      property_type: "shop",
      bedrooms: 0,
      bathrooms: 1,
      square_footage: 500,
      description: ""
    },
  });
  
  React.useEffect(() => {
    if (rental) {
      form.reset({
        ...rental,
        due_date: rental.due_date ? parseISO(rental.due_date) : new Date(),
      });
    } else {
      form.reset({
        shop_name: "",
        tenant_name: "",
        state: "Lagos",
        city: "",
        address: "",
        rent_amount: 50000,
        due_date: new Date(),
        frequency: 'monthly',
        status: 'active',
        notes: "",
        property_type: "shop",
        bedrooms: 0,
        bathrooms: 1,
        square_footage: 500,
        description: ""
      });
    }
  }, [rental, form]);

  const onSubmit = (data: RentalFormValues) => {
    // Prepare the data strictly according to the database schema for insertion
    const dataForDb = {
        shop_name: data.shop_name,
        tenant_name: data.tenant_name,
        state: data.state,
        city: data.city,
        address: data.address,
        rent_amount: data.rent_amount,
        due_date: data.due_date.toISOString(),
        frequency: data.frequency,
        status: data.status,
        notes: data.notes
    };
    onSave(dataForDb);
  };
  
  const handleSuggestRent = async () => {
    toast({
      variant: "destructive",
      title: "Feature Unavailable",
      description: "The AI suggestion feature is temporarily disabled.",
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4 pr-2 max-h-[85vh] overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="shop_name"
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
            name="tenant_name"
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
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Ikeja" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Textarea placeholder="e.g., 123 Allen Avenue" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
        />
        
        <div className="space-y-4 rounded-lg border p-4">
           <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Rental Details</h3>
             <Button type="button" variant="outline" size="sm" onClick={handleSuggestRent} disabled={true}>
              {isSuggesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
              Suggest Rent (Disabled)
            </Button>
          </div>
          
          <FormField
            control={form.control}
            name="frequency"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Payment Frequency</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-row space-x-4"
                  >
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="monthly" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Monthly
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="quarterly" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Quarterly
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="yearly" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Yearly
                      </FormLabel>
                    </FormItem>
                     <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="custom" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Custom
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <FormField
              control={form.control}
              name="rent_amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rent Amount (NGN)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 250000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="due_date"
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
           <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea placeholder="Any additional notes about this rental..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <Button type="submit" className="w-full md:w-auto">Save Rental</Button>
      </form>
    </Form>
  );
}
