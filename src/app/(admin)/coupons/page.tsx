

'use client';

import { useState, useMemo, useEffect } from 'react';
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { coupons, type Coupon } from "@/lib/data";
import { MoreHorizontal, Edit, Trash2, PlusCircle, ArrowDownUp, ArrowUp, ArrowDown } from "lucide-react";
import Link from "next/link";
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

type SortConfig = {
    key: keyof Coupon;
    direction: 'asc' | 'desc';
} | null;

export default function CouponsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'updatedAt', direction: 'desc' });
    
    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 1000);
        return () => clearTimeout(timer);
    },[]);

    const sortedCoupons = useMemo(() => {
        let sortedItems = [...coupons];
        if (sortConfig !== null) {
            sortedItems.sort((a, b) => {
                const key = sortConfig.key;
                const valA = a[key as keyof Coupon] as any;
                const valB = b[key as keyof Coupon] as any;
                
                if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
                if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return sortedItems;
    }, [sortConfig]);
    
    const requestSort = (key: keyof Coupon) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key: keyof Coupon) => {
        if (!sortConfig || sortConfig.key !== key) {
            return <ArrowDownUp className="h-4 w-4 text-muted-foreground/50" />;
        }
        return sortConfig.direction === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
    };


    const SkeletonRow = () => (
        <TableRow>
            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
            <TableCell><Skeleton className="h-5 w-20" /></TableCell>
            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
            <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
            <TableCell><Skeleton className="h-8 w-8" /></TableCell>
        </TableRow>
    );

    return (
        <div>
            <PageHeader title="Manage Coupons">
                <Button asChild>
                    <Link href="/coupons/new">
                        <PlusCircle className="mr-1 h-4 w-4" />
                        Create Coupon
                    </Link>
                </Button>
            </PageHeader>
            <div className="bg-card border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead><Button variant="ghost" onClick={() => requestSort('code')} className="px-0 h-auto hover:bg-transparent">Code {getSortIcon('code')}</Button></TableHead>
                            <TableHead><Button variant="ghost" onClick={() => requestSort('value')} className="px-0 h-auto hover:bg-transparent">Discount {getSortIcon('value')}</Button></TableHead>
                            <TableHead><Button variant="ghost" onClick={() => requestSort('usedCount')} className="px-0 h-auto hover:bg-transparent">Usage {getSortIcon('usedCount')}</Button></TableHead>
                            <TableHead><Button variant="ghost" onClick={() => requestSort('expiresAt')} className="px-0 h-auto hover:bg-transparent">Expires At {getSortIcon('expiresAt')}</Button></TableHead>
                            <TableHead><Button variant="ghost" onClick={() => requestSort('isActive')} className="px-0 h-auto hover:bg-transparent">Status {getSortIcon('isActive')}</Button></TableHead>
                            <TableHead><span className="sr-only">Actions</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                        ) : sortedCoupons.length > 0 ? (
                            sortedCoupons.map(coupon => (
                                <TableRow key={coupon.id}>
                                    <TableCell className="font-mono">{coupon.code}</TableCell>
                                    <TableCell>
                                        {coupon.discountType === 'flat' ? `$${coupon.value}` : `${coupon.value}%`}
                                    </TableCell>
                                    <TableCell>{coupon.usedCount} / {coupon.maxUsage || '∞'}</TableCell>
                                     <TableCell>
                                        {coupon.expiresAt ? format(coupon.expiresAt, 'MMM d, yyyy') : 'N/A'}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={coupon.isActive ? 'default' : 'secondary'} className={coupon.isActive ? 'bg-green-500 hover:bg-green-600' : ''}>
                                            {coupon.isActive ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                    <span className="sr-only">Toggle menu</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/coupons/${coupon.id}/edit`}>
                                                        <Edit className="mr-1 h-4 w-4"/> Edit
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
                                                    <Trash2 className="mr-1 h-4 w-4"/> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">No coupons found.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
