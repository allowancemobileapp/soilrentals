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
import type { Rental, RentalInsert, RentalUpdate } from "@/lib/types";
import { suggestRentalAmount as suggestRentalAmountFlow, type SuggestRentalAmountInput, type SuggestRentalAmountOutput } from "@/ai/flows/suggest-rental-amount";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { useToast } from "@/hooks/use-toast";
import { NIGERIAN_STATES } from "@/lib/nigerian-states";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";

const formSchema = z.object({
  shop_name: z.string().min(2, { message: "Shop name must be at least 2 characters." }),
  tenant_name: z.string().min(2, { message: "Tenant name must be at least 2 characters." }),
  state: z.string().min(2, { message: "State must be selected." }),
  rent_amount: z.coerce.number().min(0, { message: "Rent amount must be a positive number." }),
  rental_type: z.enum(['monthly', 'yearly']),
  due_date: z.date(),
  property_type: z.enum(["apartment", "house", "shop", "office"]),
  bedrooms: z.coerce.number().int().min(0),
  bathrooms: z.coerce.number().int().min(0),
  square_footage: z.coerce.number().int().min(1),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
});

type RentalFormValues = z.infer<typeof formSchema>;

interface RentalFormProps {
  rental?: Rental | null;
  onSave: (data: RentalInsert | RentalUpdate) => void;
}

export default function RentalForm({ rental, onSave }: RentalFormProps) {
  const { toast } = useToast();
  const [suggestion, setSuggestion] = React.useState<SuggestRentalAmountOutput | null>(null);
  const [isSuggesting, setIsSuggesting] = React.useState(false);
  
  const form = useForm<RentalFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: rental ? {
      ...rental,
      due_date: parseISO(rental.due_date),
    } : {
      shop_name: "",
      tenant_name: "",
      state: "Lagos",
      rent_amount: 50000,
      rental_type: "monthly",
      due_date: new Date(),
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
        due_date: parseISO(rental.due_date),
      });
    } else {
      form.reset({
        shop_name: "",
        tenant_name: "",
        state: "Lagos",
        rent_amount: 50000,
        rental_type: "monthly",
        due_date: new Date(),
        property_type: "shop",
        bedrooms: 0,
        bathrooms: 1,
        square_footage: 500,
        description: ""
      });
    }
  }, [rental, form]);

  const onSubmit = (data: RentalFormValues) => {
    const dataWithIsoDate = {
      ...data,
      due_date: data.due_date.toISOString(),
    }
    onSave(dataWithIsoDate);
  };
  
  const handleSuggestRent = async () => {
    const values = form.getValues();
    const validation = formSchema.pick({ state: true, property_type: true, bedrooms: true, bathrooms: true, square_footage: true, description: true, rental_type: true }).safeParse(values);
    
    if (!validation.success) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in all property details before suggesting a rent.",
      });
      return;
    }
    
    const { property_type: propertyType, square_footage: squareFootage, rental_type: rentalType, ...rest} = validation.data;

    const suggestionInput = {
        ...rest,
        propertyType,
        squareFootage,
        rentalType,
    };

    setIsSuggesting(true);
    setSuggestion(null);
    try {
      const result = await suggestRentalAmountFlow(suggestionInput);
      setSuggestion(result);
      form.setValue('rent_amount', result.suggestedRentalAmount);
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Suggestion Failed",
        description: "Failed to get rental suggestion. Please try again.",
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
            name="property_type"
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
            name="square_footage"
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
                {suggestion.reasoning} We've updated the rent amount field with our suggestion.
              </AlertDescription>
            </Alert>
          )}
          
          <FormField
            control={form.control}
            name="rental_type"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Rental Type</FormLabel>
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
                        <RadioGroupItem value="yearly" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Yearly
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
        </div>
        
        <Button type="submit" className="w-full md:w-auto">Save Rental</Button>
      </form>
    </Form>
  );
}
