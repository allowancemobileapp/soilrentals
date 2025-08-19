"use client";

import * as React from "react";
import { Calendar, Home, Loader2, MapPin, TrendingUp, Download, PlusCircle, Search, FileDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Rental } from "@/lib/types";
import { add, sub } from "date-fns";
import RentalTable from "./rental-table";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import RentalForm from "./rental-form";
import { NIGERIAN_STATES } from "@/lib/nigerian-states";

// Mock Data
const mockRentals: Rental[] = [
  { id: '1', shopName: 'Lagos Island Ventures', tenantName: 'Chioma Okoro', state: 'Lagos', monthlyRent: 350000, dueDate: new Date(), propertyType: 'shop', bedrooms: 0, bathrooms: 1, squareFootage: 800, description: 'Prime corner location in a busy shopping district.' },
  { id: '2', shopName: 'Abuja Book Haven', tenantName: 'Musa Bello', state: 'FCT', monthlyRent: 600000, dueDate: add(new Date(), { days: 5 }), propertyType: 'shop', bedrooms: 0, bathrooms: 1, squareFootage: 1200, description: 'Cozy bookstore with high foot traffic.' },
  { id: '3', shopName: 'Kano Craft Market', tenantName: 'Amina Sani', state: 'Kano', monthlyRent: 150000, dueDate: add(new Date(), { days: 12 }), propertyType: 'shop', bedrooms: 0, bathrooms: 1, squareFootage: 650, description: 'Small stall in a popular craft market.' },
  { id: '4', shopName: 'Port Harcourt Styles', tenantName: 'Emeka Nwosu', state: 'Rivers', monthlyRent: 250000, dueDate: sub(new Date(), { days: 2 }), propertyType: 'shop', bedrooms: 0, bathrooms: 1, squareFootage: 1000, description: 'Modern boutique in a trendy neighborhood.' },
  { id: '5', shopName: 'Ibadan Tech Solutions', tenantName: 'Yemi Adewale', state: 'Oyo', monthlyRent: 450000, dueDate: add(new Date(), { days: 20 }), propertyType: 'office', bedrooms: 3, bathrooms: 2, squareFootage: 1500, description: 'Spacious office with multiple rooms.' },
];

export default function Dashboard() {
  const [rentals, setRentals] = React.useState<Rental[]>(mockRentals);
  const [search, setSearch] = React.useState("");
  const [stateFilter, setStateFilter] = React.useState("all");
  const [isClient, setIsClient] = React.useState(false);
  const [editingRental, setEditingRental] = React.useState<Rental | null>(null);
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const totalRentals = rentals.length;
  const topState = rentals.length > 0
    ? Object.entries(rentals.reduce((acc, r) => ({ ...acc, [r.state]: (acc[r.state] || 0) + 1 }), {} as Record<string, number>))
      .sort((a, b) => b[1] - a[1])[0][0]
    : "N/A";
  const upcomingDues = rentals.filter(r => r.dueDate > new Date() && r.dueDate <= add(new Date(), { days: 30 })).length;

  const uniqueStates = ['all', ...Array.from(new Set(mockRentals.map(r => r.state)))];

  const filteredRentals = rentals.filter(rental => {
    const searchLower = search.toLowerCase();
    const matchesSearch = rental.shopName.toLowerCase().includes(searchLower) ||
      rental.tenantName.toLowerCase().includes(searchLower);
    const matchesState = stateFilter === 'all' || rental.state === stateFilter;
    return matchesSearch && matchesState;
  });
  
  const handleAddRental = (newRental: Omit<Rental, 'id'>) => {
    const rentalToAdd: Rental = { ...newRental, id: (rentals.length + 1).toString() };
    setRentals(prev => [...prev, rentalToAdd]);
    setIsSheetOpen(false);
  };

  const handleUpdateRental = (updatedRental: Rental) => {
    setRentals(prev => prev.map(r => r.id === updatedRental.id ? updatedRental : r));
    setEditingRental(null);
    setIsSheetOpen(false);
  };
  
  const handleDeleteRental = (id: string) => {
    setRentals(prev => prev.filter(r => r.id !== id));
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
    const headers = ["Shop Name", "Tenant", "State", "Rent (NGN)", "Due Date"];
    const csvContent = [
      headers.join(","),
      ...filteredRentals.map(r => [
        `"${r.shopName}"`,
        `"${r.tenantName}"`,
        r.state,
        r.monthlyRent,
        r.dueDate.toLocaleDateString(),
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


  if (!isClient) {
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
                  onSave={editingRental ? handleUpdateRental : handleAddRental}
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
