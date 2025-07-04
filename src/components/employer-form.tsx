
'use client';

import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { type Employer, type Country, type State, type City } from '@/lib/types';
import { Switch } from './ui/switch';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ChevronLeft, ChevronRight, ChevronsUpDown, Check } from 'lucide-react';
import { getCountries, getStates, getCities, updateEmployer, createEmployer } from '@/services/api';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from './ui/command';
import { cn } from '@/lib/utils';
import { Skeleton } from './ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://148.72.244.169:3000';

const employerSchema = z.object({
  name: z.string().min(1, 'Contact person name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
  phoneNumber: z.string().optional(),
  
  address: z.string().optional(),
  country: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  zipCode: z.string().optional(),
  
  companyName: z.string().min(2, 'Company name is required'),
  profilePhoto: z.any().optional(),
  about: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  taxNumber: z.string().optional(),
  taxCertificate: z.any().optional(),
  registrationNumber: z.string().optional(),
  registrationCertificate: z.any().optional(),

  isVerified: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

type EmployerFormValues = z.infer<typeof employerSchema>;

const fieldToTabMap: Record<keyof EmployerFormValues, string> = {
  companyName: 'company',
  name: 'company',
  email: 'company',
  phoneNumber: 'company',
  about: 'company',
  address: 'location',
  country: 'location',
  state: 'location',
  city: 'location',
  zipCode: 'location',
  website: 'legal',
  taxNumber: 'legal',
  registrationNumber: 'legal',
  taxCertificate: 'legal',
  registrationCertificate: 'legal',
  profilePhoto: 'account',
  password: 'account',
  isVerified: 'account',
  isActive: 'account',
};


type EmployerFormProps = {
    employer?: Employer;
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

export function EmployerForm({ employer }: EmployerFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = React.useState('company');
  const TABS = ['company', 'location', 'legal', 'account'];
  
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

  const form = useForm<EmployerFormValues>({
    resolver: zodResolver(employerSchema),
    defaultValues: {
        name: employer?.name || '',
        email: employer?.email || '',
        phoneNumber: employer?.phoneNumber || '',
        address: employer?.address || '',
        country: employer?.country || '',
        state: employer?.state || '',
        city: employer?.city || '',
        zipCode: employer?.zipCode || '',
        companyName: employer?.companyName || '',
        about: employer?.about || '',
        website: employer?.website || '',
        taxNumber: employer?.taxNumber || '',
        registrationNumber: employer?.registrationNumber || '',
        isVerified: employer?.isVerified || false,
        isActive: employer?.isActive ?? true,
        profilePhoto: undefined,
        taxCertificate: undefined,
        registrationCertificate: undefined,
    }
  });

  const { register, handleSubmit, formState: { errors, isSubmitting }, control, setError, watch, setValue } = form;
  
  const watchedCountry = watch('country');
  const watchedState = watch('state');

  const countryRef = React.useRef<string | undefined>();
  const stateRef = React.useRef<string | undefined>();
  
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
    if (employer?.profilePhoto) {
        const fullUrl = `${API_BASE_URL}${employer.profilePhoto.startsWith('/') ? '' : '/'}${employer.profilePhoto}`;
        setCroppedImageUrl(fullUrl);
    }
  }, [employer]);

  React.useEffect(() => {
    const fetchStates = async () => {
      if (watchedCountry) {
        setIsLoadingStates(true);
        setStates([]);
        setCities([]);
        if (countryRef.current !== undefined && countryRef.current !== watchedCountry) {
          setValue('state', '');
          setValue('city', '');
        }
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
    countryRef.current = watchedCountry;
  }, [watchedCountry, toast, setValue]);

  React.useEffect(() => {
    const fetchCities = async () => {
      if (watchedCountry && watchedState) {
        setIsLoadingCities(true);
        setCities([]);
        if (stateRef.current !== undefined && stateRef.current !== watchedState) {
          setValue('city', '');
        }
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

  const onError = (errors: any) => {
    const firstErrorField = Object.keys(errors)[0] as keyof EmployerFormValues;
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

  const onSubmit = async (data: EmployerFormValues) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (['profilePhoto', 'taxCertificate', 'registrationCertificate'].includes(key) && value instanceof FileList) {
          if (value.length > 0) formData.append(key, value[0]);
        } else if (value instanceof File) {
          formData.append(key, value);
        } else if (typeof value === 'boolean') {
          formData.append(key, value.toString());
        } else if (typeof value !== 'object' || Array.isArray(value)) {
           formData.append(key, value as string);
        }
      }
    });

    try {
        if (employer) {
            await updateEmployer(employer.id, formData);
        } else {
            await createEmployer(formData);
        }
        toast({
            title: employer ? 'Employer Updated' : 'Employer Created',
            description: `${data.companyName} has been successfully ${employer ? 'updated' : 'created'}.`,
        });
        router.push('/employers');
        router.refresh();
    } catch (error: any) {
        if (error.data && error.data.errors) {
            Object.keys(error.data.errors).forEach((key) => {
                if (Object.prototype.hasOwnProperty.call(employerSchema.shape, key)) {
                    setError(key as keyof EmployerFormValues, {
                        type: 'server',
                        message: error.data.errors[key],
                    });
                }
            });
            toast({
                title: 'Could not save employer',
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
      <form onSubmit={handleSubmit(onSubmit, onError)}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6">
                  <TabsTrigger value="company">Company Info</TabsTrigger>
                  <TabsTrigger value="location">Location</TabsTrigger>
                  <TabsTrigger value="legal">Legal & Web</TabsTrigger>
                  <TabsTrigger value="account">Account</TabsTrigger>
              </TabsList>
              
              <TabsContent value="company" className="space-y-6">
                  <Card>
                      <CardHeader><CardTitle>Company & Contact Information</CardTitle></CardHeader>
                      <CardContent className="space-y-4">
                          <div className="grid md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                  <Label htmlFor="companyName">Company Name</Label>
                                  <Input id="companyName" {...register('companyName')} />
                                  {errors.companyName && <p className="text-sm text-destructive">{errors.companyName.message}</p>}
                              </div>
                               <div className="space-y-2">
                                  <Label htmlFor="name">Contact Person Name</Label>
                                  <Input id="name" {...register('name')} />
                                  {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                              </div>
                          </div>
                           <div className="grid md:grid-cols-2 gap-4">
                               <div className="space-y-2">
                                  <Label htmlFor="email">Email</Label>
                                  <Input id="email" type="email" {...register('email')} />
                                  {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                              </div>
                              <div className="space-y-2">
                                  <Label htmlFor="phoneNumber">Phone Number</Label>
                                  <Input id="phoneNumber" {...register('phoneNumber')} />
                              </div>
                          </div>
                          <div className="space-y-2">
                              <Label htmlFor="about">About Company</Label>
                              <Textarea id="about" {...register('about')} className="min-h-32" placeholder="Brief description of the company..." />
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
                                          <Popover open={openCountry} onOpenChange={setOpenCountry}>
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
                                                              <CommandItem key={c.isoCode} value={c.name} onSelect={() => { setValue('country', c.isoCode, { shouldValidate: true }); setOpenCountry(false); }}>
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
                                          <Popover open={openState} onOpenChange={setOpenState}>
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
                                                              <CommandItem key={s.isoCode} value={s.name} onSelect={() => { setValue('state', s.isoCode, { shouldValidate: true }); setOpenState(false); }}>
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
                                          <Popover open={openCity} onOpenChange={setOpenCity}>
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
                                                              <CommandItem key={c.name} value={c.name} onSelect={() => {setValue('city', c.name, { shouldValidate: true }); setOpenCity(false);}}>
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

              <TabsContent value="legal" className="space-y-6">
                  <Card>
                      <CardHeader><CardTitle>Website & Legal Information</CardTitle></CardHeader>
                      <CardContent className="space-y-4">
                           <div className="space-y-2">
                              <Label htmlFor="website">Website</Label>
                              <Input id="website" {...register('website')} placeholder="https://..." />
                              {errors.website && <p className="text-sm text-destructive">{errors.website.message}</p>}
                          </div>
                          <div className="grid md:grid-cols-2 gap-4 items-start">
                              <div className="space-y-2">
                                  <Label htmlFor="taxNumber">Tax Number</Label>
                                  <Input id="taxNumber" {...register('taxNumber')} />
                              </div>
                              <div className="space-y-2">
                                  <Label htmlFor="taxCertificate">Tax Certificate</Label>
                                  <Input id="taxCertificate" type="file" {...register('taxCertificate')} accept="application/pdf,image/*,.doc,.docx" />
                                  {employer?.taxCertificate && <p className="text-xs text-muted-foreground mt-1">Current: <a href={employer.taxCertificate} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">View Certificate</a></p>}
                                  {errors.taxCertificate && <p className="text-sm text-destructive">{errors.taxCertificate.message as string}</p>}
                              </div>
                          </div>
                           <div className="grid md:grid-cols-2 gap-4 items-start">
                              <div className="space-y-2">
                                  <Label htmlFor="registrationNumber">Registration Number</Label>
                                  <Input id="registrationNumber" {...register('registrationNumber')} />
                              </div>
                               <div className="space-y-2">
                                  <Label htmlFor="registrationCertificate">Registration Certificate</Label>
                                  <Input id="registrationCertificate" type="file" {...register('registrationCertificate')} accept="application/pdf,image/*,.doc,.docx" />
                                  {employer?.registrationCertificate && <p className="text-xs text-muted-foreground mt-1">Current: <a href={employer.registrationCertificate} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">View Certificate</a></p>}
                                  {errors.registrationCertificate && <p className="text-sm text-destructive">{errors.registrationCertificate.message as string}</p>}
                              </div>
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
                      <CardHeader><CardTitle>Account Settings</CardTitle></CardHeader>
                      <CardContent className="space-y-4">
                          <div className="flex items-center gap-6">
                              <Avatar className="h-20 w-20">
                                  <AvatarImage src={croppedImageUrl} alt="Company profile photo" />
                                  <AvatarFallback>{form.getValues('companyName')?.slice(0,2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <div className="flex-grow space-y-2">
                                  <Label htmlFor="profilePhoto-input">Company Profile Photo</Label>
                                  <Input id="profilePhoto-input" type="file" accept="image/*" onChange={onFileChange} />
                                  <p className="text-xs text-muted-foreground">Image must be at least 200x200px.</p>
                                  {errors.profilePhoto && <p className="text-sm text-destructive">{errors.profilePhoto.message as string}</p>}
                              </div>
                           </div>
                          <div className="space-y-2 pt-4 border-t">
                              <Label htmlFor="password">Set New Password</Label>
                              <Input id="password" type="password" {...register('password')} placeholder={employer ? "Leave blank to keep unchanged" : ""} />
                              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
                          </div>
                          <div className="flex items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                  <Label>Verification Status</Label>
                                  <CardDescription>Indicates if the employer's identity has been verified.</CardDescription>
                              </div>
                              <Controller name="isVerified" control={control} render={({ field }) => (<Switch checked={field.value} onCheckedChange={field.onChange} />)} />
                          </div>
                          <div className="flex items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                  <Label>Active Status</Label>
                                  <CardDescription>Inactive employers cannot log in or post jobs.</CardDescription>
                              </div>
                              <Controller name="isActive" control={control} render={({ field }) => (<Switch checked={field.value} onCheckedChange={field.onChange} />)} />
                          </div>
                      </CardContent>
                  </Card>
                   <div className="flex justify-between">
                      <Button type="button" variant="outline" onClick={goToPrevTab}><ChevronLeft className="mr-2 h-4 w-4" /> Previous</Button>
                  </div>
              </TabsContent>
          </Tabs>
          <CardFooter className="flex justify-end gap-2 mt-6 px-0">
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : employer ? 'Save Changes' : 'Create Employer'}
              </Button>
          </CardFooter>
      </form>
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
