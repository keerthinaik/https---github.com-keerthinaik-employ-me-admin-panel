

'use client';

import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { Business, Country, State, City } from '@/lib/types';
import { Switch } from './ui/switch';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { createBusiness, updateBusiness, getCountries, getStates, getCities } from '@/services/api';
import { ChevronLeft, ChevronRight, ChevronsUpDown, Check } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from './ui/command';
import { cn } from '@/lib/utils';
import { Skeleton } from './ui/skeleton';

const businessSchema = z.object({
  name: z.string().min(1, 'Business name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
  phoneNumber: z.string().optional(),
  
  address: z.string().optional(),
  country: z.string().optional(), // Will store isoCode
  state: z.string().optional(),   // Will store isoCode
  city: z.string().optional(),    // Will store name
  zipCode: z.string().optional(),

  logo: z.any().optional(),
  about: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),

  isVerified: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

type BusinessFormValues = z.infer<typeof businessSchema>;

type BusinessFormProps = {
    business?: Business;
}

export function BusinessForm({ business }: BusinessFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = React.useState('business');
  const TABS = ['business', 'location', 'account'];

  const [countries, setCountries] = React.useState<Country[]>([]);
  const [states, setStates] = React.useState<State[]>([]);
  const [cities, setCities] = React.useState<City[]>([]);

  const [isLoadingCountries, setIsLoadingCountries] = React.useState(false);
  const [isLoadingStates, setIsLoadingStates] = React.useState(false);
  const [isLoadingCities, setIsLoadingCities] = React.useState(false);

  const form = useForm<BusinessFormValues>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
        name: business?.name || '',
        email: business?.email || '',
        phoneNumber: business?.phoneNumber || '',
        address: business?.address || '',
        country: business?.country || '',
        state: business?.state || '',
        city: business?.city || '',
        zipCode: business?.zipCode || '',
        about: business?.about || '',
        website: business?.website || '',
        isVerified: business?.isVerified || false,
        isActive: business?.isActive ?? true,
        logo: undefined,
    }
  });

  const { register, handleSubmit, formState: { errors, isSubmitting }, control, setError, watch, setValue } = form;

  const watchedCountry = watch('country');
  const watchedState = watch('state');

  React.useEffect(() => {
    const fetchCountries = async () => {
      setIsLoadingCountries(true);
      try {
        const countryData = await getCountries();
        setCountries(countryData);
      } catch (error) {
        toast({ title: "Failed to load countries", variant: "destructive" });
      } finally {
        setIsLoadingCountries(false);
      }
    };
    fetchCountries();
  }, [toast]);

  React.useEffect(() => {
    const fetchStates = async () => {
      if (watchedCountry) {
        setIsLoadingStates(true);
        setStates([]);
        setCities([]);
        setValue('state', '');
        setValue('city', '');
        try {
          const stateData = await getStates(watchedCountry);
          setStates(stateData);
        } catch (error) {
          toast({ title: "Failed to load states", variant: "destructive" });
        } finally {
          setIsLoadingStates(false);
        }
      }
    };
    fetchStates();
  }, [watchedCountry, toast, setValue]);

  React.useEffect(() => {
    const fetchCities = async () => {
      if (watchedCountry && watchedState) {
        setIsLoadingCities(true);
        setCities([]);
        setValue('city', '');
        try {
          const cityData = await getCities(watchedCountry, watchedState);
          setCities(cityData);
        } catch (error) {
          toast({ title: "Failed to load cities", variant: "destructive" });
        } finally {
          setIsLoadingCities(false);
        }
      }
    };
    fetchCities();
  }, [watchedCountry, watchedState, toast, setValue]);

  const goToNextTab = () => {
    const currentIndex = TABS.indexOf(activeTab);
    if (currentIndex < TABS.length - 1) {
        setActiveTab(TABS[currentIndex + 1]);
    }
  };

  const goToPrevTab = () => {
     const currentIndex = TABS.indexOf(activeTab);
    if (currentIndex > 0) {
        setActiveTab(TABS[currentIndex - 1]);
    }
  };

  const onSubmit = async (data: BusinessFormValues) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (key === 'logo' && value instanceof FileList && value.length > 0) {
          formData.append(key, value[0]);
        } else if (typeof value === 'boolean') {
          formData.append(key, value.toString());
        } else if (typeof value !== 'object' || Array.isArray(value)) {
           formData.append(key, value as string);
        }
      }
    });

    try {
        if (business) {
            await updateBusiness(business.id, formData);
        } else {
            await createBusiness(formData);
        }
        toast({
            title: business ? 'Business Updated' : 'Business Created',
            description: `${data.name} has been successfully ${business ? 'updated' : 'created'}.`,
        });
        router.push('/businesses');
        router.refresh();
    } catch (error: any) {
        if (error.data && error.data.errors) {
            Object.keys(error.data.errors).forEach((key) => {
                if (Object.prototype.hasOwnProperty.call(businessSchema.shape, key)) {
                    setError(key as keyof BusinessFormValues, {
                        type: 'server',
                        message: error.data.errors[key],
                    });
                }
            });
            toast({
                title: 'Could not save business',
                description: error.data.message || 'Please correct the errors and try again.',
                variant: 'destructive',
            });
        } else {
           toast({
              title: 'An error occurred',
              description: error.message,
              variant: 'destructive',
          });
        }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="business">Business Info</TabsTrigger>
                <TabsTrigger value="location">Location</TabsTrigger>
                <TabsTrigger value="account">Account & Media</TabsTrigger>
            </TabsList>
            
            <TabsContent value="business" className="space-y-6">
                <Card>
                    <CardHeader><CardTitle>Business Information</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Business Name</Label>
                                <Input id="name" {...register('name')} />
                                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" {...register('email')} />
                                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phoneNumber">Phone Number</Label>
                            <Input id="phoneNumber" {...register('phoneNumber')} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="about">About Business</Label>
                            <Textarea id="about" {...register('about')} className="min-h-32" placeholder="Brief description of the business..." />
                        </div>
                    </CardContent>
                </Card>
                <div className="mt-6 flex justify-end">
                    <Button type="button" onClick={goToNextTab}>Next <ChevronRight className="ml-2 h-4 w-4" /></Button>
                </div>
            </TabsContent>

            <TabsContent value="location" className="space-y-6">
                 <Card>
                    <CardHeader><CardTitle>Location</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="address">Address</Label>
                            <Input id="address" {...register('address')} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                           <Controller
                                name="country"
                                control={control}
                                render={({ field }) => (
                                    <div className="space-y-2">
                                        <Label>Country</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" role="combobox" className="w-full justify-between">
                                                    {isLoadingCountries ? <Skeleton className="h-5 w-3/4" /> : field.value ? countries.find(c => c.isoCode === field.value)?.name : "Select country..."}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                                <Command>
                                                    <CommandInput placeholder="Search country..." />
                                                    <CommandEmpty>No country found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {countries.map(c => (
                                                            <CommandItem key={c.isoCode} value={c.name} onSelect={() => { setValue('country', c.isoCode); setValue('state', ''); setValue('city', ''); }}>
                                                                <Check className={cn("mr-2 h-4 w-4", c.isoCode === field.value ? "opacity-100" : "opacity-0")} />
                                                                {c.name}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                )}
                            />
                            <Controller
                                name="state"
                                control={control}
                                render={({ field }) => (
                                    <div className="space-y-2">
                                        <Label>State / Province</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" role="combobox" className="w-full justify-between" disabled={!watchedCountry || isLoadingStates}>
                                                     {isLoadingStates ? <Skeleton className="h-5 w-3/4" /> : field.value ? states.find(s => s.isoCode === field.value)?.name : "Select state..."}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                                <Command>
                                                    <CommandInput placeholder="Search state..." />
                                                    <CommandEmpty>No state found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {states.map(s => (
                                                            <CommandItem key={s.isoCode} value={s.name} onSelect={() => { setValue('state', s.isoCode); setValue('city', ''); }}>
                                                                <Check className={cn("mr-2 h-4 w-4", s.isoCode === field.value ? "opacity-100" : "opacity-0")} />
                                                                {s.name}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                )}
                            />
                            <Controller
                                name="city"
                                control={control}
                                render={({ field }) => (
                                     <div className="space-y-2">
                                        <Label>City</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" role="combobox" className="w-full justify-between" disabled={!watchedState || isLoadingCities}>
                                                     {isLoadingCities ? <Skeleton className="h-5 w-3/4" /> : field.value ? field.value : "Select city..."}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                                <Command>
                                                    <CommandInput placeholder="Search city..." />
                                                    <CommandEmpty>No city found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {cities.map(c => (
                                                            <CommandItem key={c.name} value={c.name} onSelect={() => setValue('city', c.name)}>
                                                                <Check className={cn("mr-2 h-4 w-4", c.name === field.value ? "opacity-100" : "opacity-0")} />
                                                                {c.name}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                )}
                            />
                        </div>
                        <div className="space-y-2">
                           <Label htmlFor="zipCode">Zip Code</Label>
                           <Input id="zipCode" {...register('zipCode')} />
                        </div>
                    </CardContent>
                </Card>
                 <div className="mt-6 flex justify-between">
                    <Button type="button" variant="outline" onClick={goToPrevTab}><ChevronLeft className="mr-2 h-4 w-4" /> Previous</Button>
                    <Button type="button" onClick={goToNextTab}>Next <ChevronRight className="ml-2 h-4 w-4" /></Button>
                </div>
            </TabsContent>
            
            <TabsContent value="account" className="space-y-6">
                <Card>
                    <CardHeader><CardTitle>Media & Website</CardTitle></CardHeader>
                     <CardContent className="space-y-4">
                         <div className="space-y-2">
                            <Label htmlFor="website">Website</Label>
                            <Input id="website" {...register('website')} placeholder="https://..." />
                            {errors.website && <p className="text-sm text-destructive">{errors.website.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="logo">Company Logo</Label>
                            <Input id="logo" type="file" {...register('logo')} accept="image/*,.svg" />
                            {business?.logo && <p className="text-sm text-muted-foreground mt-1">Current: <a href={`http://148.72.244.169:3000${business.logo}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">View Logo</a></p>}
                            {errors.logo && <p className="text-sm text-destructive">{errors.logo.message as string}</p>}
                        </div>
                     </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Account Settings</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="password">Set New Password</Label>
                            <Input id="password" type="password" {...register('password')} placeholder={business ? "Leave blank to keep unchanged" : ""} />
                            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
                        </div>
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <Label>Verification Status</Label>
                                <CardDescription>Indicates if the business has been verified.</CardDescription>
                            </div>
                            <Controller name="isVerified" control={control} render={({ field }) => (<Switch checked={field.value} onCheckedChange={field.onChange} />)} />
                        </div>
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <Label>Active Status</Label>
                                <CardDescription>Inactive businesses cannot be associated with new jobseekers.</CardDescription>
                            </div>
                            <Controller name="isActive" control={control} render={({ field }) => (<Switch checked={field.value} onCheckedChange={field.onChange} />)} />
                        </div>
                    </CardContent>
                </Card>
                <div className="mt-6 flex justify-between">
                    <Button type="button" variant="outline" onClick={goToPrevTab}><ChevronLeft className="mr-2 h-4 w-4" /> Previous</Button>
                </div>
            </TabsContent>
        </Tabs>
        <CardFooter className="flex justify-end gap-2 mt-6 px-0">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : business ? 'Save Changes' : 'Create Business'}
            </Button>
        </CardFooter>
    </form>
  );
}

