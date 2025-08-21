
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
import { format, isPast, parseISO, isBefore, addMonths } from 'date-fns';
import { useIsMobile } from "@/hooks/use-mobile";

interface RentalTableProps {
  rentals: Rental[];
  onEdit: (rental: Rental) => void;
  onDelete: (id: string) => void;
}

export default function RentalTable({ rentals, onEdit, onDelete }: RentalTableProps) {
  const isMobile = useIsMobile();

  const handleRowClick = (rental: Rental) => {
    if (isMobile) {
      onEdit(rental);
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Shop Name</TableHead>
            <TableHead className="hidden md:table-cell">Tenant</TableHead>
            <TableHead>Rent</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rentals.length > 0 ? (
            rentals.map((rental) => {
              if (!rental) return null;
              const dueDate = rental.due_date ? parseISO(rental.due_date) : null;
              
              let badgeVariant: "destructive" | "outline" = "outline";
              if (dueDate) {
                const now = new Date();
                const oneMonthFromNow = addMonths(now, 1);
                if (isPast(dueDate) || (isBefore(dueDate, oneMonthFromNow))) {
                   badgeVariant = "destructive";
                }
              }

              return (
              <TableRow key={rental.id} onClick={() => handleRowClick(rental)} className={isMobile ? 'cursor-pointer' : ''}>
                <TableCell className="font-medium">{rental.shop_name}</TableCell>
                <TableCell className="hidden md:table-cell">{rental.tenant_name || 'N/A'}</TableCell>
                <TableCell>
                  {rental.rent_amount ? `₦${rental.rent_amount.toLocaleString()}`: 'N/A'}
                </TableCell>
                <TableCell>
                  {dueDate ? (
                    <Badge variant={badgeVariant}>
                      {format(dueDate, "MMM dd, yyyy")}
                    </Badge>
                  ) : (
                    'N/A'
                  )}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
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
                          rental record for {rental.shop_name}.
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
            )})
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No results found. Start by adding a new rental.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
