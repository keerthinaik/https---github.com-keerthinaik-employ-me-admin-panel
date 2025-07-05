

'use client';

import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://148.72.244.169:3000';

const businessSchema = z.object({
  name: z.string().min(1, 'Business name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
  phoneNumber: z.string().regex(/^\+?[0-9\s-()]{7,20}$/, "Please enter a valid phone number").optional().or(z.literal('')),
  
  address: z.string().optional(),
  country: z.string().optional(), // Will store isoCode
  state: z.string().optional(),   // Will store isoCode
  city: z.string().optional(),    // Will store name
  zipCode: z.string().optional(),

  profilePhoto: z.any().optional(),
  about: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),

  isVerified: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

type BusinessFormValues = z.infer<typeof businessSchema>;

const fieldToTabMap: Record<keyof BusinessFormValues, string> = {
  name: 'business',
  email: 'business',
  phoneNumber: 'business',
  about: 'business',
  address: 'location',
  country: 'location',
  state: 'location',
  city: 'location',
  zipCode: 'location',
  website: 'account',
  profilePhoto: 'account',
  password: 'account',
  isVerified: 'account',
  isActive: 'account',
};


type BusinessFormProps = {
    business?: Business;
}

// Function to center the crop
function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}


export function BusinessForm({ business }: BusinessFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = React.useState('business');
  
  const [countries, setCountries] = React.useState<Country[]>([]);
  const [states, setStates] = React.useState<State[]>([]);
  const [cities, setCities] = React.useState<City[]>([]);

  const [isLoadingCountries, setIsLoadingCountries] = React.useState(false);
  const [isLoadingStates, setIsLoadingStates] = React.useState(false);
  const [isLoadingCities, setIsLoadingCities] = React.useState(false);
  
  const [openCountry, setOpenCountry] = React.useState(false);
  const [openState, setOpenState] = React.useState(false);
  const [openCity, setOpenCity] = React.useState(false);

  const [imgSrc, setImgSrc] = React.useState('')
  const imgRef = React.useRef<HTMLImageElement>(null)
  const [crop, setCrop] = React.useState<Crop>()
  const [completedCrop, setCompletedCrop] = React.useState<Crop>()
  const [croppedImageUrl, setCroppedImageUrl] = React.useState<string>('')
  const [dialogOpen, setDialogOpen] = React.useState(false)

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
        profilePhoto: undefined,
    }
  });

  const { handleSubmit, formState: { errors, isSubmitting }, control, setError, watch, setValue } = form;

  const watchedCountry = watch('country');
  const watchedState = watch('state');

  const countryRef = React.useRef(business?.country);
  const stateRef = React.useRef(business?.state);

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
    if (business?.profilePhoto) {
        const fullUrl = `${API_BASE_URL}${business.profilePhoto.startsWith('/') ? '' : '/'}${business.profilePhoto}`;
        setCroppedImageUrl(fullUrl);
    }
  }, [business]);

  React.useEffect(() => {
    const fetchStates = async () => {
      if (watchedCountry) {
        setIsLoadingStates(true);
        if (countryRef.current !== watchedCountry) {
          setValue('state', '');
          setValue('city', '');
        }
        setStates([]);
        setCities([]);
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
    if(watchedCountry) fetchStates();
    countryRef.current = watchedCountry;
  }, [watchedCountry, toast, setValue]);

  React.useEffect(() => {
    const fetchCities = async () => {
      if (watchedCountry && watchedState) {
        setIsLoadingCities(true);
        if (stateRef.current !== watchedState) {
           setValue('city', '');
        }
        setCities([]);
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
    if(watchedState) fetchCities();
    stateRef.current = watchedState;
  }, [watchedCountry, watchedState, toast, setValue]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader()
      reader.addEventListener('load', () => setImgSrc(reader.result?.toString() || ''))
      reader.readAsDataURL(file)
      setDialogOpen(true)
    }
  }

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    if (width < 200 || height < 200) {
      toast({
        title: 'Image Too Small',
        description: 'Please select an image that is at least 200x200 pixels.',
        variant: 'destructive',
      });
      setDialogOpen(false);
      setImgSrc('');
      return;
    }
    setCrop(centerAspectCrop(width, height, 1));
  }

  const handleCropImage = async () => {
    const image = imgRef.current
    if (!image || !completedCrop || !completedCrop.width || !completedCrop.height) {
      toast({ title: "Crop Error", description: "Could not crop image. Please try again.", variant: "destructive" });
      return;
    }
    
    const canvas = document.createElement('canvas')
    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height
    
    canvas.width = completedCrop.width
    canvas.height = completedCrop.height
    
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      toast({ title: "Crop Error", description: "Could not process image.", variant: "destructive" });
      return;
    }

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    );

    canvas.toBlob((blob) => {
        if (!blob) {
            toast({ title: "Crop Error", description: "Failed to create image blob.", variant: "destructive" });
            return;
        }
        const croppedUrl = URL.createObjectURL(blob);
        setCroppedImageUrl(croppedUrl);
        setValue('profilePhoto', new File([blob], 'profilePhoto.jpg', { type: 'image/jpeg' }), { shouldValidate: true });
        setDialogOpen(false);
    }, 'image/jpeg');
  }

   const onError = (errors: any) => {
    const firstErrorField = Object.keys(errors)[0] as keyof BusinessFormValues;
    if (firstErrorField) {
      const tab = fieldToTabMap[firstErrorField];
      if (tab && tab !== activeTab) {
        setActiveTab(tab);
      }
    }
    toast({
        title: "Validation Error",
        description: "Please check the form for errors and try again.",
        variant: "destructive"
    });
  };

  const onSubmit = async (data: BusinessFormValues) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      // Exclude password if it's empty during an update
      if (business && key === 'password' && !value) {
          return;
      }
      if (value !== undefined && value !== null && value !== '') {
        if (key === 'profilePhoto' && value instanceof File) {
          formData.append('profilePhoto', value);
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
            const serverErrors = error.data.errors;
            let firstErrorField: keyof BusinessFormValues | null = null;
            
            Object.keys(serverErrors).forEach((key) => {
                if (!firstErrorField) {
                    firstErrorField = key as keyof BusinessFormValues;
                }
                if (Object.prototype.hasOwnProperty.call(businessSchema.shape, key)) {
                    setError(key as keyof BusinessFormValues, {
                        type: 'server',
                        message: serverErrors[key],
                    });
                }
            });

             if (firstErrorField) {
                const tab = fieldToTabMap[firstErrorField];
                if (tab && tab !== activeTab) {
                    setActiveTab(tab);
                }
            }

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
    <>
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit, onError)}>
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
                                <FormField
                                    control={control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Business Name</FormLabel>
                                            <FormControl><Input {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl><Input type="email" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={control}
                                name="phoneNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phone Number</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={control}
                                name="about"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>About Business</FormLabel>
                                        <FormControl><Textarea {...field} className="min-h-32" placeholder="Brief description of the business..." /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="location" className="space-y-6">
                    <Card>
                        <CardHeader><CardTitle>Location</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <FormField
                                control={control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Address</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <FormField
                                    control={control}
                                    name="country"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Country</FormLabel>
                                            <Popover open={openCountry} onOpenChange={setOpenCountry}>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button variant="outline" role="combobox" className="w-full justify-between">
                                                            {isLoadingCountries ? <Skeleton className="h-5 w-3/4" /> : field.value ? countries.find(c => c.isoCode === field.value)?.name : "Select country..."}
                                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                                    <Command>
                                                        <CommandInput placeholder="Search country..." />
                                                        <CommandEmpty>No country found.</CommandEmpty>
                                                        <CommandGroup className="max-h-60 overflow-auto">
                                                            {countries.map(c => (
                                                                <CommandItem key={c.isoCode} value={c.name} onSelect={() => { setValue('country', c.isoCode); setOpenCountry(false); }}>
                                                                    <Check className={cn("mr-2 h-4 w-4", c.isoCode === field.value ? "opacity-100" : "opacity-0")} />
                                                                    {c.name}
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={control}
                                    name="state"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>State / Province</FormLabel>
                                            <Popover open={openState} onOpenChange={setOpenState}>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button variant="outline" role="combobox" className="w-full justify-between" disabled={!watchedCountry || isLoadingStates}>
                                                            {isLoadingStates ? <Skeleton className="h-5 w-3/4" /> : field.value ? states.find(s => s.isoCode === field.value)?.name : "Select state..."}
                                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                                    <Command>
                                                        <CommandInput placeholder="Search state..." />
                                                        <CommandEmpty>No state found.</CommandEmpty>
                                                        <CommandGroup className="max-h-60 overflow-auto">
                                                            {states.map(s => (
                                                                <CommandItem key={s.isoCode} value={s.name} onSelect={() => { setValue('state', s.isoCode); setOpenState(false); }}>
                                                                    <Check className={cn("mr-2 h-4 w-4", s.isoCode === field.value ? "opacity-100" : "opacity-0")} />
                                                                    {s.name}
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={control}
                                    name="city"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>City</FormLabel>
                                            <Popover open={openCity} onOpenChange={setOpenCity}>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button variant="outline" role="combobox" className="w-full justify-between" disabled={!watchedState || isLoadingCities}>
                                                            {isLoadingCities ? <Skeleton className="h-5 w-3/4" /> : field.value ? field.value : "Select city..."}
                                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                                    <Command>
                                                        <CommandInput placeholder="Search city..." />
                                                        <CommandEmpty>No city found.</CommandEmpty>
                                                        <CommandGroup className="max-h-60 overflow-auto">
                                                            {cities.map(c => (
                                                                <CommandItem key={c.name} value={c.name} onSelect={() => {setValue('city', c.name); setOpenCity(false);}}>
                                                                    <Check className={cn("mr-2 h-4 w-4", c.name === field.value ? "opacity-100" : "opacity-0")} />
                                                                    {c.name}
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                             <FormField
                                control={control}
                                name="zipCode"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Zip Code</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
                
                <TabsContent value="account" className="space-y-6">
                    <Card>
                        <CardHeader><CardTitle>Media & Website</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <FormField
                                control={control}
                                name="website"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Website</FormLabel>
                                        <FormControl><Input {...field} placeholder="https://..." /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="flex items-center gap-6">
                                <Avatar className="h-20 w-20">
                                    <AvatarImage src={croppedImageUrl} alt="Company profile photo" />
                                    <AvatarFallback>{form.getValues('name')?.slice(0,2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="flex-grow space-y-2">
                                    <FormLabel htmlFor="profilePhoto-input">Profile Photo</FormLabel>
                                    <Input id="profilePhoto-input" type="file" accept="image/*" onChange={onFileChange} />
                                    <p className="text-xs text-muted-foreground">Image must be at least 200x200px.</p>
                                    {errors.profilePhoto && <p className="text-sm text-destructive">{errors.profilePhoto.message as string}</p>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Account Settings</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <FormField
                                control={control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Set New Password</FormLabel>
                                        <FormControl><Input type="password" {...field} placeholder={business ? "Leave blank to keep unchanged" : ""} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={control}
                                name="isVerified"
                                render={({ field }) => (
                                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel>Verification Status</FormLabel>
                                            <CardDescription>Indicates if the business has been verified.</CardDescription>
                                        </div>
                                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={control}
                                name="isActive"
                                render={({ field }) => (
                                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel>Active Status</FormLabel>
                                            <CardDescription>Inactive businesses cannot be associated with new jobseekers.</CardDescription>
                                        </div>
                                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
            <CardFooter className="flex justify-end gap-2 mt-6 px-0">
                <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : business ? 'Save Changes' : 'Create Business'}
                </Button>
            </CardFooter>
        </form>
      </Form>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
            <DialogHeader>
                <DialogTitle>Crop your profile photo</DialogTitle>
            </DialogHeader>
            {imgSrc && (
                <ReactCrop
                    crop={crop}
                    onChange={(_, percentCrop) => setCrop(percentCrop)}
                    onComplete={(c) => setCompletedCrop(c)}
                    aspect={1}
                    circularCrop
                    minWidth={200}
                    minHeight={200}
                >
                    <img
                        ref={imgRef}
                        alt="Crop me"
                        src={imgSrc}
                        onLoad={onImageLoad}
                    />
                </ReactCrop>
            )}
            <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleCropImage}>Crop & Save</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
