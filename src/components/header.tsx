"use client";

import { User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useAuth } from "@/lib/firebase/auth-context";
import { Logo } from "./logo";
import { getAuth, signOut as firebaseSignOut } from "firebase/auth";
import { app } from "@/lib/firebase/config";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";


export default function Header() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const auth = getAuth(app);

  const handleSignOut = async () => {
    await firebaseSignOut(auth);
    router.push('/login');
  };

  return (
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-50">
      <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        <a
          href="/"
          className="flex items-center gap-2 text-lg font-semibold md:text-base whitespace-nowrap"
        >
          <Logo />
          <span className="font-bold text-lg">Soil Rentals</span>
        </a>
      </nav>
      {/* Mobile Nav */}
      <a
          href="/"
          className="flex items-center gap-2 text-lg font-semibold md:hidden whitespace-nowrap"
        >
          <Logo />
          <span className="font-bold text-lg">Soil Rentals</span>
      </a>
      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            {user && !loading && (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="rounded-full">
                    <Avatar>
                    <AvatarImage src={user.photoURL || "https://placehold.co/40x40.png"} alt="User Avatar" data-ai-hint="user avatar" />
                    <AvatarFallback>
                        <User className="h-5 w-5" />
                    </AvatarFallback>
                    </Avatar>
                    <span className="sr-only">Toggle user menu</span>
                </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user.email || 'My Account'}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Support</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            )}
        </div>
      </div>
    </header>
  );
}
