"use client";

import * as React from "react";
import { Calendar, Home, Loader2, MapPin, PlusCircle, Search, FileDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Rental } from "@/lib/types";
import { add, parseISO } from "date-fns";
import RentalTable from "./rental-table";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import RentalForm from "./rental-form";
import { NIGERIAN_STATES } from "@/lib/nigerian-states";
import { getRentals, addRental, updateRental, deleteRental } from "@/lib/supabase/database";
import { useToast } from "@/hooks/use-toast";
import type { RentalInsert, RentalUpdate } from '@/lib/types';


export default function Dashboard() {
  const [rentals, setRentals] = React.useState<Rental[]>([]);
  const [search, setSearch] = React.useState("");
  const [stateFilter, setStateFilter] = React.useState("all");
  const [isLoading, setIsLoading] = React.useState(true);
  const [editingRental, setEditingRental] = React.useState<Rental | null>(null);
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    const fetchRentals = async () => {
      try {
        setIsLoading(true);
        const fetchedRentals = await getRentals();
        setRentals(fetchedRentals || []);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error fetching data",
          description: "Could not load rentals from the database.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchRentals();
  }, [toast]);

  const safeRentals = (rentals || []).filter(r => r && typeof r === 'object' && r.state);

  const totalRentals = safeRentals.length;
  const topState = safeRentals.length > 0
    ? Object.entries(safeRentals.reduce((acc, r) => ({ ...acc, [r.state]: (acc[r.state] || 0) + 1 }), {} as Record<string, number>))
      .sort((a, b) => b[1] - a[1])[0][0]
    : "N/A";
  const upcomingDues = safeRentals.filter(r => {
      if (!r.due_date) return false;
      const dueDate = parseISO(r.due_date);
      return dueDate > new Date() && dueDate <= add(new Date(), { days: 30 });
    }).length;

  const filteredRentals = safeRentals.filter(rental => {
    const searchLower = search.toLowerCase();
    const matchesSearch = (rental.shop_name && rental.shop_name.toLowerCase().includes(searchLower)) ||
      (rental.tenant_name && rental.tenant_name.toLowerCase().includes(searchLower));
    const matchesState = stateFilter === 'all' || rental.state === stateFilter;
    return matchesSearch && matchesState;
  });
  
  const handleAddRental = async (newRentalData: Omit<RentalInsert, 'owner_id'>) => {
    try {
      const newRental = await addRental(newRentalData);
      setRentals(prev => [newRental, ...prev]);
      setIsSheetOpen(false);
       toast({
        title: "Success",
        description: "Rental added successfully.",
      });
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Error adding rental",
        description: (error as Error).message,
      });
    }
  };

  const handleUpdateRental = async (updatedRentalData: RentalUpdate) => {
    if (!editingRental) return;
    try {
      const updatedRental = await updateRental(editingRental.id, updatedRentalData);
      setRentals(prev => prev.map(r => r.id === updatedRental.id ? updatedRental : r));
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
  
  const exportToCSV = () => {
    const headers = ["Shop Name", "Tenant", "State", "Rent (NGN)", "Frequency", "Due Date"];
    const csvContent = [
      headers.join(","),
      ...filteredRentals.map(r => [
        `"${r.shop_name}"`,
        `"${r.tenant_name}"`,
        r.state,
        r.rent_amount,
        r.frequency,
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


  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rentals</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRentals}</div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top State</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topState}</div>
            <p className="text-xs text-muted-foreground">Highest number of properties</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Dues</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{upcomingDues}</div>
            <p className="text-xs text-muted-foreground">In the next 30 days</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rental Management</CardTitle>
          <div className="flex items-center gap-2 pt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search rentals..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={stateFilter} onValueChange={setStateFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by state" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                {NIGERIAN_STATES.map(state => (
                  <SelectItem key={state} value={state}>{state}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={exportToCSV} variant="outline" className="gap-2">
              <FileDown className="h-4 w-4" />
              Export
            </Button>
            <Sheet open={isSheetOpen} onOpenChange={handleSheetOpenChange}>
              <SheetTrigger asChild>
                <Button onClick={handleAddNewClick} className="gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Add Rental
                </Button>
              </SheetTrigger>
              <SheetContent className="sm:max-w-2xl">
                <SheetHeader>
                  <SheetTitle>{editingRental ? 'Edit Rental' : 'Add New Rental'}</SheetTitle>
                </SheetHeader>
                <RentalForm 
                  rental={editingRental}
                  onSave={editingRental ? (data) => handleUpdateRental(data) : handleAddRental}
                />
              </SheetContent>
            </Sheet>
          </div>
        </CardHeader>
        <CardContent>
          <RentalTable rentals={filteredRentals} onEdit={handleEditClick} onDelete={handleDeleteRental} />
        </CardContent>
      </Card>
    </>
  );
}
