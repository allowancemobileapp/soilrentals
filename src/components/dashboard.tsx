
"use client";

import * as React from "react";
import { Calendar, Home, Loader2, MapPin, PlusCircle, Search, FileDown, FilterX } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Rental } from "@/lib/types";
import { add, parseISO, isPast, compareAsc } from "date-fns";
import RentalTable from "./rental-table";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import RentalForm from "./rental-form";
import { NIGERIAN_STATES } from "@/lib/nigerian-states";
import { getRentalsForUser, addRental, updateRental, deleteRental } from "@/lib/supabase/database";
import { useToast } from "@/hooks/use-toast";
import type { RentalInsert, RentalUpdate } from '@/lib/types';
import { useAuth } from "@/lib/firebase/auth-context";
import { useRouter } from "next/navigation";


export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [rentals, setRentals] = React.useState<Rental[]>([]);
  const [search, setSearch] = React.useState("");
  const [stateFilter, setStateFilter] = React.useState("all");
  const [quickFilter, setQuickFilter] = React.useState<"all" | "dues">("all");
  const [isLoading, setIsLoading] = React.useState(true);
  const [editingRental, setEditingRental] = React.useState<Rental | null>(null);
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const fetchedRentals = await getRentalsForUser(user.uid)
        
        // Sort rentals by due date (soonest first)
        const sortedRentals = (fetchedRentals || []).sort((a, b) => {
          if (!a.due_date) return 1; // a is null, goes to end
          if (!b.due_date) return -1; // b is null, goes to end
          return compareAsc(parseISO(a.due_date), parseISO(b.due_date));
        });

        setRentals(sortedRentals);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error fetching data",
          description: (error as Error).message || "Could not load data from the database.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user, authLoading, router, toast]);

  const safeRentals = (rentals || []).filter(r => r);

  const totalRentals = safeRentals.length;
  
  const isUpcomingDue = (dueDateStr: string | null) => {
    if (!dueDateStr) return false;
    try {
      const dueDate = parseISO(dueDateStr);
      return dueDate > new Date() && dueDate <= add(new Date(), { days: 30 });
    } catch (e) {
      return false;
    }
  };

  const upcomingDuesCount = safeRentals.filter(r => isUpcomingDue(r.due_date)).length;

  const filteredRentals = safeRentals.filter(rental => {
    const searchLower = search.toLowerCase();
    const matchesSearch = (rental.shop_name && rental.shop_name.toLowerCase().includes(searchLower)) ||
      (rental.tenant_name && rental.tenant_name.toLowerCase().includes(searchLower));
    
    const matchesState = stateFilter === 'all' || rental.state === stateFilter;
    
    const matchesQuickFilter = quickFilter === 'all' || 
      (quickFilter === 'dues' && isUpcomingDue(rental.due_date));

    return matchesSearch && matchesState && matchesQuickFilter;
  });
  
  const handleAddRental = async (newRentalData: Omit<RentalInsert, 'user_id'>) => {
    if (!user) return;
    try {
      const newRental = await addRental(user.uid, newRentalData);
      setRentals(prev => {
        const updatedRentals = [newRental, ...prev];
        return updatedRentals.sort((a, b) => {
            if (!a.due_date) return 1;
            if (!b.due_date) return -1;
            return compareAsc(parseISO(a.due_date), parseISO(b.due_date));
        });
      });
      setIsSheetOpen(false);
       toast({
        title: "Success",
        description: "Rental added successfully.",
      });
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Error Adding Rental",
        description: (error as Error).message || "An unknown error occurred.",
      });
    }
  };

  const handleUpdateRental = async (updatedRentalData: RentalUpdate) => {
    if (!editingRental || !user) return;
    try {
      const updatedRental = await updateRental(editingRental.id, updatedRentalData);
      setRentals(prev => {
        const updatedRentals = prev.map(r => r.id === updatedRental.id ? updatedRental : r);
        return updatedRentals.sort((a, b) => {
            if (!a.due_date) return 1;
            if (!b.due_date) return -1;
            return compareAsc(parseISO(a.due_date), parseISO(b.due_date));
        });
      });
      setEditingRental(null);
      setIsSheetOpen(false);
       toast({
        title: "Success",
        description: "Rental updated successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error updating rental",
        description: (error as Error).message,
      });
    }
  };
  
  const handleDeleteRental = async (id: string) => {
    if (!user) return;
    try {
      await deleteRental(id);
      setRentals(prev => prev.filter(r => r.id !== id));
      toast({
        title: "Success",
        description: "Rental deleted successfully.",
      });
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Error deleting rental",
        description: (error as Error).message,
      });
    }
  };

  const handleEditClick = (rental: Rental) => {
    setEditingRental(rental);
    setIsSheetOpen(true);
  };

  const handleAddNewClick = () => {
    setEditingRental(null);
    setIsSheetOpen(true);
  }

  const handleSheetOpenChange = (open: boolean) => {
    setIsSheetOpen(open);
    if (!open) {
      setEditingRental(null);
    }
  };

  const handleQuickFilter = (filter: "all" | "dues") => {
    setStateFilter("all");
    setQuickFilter(filter);
  };

  const handleStateFilterClick = (state: string) => {
    setQuickFilter("all");
    setStateFilter(state);
  };
  
  const exportToCSV = () => {
    const headers = ["Shop Name", "Tenant", "State", "Rent (NGN)", "Due Date"];
    const csvContent = [
      headers.join(","),
      ...filteredRentals.map(r => [
        `"${r.shop_name}"`,
        `"${r.tenant_name || ''}"`,
        r.state || '',
        r.rent_amount || '',
        r.due_date ? new Date(r.due_date).toLocaleDateString() : 'N/A',
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "rentals.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  if (isLoading || authLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-2">
        <Card onClick={() => handleQuickFilter("all")} className="cursor-pointer hover:bg-accent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rentals</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRentals}</div>
          </CardContent>
        </Card>
        <Card onClick={() => handleQuickFilter("dues")} className="cursor-pointer hover:bg-accent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Dues</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{upcomingDuesCount}</div>
            <p className="text-xs text-muted-foreground">In the next 30 days</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rental Management</CardTitle>
          <div className="flex flex-col sm:flex-row items-center gap-2 pt-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search rentals..." className="pl-10 w-full" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Select value={stateFilter} onValueChange={(value) => { setStateFilter(value); setQuickFilter("all"); }}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by state" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All States</SelectItem>
                  {NIGERIAN_STATES.map(state => (
                    <SelectItem key={state} value={state}>{state}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(stateFilter !== 'all' || quickFilter !== 'all') && (
                <Button variant="ghost" size="icon" onClick={() => { setStateFilter('all'); setQuickFilter('all'); }}>
                  <FilterX className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button onClick={exportToCSV} variant="outline" className="w-full sm:w-auto">
                <FileDown className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Sheet open={isSheetOpen} onOpenChange={handleSheetOpenChange}>
                <SheetTrigger asChild>
                  <Button onClick={handleAddNewClick} className="w-full sm:w-auto">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Rental
                  </Button>
                </SheetTrigger>
                <SheetContent className="sm:max-w-lg">
                  <SheetHeader>
                    <SheetTitle>{editingRental ? 'Edit Rental' : 'Add New Rental'}</SheetTitle>
                  </SheetHeader>
                  <RentalForm 
                    rental={editingRental}
                    onSave={editingRental ? handleUpdateRental : handleAddRental}
                  />
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <RentalTable rentals={filteredRentals} onEdit={handleEditClick} onDelete={handleDeleteRental} />
        </CardContent>
      </Card>
    </>
  );
}
    