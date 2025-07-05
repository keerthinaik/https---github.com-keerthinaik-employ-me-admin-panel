

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Building,
  FileText,
  LayoutDashboard,
  Users,
  UsersRound,
  School,
  Handshake,
  Shield,
  type LucideIcon,
  Tags,
  FolderKanban,
  HelpCircle,
  LayoutList,
  Briefcase,
  Contact,
  CheckCircle,
  ChevronDown,
  ShieldCheck,
  Ticket,
  CreditCard,
  UserCheck,
} from 'lucide-react';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';

type SubNavItem = {
  href: string;
  label: string;
}

type NavItem = {
  href?: string;
  label: string;
  icon: LucideIcon;
  subItems?: SubNavItem[];
};

const navSections: { title: string; items: NavItem[] }[] = [
  {
    title: 'MAIN',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/applications', label: 'Applications', icon: FileText },
    ],
  },
  {
    title: 'JOBS',
    items: [
      {
        label: 'Jobs',
        icon: Briefcase,
        subItems: [
          { href: '/jobs', label: 'Manage Jobs' },
          { href: '/jobs/verification', label: 'Job Verification' },
        ],
      },
      { href: '/job-categories', label: 'Job Categories', icon: LayoutList },
    ],
  },
  {
    title: 'USERS',
    items: [
      {
        label: 'Jobseekers',
        icon: UsersRound,
        subItems: [
          { href: '/jobseekers', label: 'Manage Jobseekers' },
          { href: '/jobseekers/verification', label: 'Verification' },
        ],
      },
      {
        label: 'Employers',
        icon: Building,
        subItems: [
          { href: '/employers', label: 'Manage Employers' },
          { href: '/employers/verification', label: 'Employer Verification' },
        ],
      },
      {
        label: 'Universities',
        icon: School,
        subItems: [
          { href: '/universities', label: 'Manage Universities' },
          { href: '/universities/verification', label: 'University Verification' },
        ],
      },
      {
        label: 'Businesses',
        icon: Handshake,
        subItems: [
          { href: '/businesses', label: 'Manage Businesses' },
          { href: '/businesses/verification', label: 'Business Verification' },
        ],
      },
    ],
  },
  {
    title: 'ADMINISTRATION',
    items: [
      { href: '/admins', label: 'Admins', icon: Shield },
      { href: '/sub-admins', label: 'Sub Admins', icon: ShieldCheck },
      { href: '/recruiters', label: 'Recruiters', icon: Contact },
      { href: '/employees', label: 'Employees', icon: Users },
    ],
  },
  {
    title: 'SKILLS',
    items: [
      { href: '/skills', label: 'Skills', icon: Tags },
      { href: '/skill-categories', label: 'Skill Categories', icon: FolderKanban },
    ],
  },
    {
    title: 'SUBSCRIPTION & PAYMENT',
    items: [
      {
        label: 'Manage B2B',
        icon: Building,
        subItems: [
          { href: '/active-b2b-plans', label: 'Active B2B Plans' },
          { href: '/employer-plans', label: 'Employer Plans' },
          { href: '/business-plans', label: 'Business Plans' },
          { href: '/university-plans', label: 'University Plans' },
        ],
      },
       {
        label: 'Manage B2C',
        icon: Users,
        subItems: [
          { href: '/active-b2c-plans', label: 'Active B2C Plans' },
          { href: '/jobseeker-plans', label: 'Jobseeker Plans' },
        ],
      },
      { href: '/coupons', label: 'Manage Coupons', icon: Ticket },
      { href: '/user-subscriptions', label: 'User Subscriptions', icon: UserCheck },
    ],
  },
  {
    title: 'OTHERS',
    items: [
      { href: '/faqs', label: 'FAQs', icon: HelpCircle },
    ],
  },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-4">
      {navSections.map((section) => (
        <div key={section.title}>
          <h2 className="mb-2 px-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            {section.title}
          </h2>
          <SidebarMenu>
            {section.items.map((item) => {
              if (item.subItems) {
                const activeSubItem = item.subItems
                  .slice()
                  .sort((a, b) => b.href.length - a.href.length)
                  .find(sub => pathname === sub.href || pathname.startsWith(`${sub.href}/`));

                const isParentActive = !!activeSubItem;
                
                return (
                  <Accordion key={item.label} type="single" collapsible defaultValue={isParentActive ? item.label : undefined} className="w-full">
                    <AccordionItem value={item.label} className="border-b-0">
                      <AccordionTrigger className={cn(
                        "flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 h-8",
                        isParentActive ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "hover:bg-primary/5"
                      )}>
                        <div className="flex items-center gap-2">
                           <item.icon className="h-4 w-4 shrink-0" />
                           <span>{item.label}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pl-6 pt-1">
                          <div className="flex flex-col gap-1 mt-1">
                              {item.subItems.map((subItem) => {
                                  const isActive = activeSubItem?.href === subItem.href;
                                  
                                  return (
                                      <Link key={subItem.href} href={subItem.href} className={cn(
                                          "text-sm p-2 rounded-md",
                                          isActive ? "bg-primary/10 text-primary font-semibold" : "hover:bg-primary/5"
                                      )}>
                                          {subItem.label}
                                      </Link>
                                  );
                              })}
                          </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )
              }

              const isActive = (pathname === item.href || pathname.startsWith(`${item.href}/`)) && !navSections.flatMap(s => s.items).some(i => i.href && i.href.startsWith(item.href!) && i.href.length > item.href!.length && pathname.startsWith(i.href));
              return (
                <SidebarMenuItem key={item.href + item.label}>
                  <SidebarMenuButton
                    asChild
                    isActive={!!isActive}
                    className={cn(
                      isActive ? 'bg-primary/10 text-primary' : 'hover:bg-primary/5',
                      'justify-start'
                    )}
                    tooltip={{ children: item.label }}
                  >
                    <Link href={item.href || '#'}>
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </div>
      ))}
    </div>
  );
}
