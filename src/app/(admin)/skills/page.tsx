
'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuCheckboxItem
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { type Skill, type SkillCategory, type Pagination, type GetAllParams } from "@/lib/types";
import { getSkillCategories, getSkills, deleteSkill } from '@/services/api';
import {
    MoreHorizontal,
    Edit,
    Trash2,
    Search,
    Columns,
    ChevronLeft,
    ChevronRight,
    Tags,
    SlidersHorizontal,
    FilterX,
    ArrowDownUp,
    ArrowUp,
    ArrowDown,
} from "lucide-react";
import Link from "next/link";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/lib/hooks';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { format, isValid } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';

type SortConfig = {
    key: string;
    direction: 'asc' | 'desc';
} | null;

const allFieldsConfig = [
    { key: 'name' as const, label: 'Skill Name', sortable: true, sortKey: 'name' },
    { key: 'skillCategory' as const, label: 'Category', sortable: true, sortKey: 'skillCategory.name' },
    { key: 'description' as const, label: 'Description', sortable: true, sortKey: 'description' },
    { key: 'status' as const, label: 'Status', sortable: true, sortKey: 'isActive' },
    { key: 'createdAt' as const, label: 'Created At', sortable: true, sortKey: 'createdAt' },
    { key: 'updatedAt' as const, label: 'Last Updated', sortable: true, sortKey: 'updatedAt' },
    { key: 'actions' as const, label: 'Actions', sortable: false },
];

type ColumnKeys = typeof allFieldsConfig[number]['key'];

const defaultDisplayFields: ColumnKeys[] = ['name', 'skillCategory', 'status', 'updatedAt'];

const initialColumnVisibility = allFieldsConfig.reduce((acc, col) => {
  acc[col.key] = defaultDisplayFields.includes(col.key) || col.key === 'actions';
  return acc;
}, {} as Record<ColumnKeys, boolean>);

const ROWS_PER_PAGE = 10;

export default function SkillsPage() {
    const { toast } = useToast();
    const [skills, setSkills] = useState<Skill[]>([]);
    const [categories, setCategories] = useState<SkillCategory[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'updatedAt', direction: 'desc' });
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const [filters, setFilters] = useState({
        categoryId: 'all',
        isActive: 'all',
    });
    
    const [columnVisibility, setColumnVisibility] = useState<Record<ColumnKeys, boolean>>(initialColumnVisibility);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [rowsPerPageInput, setRowsPerPageInput] = useState<number | string>(10);

    useEffect(() => {
        getSkillCategories({ limit: 1000, sort: 'name' })
            .then(res => setCategories(res.data))
            .catch(err => console.error("Failed to fetch skill categories", err));
    }, []);

    const fetchSkills = useCallback(() => {
        setIsLoading(true);
        const apiFilters: Record<string, any> = {};
        if (debouncedSearchTerm) {
            apiFilters['name'] = debouncedSearchTerm;
        }
        if (filters.categoryId !== 'all') {
            apiFilters['skillCategory'] = filters.categoryId;
        }
        if (filters.isActive !== 'all') {
            apiFilters.isActive = filters.isActive === 'active';
        }
        
        const sortString = sortConfig ? `${sortConfig.direction === 'desc' ? '-' : ''}${sortConfig.key}` : undefined;

        const fieldKeys = allFieldsConfig
            .filter(c => columnVisibility[c.key])
            .map(c => c.key)
            .filter(k => k !== 'actions');
        
        const apiFields = fieldKeys.map(k => {
            if (k === 'skillCategory') return 'skillCategory';
            return k;
        });

        const essentialApiFields: string[] = ['id', 'name', 'createdAt', 'updatedAt', 'skillCategory', 'isActive', 'description'];
        if (sortConfig) {
            essentialApiFields.push(sortConfig.key.split('.')[0]); // e.g. 'skillCategory.name' -> 'skillCategory'
        }
        
        const uniqueFields = [...new Set([...apiFields, ...essentialApiFields])];
        const fieldsString = uniqueFields.join(',');

        const params: GetAllParams = { page: currentPage, limit: rowsPerPage, filters: apiFilters, sort: sortString, fields: fieldsString };

        getSkills(params)
            .then(data => {
                setSkills(data.data);
                setPagination(data.pagination);
            })
            .catch(error => {
                toast({
                    title: 'Error fetching skills',
                    description: error.message,
                    variant: 'destructive',
                });
            })
            .finally(() => setIsLoading(false));
    }, [currentPage, rowsPerPage, debouncedSearchTerm, filters, sortConfig, toast, columnVisibility]);

    useEffect(() => {
        fetchSkills();
    }, [fetchSkills]);

    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchTerm, rowsPerPage, filters, sortConfig]);

    const handleDelete = async (skillId: string) => {
        try {
            await deleteSkill(skillId);
            toast({
                title: 'Skill Deleted',
                description: 'The skill has been successfully deleted.',
            });
            fetchSkills(); 
        } catch (error: any) {
             toast({
                title: 'Error deleting skill',
                description: error.message,
                variant: 'destructive',
            });
        }
    }

    const requestSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key: string) => {
        if (!sortConfig || sortConfig.key !== key) {
            return <ArrowDownUp className="h-4 w-4 text-muted-foreground/50" />;
        }
        return sortConfig.direction === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
    };

    const clearFilters = () => {
        setSearchTerm('');
        setFilters({ categoryId: 'all', isActive: 'all' });
        setSortConfig({ key: 'updatedAt', direction: 'desc' });
    }

    const handleFilterChange = (key: keyof typeof filters, value: string) => {
        setFilters(prev => ({...prev, [key]: value}));
    }

    const SkeletonRow = () => (
        <TableRow>
            {columnVisibility.name && <TableCell><Skeleton className="h-5 w-32" /></TableCell>}
            {columnVisibility.skillCategory && <TableCell><Skeleton className="h-5 w-40" /></TableCell>}
            {columnVisibility.status && <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>}
            {columnVisibility.updatedAt && <TableCell><Skeleton className="h-5 w-24" /></TableCell>}
            {columnVisibility.actions && <TableCell><Skeleton className="h-8 w-8" /></TableCell>}
        </TableRow>
    );

    return (
        <div>
            <PageHeader title="Skills Management">
                 <Button asChild>
                    <Link href="/skills/new">
                        <Tags className="mr-1 h-4 w-4" />
                        Add Skill
                    </Link>
                </Button>
            </PageHeader>
            
            <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by skill name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className='flex gap-2 w-full md:w-auto'>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full md:w-auto">
                                <SlidersHorizontal className="mr-1 h-4 w-4" />
                                Filter
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80" align="end">
                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <h4 className="font-medium leading-none">Filters</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Refine skill results.
                                    </p>
                                </div>
                                 <div className="grid gap-2">
                                    <Label>Category</Label>
                                    <Select value={filters.categoryId} onValueChange={(value) => handleFilterChange('categoryId', value)}>
                                        <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Categories</SelectItem>
                                            {categories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Status</Label>
                                     <RadioGroup value={filters.isActive} onValueChange={(value) => setFilters(prev => ({...prev, isActive: value}))}>
                                        <div className="flex items-center space-x-2"><RadioGroupItem value="all" id="r-stat-all" /><Label htmlFor="r-stat-all">All</Label></div>
                                        <div className="flex items-center space-x-2"><RadioGroupItem value="active" id="r-stat-active" /><Label htmlFor="r-stat-active">Active</Label></div>
                                        <div className="flex items-center space-x-2"><RadioGroupItem value="inactive" id="r-stat-inactive" /><Label htmlFor="r-stat-inactive">Inactive</Label></div>
                                    </RadioGroup>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full md:w-auto">
                                <Columns className="mr-1 h-4 w-4" />
                                Columns
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {allFieldsConfig.filter(c => c.key !== 'actions').map(column => (
                                <DropdownMenuCheckboxItem
                                    key={column.key}
                                    className="capitalize"
                                    checked={columnVisibility[column.key]}
                                    onCheckedChange={(value) =>
                                        setColumnVisibility(prev => ({...prev, [column.key]: !!value}))
                                    }
                                >
                                    {column.label}
                                </DropdownMenuCheckboxItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Button variant="outline" onClick={clearFilters}>
                        <FilterX className="mr-1 h-4 w-4" />
                        Clear
                    </Button>
                </div>
            </div>

            <div className="bg-card border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {allFieldsConfig.map(col => (
                                columnVisibility[col.key] && (
                                    <TableHead key={col.key} className={cn({
                                        'hidden md:table-cell': col.key === 'description' || col.key === 'createdAt',
                                    })}>
                                        {col.sortable ? (
                                            <Button variant="ghost" onClick={() => requestSort(col.sortKey as string)} className="px-0 h-auto hover:bg-transparent capitalize">
                                                {col.label} {getSortIcon(col.sortKey as string)}
                                            </Button>
                                        ) : (
                                            col.label === 'Actions' ? <span className="sr-only">{col.label}</span> : col.label
                                        )}
                                    </TableHead>
                                )
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: rowsPerPage }).map((_, i) => <SkeletonRow key={i} />)
                        ) : skills.length > 0 ? (
                            skills.map(skill => (
                                <TableRow key={skill.id}>
                                    {columnVisibility.name && <TableCell className="font-medium">{skill.name}</TableCell>}
                                    {columnVisibility.skillCategory && <TableCell className="text-muted-foreground">{skill.skillCategory?.name}</TableCell>}
                                    {columnVisibility.description && <TableCell className="hidden md:table-cell text-muted-foreground max-w-md truncate">{skill.description}</TableCell>}
                                    {columnVisibility.status && <TableCell>
                                        <Badge variant={skill.isActive ? 'default' : 'destructive'} className={skill.isActive ? 'bg-green-500 hover:bg-green-600' : ''}>
                                            {skill.isActive ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </TableCell>}
                                    {columnVisibility.createdAt && <TableCell className="hidden md:table-cell">{isValid(new Date(skill.createdAt)) ? format(new Date(skill.createdAt), 'MMM d, yyyy') : 'N/A'}</TableCell>}
                                    {columnVisibility.updatedAt && <TableCell>{isValid(new Date(skill.updatedAt)) ? format(new Date(skill.updatedAt), 'MMM d, yyyy') : 'N/A'}</TableCell>}
                                    {columnVisibility.actions && (
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
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/skills/${skill.id}/edit`}>
                                                                <Edit className="mr-1 h-4 w-4" />
                                                                Edit
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <AlertDialogTrigger asChild>
                                                            <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
                                                                <Trash2 className="mr-1 h-4 w-4"/>
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </AlertDialogTrigger>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. This will permanently delete the skill.
                                                    </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(skill.id)}>Continue</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={Object.values(columnVisibility).filter(Boolean).length} className="h-24 text-center">
                                    No results found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
             <div className="flex items-center justify-between mt-4">
                 <div className="text-sm text-muted-foreground">
                    {isLoading || !pagination ? (
                        <Skeleton className="h-5 w-48" />
                    ) : (
                        `Showing ${pagination.totalRecords === 0 ? 0 : (pagination.currentPage - 1) * pagination.limit + 1} to ${Math.min(pagination.currentPage * pagination.limit, pagination.totalRecords)} of ${pagination.totalRecords} skills.`
                    )}
                </div>
                <div className="flex items-center gap-6 lg:gap-8">
                    <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium">Rows per page</p>
                        <Input
                            type="number"
                            className="h-8 w-[70px]"
                            value={rowsPerPageInput}
                            onChange={(e) => setRowsPerPageInput(e.target.value)}
                            onBlur={() => {
                                const newRows = Number(rowsPerPageInput);
                                if (newRows > 0) {
                                    setRowsPerPage(newRows);
                                } else {
                                    setRowsPerPageInput(rowsPerPage);
                                }
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    const newRows = Number(rowsPerPageInput);
                                    if (newRows > 0) {
                                        setRowsPerPage(newRows);
                                    } else {
                                        setRowsPerPageInput(rowsPerPage);
                                    }
                                    (e.target as HTMLInputElement).blur();
                                }
                            }}
                            min={1}
                            disabled={isLoading}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                            Page {isLoading || !pagination ? '...' : pagination.currentPage} of {isLoading || !pagination ? '...' : pagination.totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1 || isLoading}
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination?.totalPages || 1))}
                            disabled={currentPage === pagination?.totalPages || isLoading}
                        >
                            Next
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
