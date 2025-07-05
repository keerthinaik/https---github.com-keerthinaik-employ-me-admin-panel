

'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Globe, LogOut, Settings, User, Shield, ShieldCheck, Contact } from "lucide-react";
import { MainNav } from "@/components/main-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";
import { useAuth } from "@/context/auth";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";

const getRoleBadge = (role?: 'Admin' | 'SubAdmin') => {
    if (!role) return null;
    switch (role) {
        case 'Admin':
            return <Badge className="bg-primary hover:bg-primary/90 text-xs"><Shield className="mr-1 h-3 w-3" />Admin</Badge>;
        case 'SubAdmin':
            return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-xs"><ShieldCheck className="mr-1 h-3 w-3" />Sub-Admin</Badge>;
        default:
            return <Badge variant="secondary" className="text-xs">{role}</Badge>;
    }
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
      if (!isLoading && !isAuthenticated) {
          router.replace('/login');
      }
  }, [isLoading, isAuthenticated, router]);
  
  if (isLoading || !isAuthenticated) {
      return (
          <div className="flex items-center justify-center min-h-screen">
              {/* You can replace this with a more sophisticated loader component */}
              <p>Loading...</p> 
          </div>
      );
  }

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    logout();
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar collapsible="icon" className="border-r">
          <SidebarHeader>
             <div className="flex items-center gap-2 p-2">
                <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/10 h-9 w-9">
                    <Globe className="h-6 w-6" />
                </Button>
                <h1 className="font-bold text-lg text-foreground truncate">Employ Me</h1>
             </div>
          </SidebarHeader>
          <SidebarContent className="p-2">
            <MainNav />
          </SidebarContent>
          <SidebarFooter>
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="w-full justify-start gap-2 p-2 h-auto">
                         <Avatar className="h-8 w-8">
                            <AvatarImage src="https://placehold.co/40x40.png" alt={user?.name || 'Admin'} />
                            <AvatarFallback>{user?.name?.slice(0, 2).toUpperCase() || 'AD'}</AvatarFallback>
                        </Avatar>
                        <div className="truncate text-left">
                           <div className="flex items-center gap-2">
                                <p className="font-semibold text-sm text-foreground truncate">{user?.name || 'Admin User'}</p>
                                {getRoleBadge(user?.userType as any)}
                            </div>
                            <p className="text-xs text-muted-foreground">{user?.email || 'admin@talent.hub'}</p>
                        </div>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" side="right" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{user?.name || 'Admin User'}</p>
                            <p className="text-xs leading-none text-muted-foreground">{user?.email || 'admin@talent.hub'}</p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile"><User className="mr-1 h-4 w-4" />Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings"><Settings className="mr-1 h-4 w-4" />Settings</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-1 h-4 w-4" />Log out
                    </DropdownMenuItem>
                </DropdownMenuContent>
             </DropdownMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="flex-1 bg-background">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <SidebarTrigger className="md:hidden"/>
            <div className="ml-auto">
              <ThemeToggle />
            </div>
          </header>
          <main className="p-4 sm:px-6 sm:py-0">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
