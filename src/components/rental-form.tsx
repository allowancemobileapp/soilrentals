"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import type { Rental } from "@/lib/types";
import { NIGERIAN_STATES } from "@/lib/nigerian-states";

const formSchema = z.object({
  shop_name: z.string().min(2, { message: "Shop name must be at least 2 characters." }),
  tenant_name: z.string().optional(),
  state: z.string().optional(),
  rent_amount: z.coerce.number().min(0).optional(),
  due_date: z.date().optional(),
});

type RentalFormValues = z.infer<typeof formSchema>;

interface RentalFormProps {
  rental?: Rental | null;
  onSave: (data: any) => void;
}

export default function RentalForm({ rental, onSave }: RentalFormProps) {
  const form = useForm<RentalFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: rental ? {
      ...rental,
      due_date: rental.due_date ? parseISO(rental.due_date) : undefined,
    } : {
      shop_name: "",
      tenant_name: "",
      state: "Lagos",
      rent_amount: 50000,
      due_date: new Date(),
    },
  });
  
  React.useEffect(() => {
    if (rental) {
      form.reset({
        ...rental,
        due_date: rental.due_date ? parseISO(rental.due_date) : undefined,
      });
    } else {
      form.reset({
        shop_name: "",
        tenant_name: "",
        state: "Lagos",
        rent_amount: 50000,
        due_date: new Date(),
      });
    }
  }, [rental, form]);

  const onSubmit = (data: RentalFormValues) => {
    const dataForDb = {
        ...data,
        due_date: data.due_date ? data.due_date.toISOString().split('T')[0] : null,
    };
    onSave(dataForDb);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4 pr-2 max-h-[85vh] overflow-y-auto">
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
        
        <Button type="submit" className="w-full md:w-auto">Save Rental</Button>
      </form>
    </Form>
  );
}
