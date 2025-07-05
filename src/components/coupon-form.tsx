

'use client';

import * as React from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { type Coupon, subscriptionPlans } from '@/lib/data';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from './ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { CalendarIcon, Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { countries } from '@/lib/enums';
import { Badge } from './ui/badge';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from './ui/command';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Calendar } from './ui/calendar';
import { format } from 'date-fns';
import { Switch } from './ui/switch';

const couponSchema = z.object({
  code: z.string().min(1, 'Coupon code is required'),
  description: z.string().optional(),
  discountType: z.enum(['flat', 'percentage']),
  value: z.coerce.number().min(0, 'Value must be non-negative'),
  maxUsage: z.coerce.number().optional(),
  expiresAt: z.date().optional(),
  userTypes: z.array(z.string()).optional(),
  applicableCountries: z.array(z.string()).optional(),
  applicablePlans: z.array(z.string()).optional(),
  isActive: z.boolean().default(true),
});

type CouponFormValues = z.infer<typeof couponSchema>;

type CouponFormProps = {
    coupon?: Coupon;
}

const userTypes = ['Admin', 'JobSeeker', 'Employer', 'University', 'Business'];

export function CouponForm({ coupon }: CouponFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [expiresAtOpen, setExpiresAtOpen] = React.useState(false);
  const form = useForm<CouponFormValues>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
        code: coupon?.code || '',
        description: coupon?.description || '',
        discountType: coupon?.discountType || 'percentage',
        value: coupon?.value || 0,
        maxUsage: coupon?.maxUsage,
        expiresAt: coupon?.expiresAt ? new Date(coupon.expiresAt) : undefined,
        userTypes: coupon?.userTypes || [],
        applicableCountries: coupon?.applicableCountries || [],
        applicablePlans: coupon?.applicablePlans || [],
        isActive: coupon?.isActive ?? true,
    }
  });

  const onSubmit = (data: CouponFormValues) => {
    console.log(data);
    toast({
        title: coupon ? 'Coupon Updated' : 'Coupon Created',
        description: `Coupon ${data.code} has been successfully ${coupon ? 'updated' : 'created'}.`,
    });
    router.push('/coupons');
  };

  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Coupon Details</CardTitle>
                            <CardDescription>Enter the main details for the coupon.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField
                                control={form.control}
                                name="code"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Coupon Code</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="discountType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Discount Type</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                 <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                                                    <SelectItem value="flat">Flat Amount</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="value"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Value</FormLabel>
                                            <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl><Textarea {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Restrictions & Applicability</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                                <FormField
                                    control={form.control}
                                    name="maxUsage"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Maximum Usage Count</FormLabel>
                                            <FormControl><Input type="number" {...field} value={field.value ?? ''} placeholder="Leave blank for unlimited"/></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="expiresAt"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Expires At</FormLabel>
                                            <Popover open={expiresAtOpen} onOpenChange={setExpiresAtOpen}>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant={"outline"}
                                                            className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}
                                                        >
                                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
                                                        onSelect={(date) => {
                                                          field.onChange(date)
                                                          setExpiresAtOpen(false)
                                                        }}
                                                        disabled={(date) => date < new Date()}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                             <p className="text-xs text-muted-foreground">Leave blank for no expiry.</p>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                             </div>
                           
                            <FormField
                                control={form.control}
                                name="applicableCountries"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Applicable Countries</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                className={cn("w-full justify-between h-auto", !field.value?.length && "text-muted-foreground")}
                                            >
                                                <div className="flex gap-1 flex-wrap">
                                                {field.value && field.value.length > 0 ? (
                                                    field.value.map((countryValue) => {
                                                    const country = countries.find(c => c.value === countryValue);
                                                    return (
                                                        <Badge
                                                        variant="secondary"
                                                        key={countryValue}
                                                        className="mr-1"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            field.onChange(field.value?.filter(v => v !== countryValue));
                                                        }}
                                                        >
                                                        {country?.label}
                                                        <X className="ml-1 h-3 w-3" />
                                                        </Badge>
                                                    );
                                                    })
                                                ) : (
                                                    "Select countries..."
                                                )}
                                                </div>
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                        <Command>
                                            <CommandInput placeholder="Search country..." />
                                            <CommandEmpty>No country found.</CommandEmpty>
                                            <CommandGroup className="max-h-60 overflow-auto">
                                            {countries.map((country) => (
                                                <CommandItem
                                                key={country.value}
                                                onSelect={() => {
                                                    const current = field.value || [];
                                                    const isSelected = current.includes(country.value);
                                                    if (isSelected) {
                                                    field.onChange(current.filter(c => c !== country.value));
                                                    } else {
                                                    field.onChange([...current, country.value]);
                                                    }
                                                }}
                                                >
                                                <Check
                                                    className={cn(
                                                    "mr-2 h-4 w-4",
                                                    field.value?.includes(country.value) ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                {country.label}
                                                </CommandItem>
                                            ))}
                                            </CommandGroup>
                                        </Command>
                                        </PopoverContent>
                                    </Popover>
                                    <p className="text-xs text-muted-foreground">Leave blank to apply to all countries.</p>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="userTypes"
                                render={() => (
                                    <FormItem>
                                        <FormLabel>Applicable User Types</FormLabel>
                                         <div className="flex flex-wrap gap-x-6 gap-y-2 p-2 border rounded-md">
                                            {userTypes.map((type) => (
                                                <FormField
                                                    key={type}
                                                    control={form.control}
                                                    name="userTypes"
                                                    render={({ field }) => {
                                                        return (
                                                            <FormItem key={type} className="flex flex-row items-start space-x-3 space-y-0">
                                                                <FormControl>
                                                                    <Checkbox
                                                                        checked={field.value?.includes(type)}
                                                                        onCheckedChange={(checked) => {
                                                                            return checked
                                                                                ? field.onChange([...field.value || [], type])
                                                                                : field.onChange(field.value?.filter((value) => value !== type));
                                                                        }}
                                                                    />
                                                                </FormControl>
                                                                <FormLabel className="font-normal">{type}</FormLabel>
                                                            </FormItem>
                                                        );
                                                    }}
                                                />
                                            ))}
                                        </div>
                                        <p className="text-xs text-muted-foreground">Leave all unchecked to apply to all user types.</p>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="applicablePlans"
                                render={() => (
                                    <FormItem>
                                        <FormLabel>Applicable Subscription Plans</FormLabel>
                                        <div className="flex flex-wrap gap-x-6 gap-y-2 p-2 border rounded-md">
                                            {subscriptionPlans.map((plan) => (
                                                <FormField
                                                    key={plan.id}
                                                    control={form.control}
                                                    name="applicablePlans"
                                                    render={({ field }) => {
                                                        return (
                                                            <FormItem key={plan.id} className="flex flex-row items-start space-x-3 space-y-0">
                                                                <FormControl>
                                                                    <Checkbox
                                                                        checked={field.value?.includes(plan.id)}
                                                                        onCheckedChange={(checked) => {
                                                                            return checked
                                                                                ? field.onChange([...field.value || [], plan.id])
                                                                                : field.onChange(field.value?.filter((value) => value !== plan.id));
                                                                        }}
                                                                    />
                                                                </FormControl>
                                                                <FormLabel className="font-normal">{plan.name}</FormLabel>
                                                            </FormItem>
                                                        );
                                                    }}
                                                />
                                            ))}
                                        </div>
                                        <p className="text-xs text-muted-foreground">Leave all unchecked to apply to all plans.</p>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                        </CardContent>
                    </Card>
                </div>
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <FormField
                                control={form.control}
                                name="isActive"
                                render={({ field }) => (
                                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel>Active Status</FormLabel>
                                            <CardDescription>Inactive coupons cannot be used.</CardDescription>
                                        </div>
                                        <FormControl>
                                             <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
            <CardFooter className="flex justify-end gap-2 mt-6 px-0">
                <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? 'Saving...' : 'Save Coupon'}
                </Button>
            </CardFooter>
        </form>
    </Form>
  );
}
