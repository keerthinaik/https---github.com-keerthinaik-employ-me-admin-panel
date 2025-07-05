'use client';

import * as React from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { type SubscriptionPlan } from '@/lib/data';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Check, ChevronsUpDown, Trash2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { currencies, currencyCodes, countries } from '@/lib/enums';

const featureSchema = z.object({
  value: z.string().min(1, 'Feature cannot be empty'),
});

const priceSchema = z.object({
  country: z.string().min(1, 'Country is required'),
  currency: z.enum(currencyCodes),
  amount: z.coerce.number().min(0, 'Amount must be a non-negative number'),
});

const subscriptionPlanSchema = z.object({
  name: z.string().min(1, 'Plan name is required'),
  description: z.string().optional(),
  features: z.array(featureSchema).min(1, 'At least one feature is required'),
  durationInDays: z.coerce.number().min(1, 'Duration must be at least 1 day'),
  prices: z.array(priceSchema).min(1, 'At least one price is required'),
  isActive: z.boolean().default(true),
});

type SubscriptionPlanFormValues = z.infer<typeof subscriptionPlanSchema>;

type SubscriptionPlanFormProps = {
    plan?: SubscriptionPlan;
    userType: 'JobSeeker' | 'Employer' | 'University' | 'Business';
}

export function SubscriptionPlanForm({ plan, userType }: SubscriptionPlanFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
  } = useForm<SubscriptionPlanFormValues>({
    resolver: zodResolver(subscriptionPlanSchema),
    defaultValues: {
        name: plan?.name || '',
        description: plan?.description || '',
        features: plan?.features?.map((value) => ({ value })) || [{ value: '' }],
        durationInDays: plan?.durationInDays || 30,
        prices: plan?.prices && plan.prices.length > 0 ? plan.prices : [{ country: 'United States', currency: 'USD', amount: 0 }],
        isActive: plan?.isActive ?? true,
    }
  });

  const { fields: featureFields, append: appendFeature, remove: removeFeature } = useFieldArray({
    control,
    name: "features"
  });

  const { fields: priceFields, append: appendPrice, remove: removePrice } = useFieldArray({
    control,
    name: "prices",
  });

  const onSubmit = (data: SubscriptionPlanFormValues) => {
    const transformedData = {
        ...data,
        features: data.features.map(f => f.value),
    };
    console.log({ ...transformedData, userType });
    toast({
        title: plan ? 'Plan Updated' : 'Plan Created',
        description: `${transformedData.name} has been successfully ${plan ? 'updated' : 'created'}.`,
    });
    
    let route = '';
    switch(userType) {
        case 'Employer': route = '/employer-plans'; break;
        case 'Business': route = '/business-plans'; break;
        case 'University': route = '/university-plans'; break;
        case 'JobSeeker': route = '/jobseeker-plans'; break;
    }
    router.push(route);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
                 <Card>
                    <CardHeader>
                        <CardTitle>{plan ? 'Edit' : 'Create'} {userType} Plan</CardTitle>
                        <CardDescription>Fill in the details for the subscription plan.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Plan Name</Label>
                            <Input id="name" {...register('name')} />
                            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" {...register('description')} />
                        </div>
                        <div className="space-y-2">
                            <Label>Features</Label>
                            <div className="space-y-3">
                                {featureFields.map((field, index) => (
                                    <div key={field.id} className="flex items-start gap-2">
                                        <div className="flex-1 space-y-1">
                                            <Input {...register(`features.${index}.value`)} placeholder={`Feature ${index + 1}`} />
                                            {errors.features?.[index]?.value && (
                                                <p className="text-sm text-destructive">{errors.features[index]?.value?.message}</p>
                                            )}
                                        </div>
                                        {featureFields.length > 1 && (
                                            <Button type="button" variant="ghost" size="icon" onClick={() => removeFeature(index)} className="text-destructive hover:bg-destructive/10 shrink-0 mt-1">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <Button type="button" variant="outline" size="sm" onClick={() => appendFeature({ value: '' })} className="mt-2">
                                Add Feature
                            </Button>
                            {errors.features?.root && (
                                <p className="text-sm font-medium text-destructive mt-2">{errors.features.root.message}</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Pricing & Duration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="durationInDays">Duration (in days)</Label>
                            <Input id="durationInDays" type="number" {...register('durationInDays')} />
                            {errors.durationInDays && <p className="text-sm text-destructive">{errors.durationInDays.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>Prices</Label>
                             {priceFields.map((field, index) => (
                                <div key={field.id} className="flex items-end gap-2 p-3 border rounded-md bg-muted/50">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 flex-1">
                                        <Controller
                                            name={`prices.${index}.country`}
                                            control={control}
                                            render={({ field }) => (
                                            <div className="space-y-1">
                                                <Label htmlFor={`prices.${index}.country`} className="text-xs">Country</Label>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button variant="outline" role="combobox" className="w-full justify-between bg-background">
                                                            {field.value ? countries.find((c) => c.value === field.value)?.label : "Select country"}
                                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                                        <Command>
                                                            <CommandInput placeholder="Search country..." />
                                                            <CommandEmpty>No country found.</CommandEmpty>
                                                            <CommandGroup>
                                                                {countries.map((c) => (
                                                                    <CommandItem value={c.label} key={c.value} onSelect={() => field.onChange(c.value)}>
                                                                        <Check className={cn("mr-2 h-4 w-4", c.value === field.value ? "opacity-100" : "opacity-0")} />
                                                                        {c.label}
                                                                    </CommandItem>
                                                                ))}
                                                            </CommandGroup>
                                                        </Command>
                                                    </PopoverContent>
                                                </Popover>
                                                {errors.prices?.[index]?.country && <p className="text-sm text-destructive">{errors.prices[index]?.country?.message}</p>}
                                            </div>
                                            )}
                                        />
                                         <Controller
                                            name={`prices.${index}.currency`}
                                            control={control}
                                            render={({ field }) => (
                                                <div className="space-y-1">
                                                    <Label htmlFor={`prices.${index}.currency`} className="text-xs">Currency</Label>
                                                     <Popover>
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                role="combobox"
                                                                className="w-full justify-between bg-background"
                                                            >
                                                            {field.value ? currencies.find((c) => c.value === field.value)?.value : "Select currency"}
                                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                                            <Command>
                                                                <CommandInput placeholder="Search currency..." />
                                                                <CommandEmpty>No currency found.</CommandEmpty>
                                                                <CommandGroup>
                                                                    {currencies.map((c) => (
                                                                    <CommandItem
                                                                        value={c.value}
                                                                        key={c.value}
                                                                        onSelect={() => field.onChange(c.value)}
                                                                    >
                                                                        <Check className={cn("mr-2 h-4 w-4", c.value === field.value ? "opacity-100" : "opacity-0")}/>
                                                                        {c.label}
                                                                    </CommandItem>
                                                                    ))}
                                                                </CommandGroup>
                                                            </Command>
                                                        </PopoverContent>
                                                    </Popover>
                                                    {errors.prices?.[index]?.currency && <p className="text-sm text-destructive">{errors.prices[index]?.currency?.message}</p>}
                                                </div>
                                            )}
                                        />
                                         <div className="space-y-1">
                                            <Label htmlFor={`prices.${index}.amount`} className="text-xs">Amount</Label>
                                            <Input id={`prices.${index}.amount`} type="number" step="0.01" {...register(`prices.${index}.amount`)} />
                                            {errors.prices?.[index]?.amount && <p className="text-sm text-destructive">{errors.prices[index]?.amount?.message}</p>}
                                        </div>
                                    </div>
                                    <Button type="button" variant="ghost" size="icon" onClick={() => removePrice(index)} className="text-destructive hover:bg-destructive/10">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                            {errors.prices?.root && <p className="text-sm text-destructive">{errors.prices.root.message}</p>}
                            {errors.prices && typeof errors.prices.message === 'string' && <p className="text-sm text-destructive">{errors.prices.message}</p>}
                            <Button type="button" variant="outline" size="sm" onClick={() => appendPrice({ country: 'United States', currency: 'USD', amount: 0 })}>
                                Add Price
                            </Button>
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <Label htmlFor="isActive">Active Status</Label>
                                <CardDescription>Inactive plans cannot be subscribed to.</CardDescription>
                            </div>
                            <Controller
                                name="isActive"
                                control={control}
                                render={({ field }) => (
                                    <Switch
                                        id="isActive"
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
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
                {isSubmitting ? 'Saving...' : 'Save Plan'}
            </Button>
        </CardFooter>
    </form>
  );
}
