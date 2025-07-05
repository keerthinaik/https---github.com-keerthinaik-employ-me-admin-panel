

'use client';

import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { type User, availableSubAdminPermissions, employers } from '@/lib/data';
import { Switch } from './ui/switch';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from './ui/command';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const employeeSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
  phoneNumber: z.string().regex(/^\+?[0-9\s-()]{7,20}$/, "Please enter a valid phone number").optional().or(z.literal('')),
  status: z.enum(['Active', 'Inactive']),
  role: z.enum(['Recruiter', 'Member']).optional(),
  employerId: z.string().optional(),
  permissions: z.array(z.string()).optional(),
});

type EmployeeFormValues = z.infer<typeof employeeSchema>;

type EmployeeFormProps = {
    user?: User;
}

export function EmployeeForm({ user }: EmployeeFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [openEmployer, setOpenEmployer] = React.useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
    watch,
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
        name: user?.name || '',
        email: user?.email || '',
        phoneNumber: user?.phoneNumber || '',
        status: user?.status || 'Active',
        role: (user?.role as 'Recruiter' | 'Member') || 'Member',
        employerId: user?.employerId || '',
        permissions: user?.permissions || [],
    }
  });

  const selectedRole = watch('role');

  const onSubmit = (data: EmployeeFormValues) => {
    const payload = { ...data };
    if (user && !payload.password) {
      delete payload.password;
    }
    console.log(payload);
    toast({
        title: user ? 'Employee Updated' : 'Employee Created',
        description: `${data.name} has been successfully ${user ? 'updated' : 'created'}.`,
    });
    router.push('/employees');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Employee Details</CardTitle>
                        <CardDescription>
                            Enter the main details for the employee.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input id="name" {...register('name')} />
                                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" {...register('email')} />
                                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label htmlFor="phoneNumber">Phone Number</Label>
                                <Input id="phoneNumber" {...register('phoneNumber')} />
                                {errors.phoneNumber && <p className="text-sm text-destructive">{errors.phoneNumber.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" type="password" {...register('password')} placeholder={user ? 'Leave blank to keep current password' : ''} />
                                {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="role">Role</Label>
                                <Controller
                                    name="role"
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <SelectTrigger id="role">
                                                <SelectValue placeholder="Select a role" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Recruiter">Recruiter</SelectItem>
                                                <SelectItem value="Member">Member</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                             <div className="space-y-2">
                                <Label>Employer</Label>
                                <Controller
                                    name="employerId"
                                    control={control}
                                    render={({ field }) => (
                                        <Popover open={openEmployer} onOpenChange={setOpenEmployer}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={openEmployer}
                                                className="w-full justify-between"
                                                >
                                                {field.value
                                                    ? employers.find((employer) => employer.id === field.value)?.companyName
                                                    : "Select employer..."}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                                <Command>
                                                    <CommandInput placeholder="Search employer..." />
                                                    <CommandEmpty>No employer found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {employers.map((employer) => (
                                                        <CommandItem
                                                            value={employer.companyName}
                                                            key={employer.id}
                                                            onSelect={() => {
                                                                field.onChange(employer.id)
                                                                setOpenEmployer(false)
                                                            }}
                                                        >
                                                            <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                field.value === employer.id ? "opacity-100" : "opacity-0"
                                                            )}
                                                            />
                                                            {employer.companyName}
                                                        </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                    )}
                                />
                                {errors.employerId && <p className="text-sm text-destructive">{errors.employerId.message}</p>}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Account Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <Label>Active Status</Label>
                                <CardDescription>Inactive employees cannot log in.</CardDescription>
                            </div>
                             <Controller
                                name="status"
                                control={control}
                                render={({ field }) => (
                                    <Switch
                                        checked={field.value === 'Active'}
                                        onCheckedChange={(checked) => field.onChange(checked ? 'Active' : 'Inactive')}
                                    />
                                )}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
        <CardFooter className="flex justify-end gap-2 mt-6 px-0">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
        </CardFooter>
    </form>
  );
}
