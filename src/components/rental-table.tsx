"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Rental } from "@/lib/types";
import { MoreHorizontal, Trash2, Edit } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { format, isPast } from 'date-fns';

interface RentalTableProps {
  rentals: Rental[];
  onEdit: (rental: Rental) => void;
  onDelete: (id: string) => void;
}

export default function RentalTable({ rentals, onEdit, onDelete }: RentalTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Shop Name</TableHead>
            <TableHead className="hidden md:table-cell">Tenant</TableHead>
            <TableHead className="hidden md:table-cell">State</TableHead>
            <TableHead>Rent</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rentals.length > 0 ? (
            rentals.map((rental) => (
              <TableRow key={rental.id}>
                <TableCell className="font-medium">{rental.shopName}</TableCell>
                <TableCell className="hidden md:table-cell">{rental.tenantName}</TableCell>
                <TableCell className="hidden md:table-cell">{rental.state}</TableCell>
                <TableCell>
                  ₦{rental.rentAmount.toLocaleString()}
                  <span className="text-xs text-muted-foreground">/{rental.rentalType === 'monthly' ? 'mo' : 'yr'}</span>
                </TableCell>
                <TableCell>
                  <Badge variant={isPast(rental.dueDate) ? "destructive" : "outline"}>
                    {format(rental.dueDate, "MMM dd, yyyy")}
                  </Badge>
                </TableCell>
                <TableCell>
                  <AlertDialog>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onSelect={() => onEdit(rental)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <AlertDialogTrigger asChild>
                           <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                             <Trash2 className="mr-2 h-4 w-4" />
                             Delete
                           </DropdownMenuItem>
                        </AlertDialogTrigger>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the
                          rental record for {rental.shopName}.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDelete(rental.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No results found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
