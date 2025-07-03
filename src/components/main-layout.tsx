"use client"

import type { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Toaster } from '@/components/ui/toaster'
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  Briefcase,
  Users,
  ShieldCheck,
  ScanEye,
  Languages,
  LifeBuoy,
  LogOut,
  Globe,
} from 'lucide-react'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/jobs', label: 'Job Postings', icon: Briefcase },
  { href: '/users', label: 'User Accounts', icon: Users },
  { href: '/roles', label: 'Manage Roles', icon: ShieldCheck },
  { href: '/moderation', label: 'Content Moderation', icon: ScanEye },
  { href: '/localization', label: 'Localization', icon: Languages },
]

export function MainLayout({
  children,
}: {
  children: ReactNode
}) {
  const pathname = usePathname()

  return (
    <SidebarProvider>
        <Sidebar
          variant="sidebar"
          className="group-data-[collapsible=icon]:bg-sidebar"
        >
          <SidebarHeader>
            <Link href="/" className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="size-10 bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
              >
                <Globe />
              </Button>
              <span className="text-lg font-semibold group-data-[collapsible=icon]:hidden">
                Global Talent
              </span>
            </Link>
          </SidebarHeader>
          <SidebarContent className="p-2">
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <Link href={item.href} legacyBehavior passHref>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href}
                      tooltip={item.label}
                    >
                      <a>
                        <item.icon />
                        <span>{item.label}</span>
                      </a>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-2">
            <SidebarMenu>
               <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Support">
                    <LifeBuoy />
                    <span>Support</span>
                  </SidebarMenuButton>
               </SidebarMenuItem>
               <SidebarMenuItem>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                       <SidebarMenuButton tooltip="My Account">
                          <Avatar className="size-6">
                            <AvatarImage src="https://placehold.co/40x40" alt="Admin" data-ai-hint="person portrait" />
                            <AvatarFallback>AD</AvatarFallback>
                          </Avatar>
                          <span className="flex-1">Admin User</span>
                       </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="mb-2 w-56" side="top" align="end">
                       <DropdownMenuLabel>My Account</DropdownMenuLabel>
                       <DropdownMenuSeparator />
                       <DropdownMenuItem>Settings</DropdownMenuItem>
                       <DropdownMenuItem>Support</DropdownMenuItem>
                       <DropdownMenuSeparator />
                       <DropdownMenuItem>
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>Log out</span>
                       </DropdownMenuItem>
                    </DropdownMenuContent>
                 </DropdownMenu>
               </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <header className="flex h-14 items-center gap-4 border-b bg-card px-6">
             <SidebarTrigger className="md:hidden" />
             <h1 className="text-lg font-semibold md:text-xl">
                {navItems.find(item => item.href === pathname)?.label || 'Dashboard'}
             </h1>
          </header>
          <div className="flex-1 overflow-auto p-4 md:p-6">{children}</div>
          <Toaster />
        </SidebarInset>
    </SidebarProvider>
  )
}
