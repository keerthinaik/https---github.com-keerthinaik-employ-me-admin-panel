

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
import { type University, type Country, type State, type City } from '@/lib/types';
import { Switch } from './ui/switch';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { createUniversity, updateUniversity, getCountries, getStates, getCities } from '@/services/api';
import { ChevronLeft, ChevronRight, ChevronsUpDown, Check } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from './ui/command';
import { cn } from '@/lib/utils';
import { Skeleton } from './ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://148.72.244.169:3000';

const universityTypes = ["Public", "Private", "Community College", "Technical Institute", "Research University", "Liberal Arts College", "Online University", "Vocational School", "Other"] as const;

const universitySchema = z.object({
  name: z.string().min(1, 'University name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
  phoneNumber: z.string().optional(),
  
  address: z.string().optional(),
  country: z.string().optional(), // Will store isoCode
  state: z.string().optional(),   // Will store isoCode
  city: z.string().optional(),    // Will store name
  zipCode: z.string().optional(),

  profilePhoto: z.any().optional(),
  about: z.string().optional(),
  
  type: z.enum(universityTypes),
  otherType: z.string().optional(),
  
  isVerified: z.boolean().default(false),
  isActive: z.boolean().default(true),
}).refine(data => {
    if (data.type === 'Other') {
        return !!data.otherType && data.otherType.length > 0;
    }
    return true;
}, {
    message: 'Please specify the university type',
    path: ['otherType'],
});


type UniversityFormValues = z.infer<typeof universitySchema>;

const fieldToTabMap: Record<keyof UniversityFormValues, string> = {
  name: 'university',
  email: 'university',
  phoneNumber: 'university',
  type: 'university',
  otherType: 'university',
  about: 'university',
  address: 'location',
  country: 'location',
  state: 'location',
  city: 'location',
  zipCode: 'location',
  profilePhoto: 'account',
  password: 'account',
  isVerified: 'account',
  isActive: 'account',
};


type UniversityFormProps = {
    university?: University;
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

export function UniversityForm({ university }: UniversityFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = React.useState('university');
  const TABS = ['university', 'location', 'account'];
  
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

  const form = useForm<UniversityFormValues>({
    resolver: zodResolver(universitySchema),
    defaultValues: {
        name: university?.name || '',
        email: university?.email || '',
        phoneNumber: university?.phoneNumber || '',
        address: university?.address || '',
        country: university?.country || '',
        state: university?.state || '',
        city: university?.city || '',
        zipCode: university?.zipCode || '',
        about: university?.about || '',
        type: university?.type || 'Public',
        otherType: university?.otherType || '',
        isVerified: university?.isVerified || false,
        isActive: university?.isActive ?? true,
        profilePhoto: undefined,
    }
  });
  const { register, handleSubmit, formState: { errors, isSubmitting }, control, setError, watch, setValue } = form;

  const selectedType = watch('type');
  const watchedCountry = watch('country');
  const watchedState = watch('state');

  const countryRef = React.useRef(university?.country);
  const stateRef = React.useRef(university?.state);
  
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
    if (university?.profilePhoto) {
        const fullUrl = `${API_BASE_URL}${university.profilePhoto.startsWith('/') ? '' : '/'}${university.profilePhoto}`;
        setCroppedImageUrl(fullUrl);
    }
  }, [university]);

  React.useEffect(() => {
    const fetchStates = async () => {
      if (watchedCountry) {
        setIsLoadingStates(true);
        setStates([]);
        setCities([]);
        if (countryRef.current !== watchedCountry) {
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
        if (stateRef.current !== watchedState) {
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
    const firstErrorField = Object.keys(errors)[0] as keyof UniversityFormValues;
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

  const onSubmit = async (data: UniversityFormValues) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
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
        if (university) {
            await updateUniversity(university.id, formData);
        } else {
            await createUniversity(formData);
        }
        toast({
            title: university ? 'University Updated' : 'University Created',
            description: `${data.name} has been successfully ${university ? 'updated' : 'created'}.`,
        });
        router.push('/universities');
        router.refresh();
    } catch (error: any) {
        if (error.data && error.data.errors) {
            const serverErrors = error.data.errors;
            let firstErrorField: keyof UniversityFormValues | null = null;
            
            Object.keys(serverErrors).forEach((key) => {
                if (!firstErrorField) {
                    firstErrorField = key as keyof UniversityFormValues;
                }
                if (Object.prototype.hasOwnProperty.call(universitySchema._def.schema.shape, key)) {
                    setError(key as keyof UniversityFormValues, {
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
                title: 'Could not save university',
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
               <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="university">University Info</TabsTrigger>
                  <TabsTrigger value="location">Location</TabsTrigger>
                  <TabsTrigger value="account">Account & Media</TabsTrigger>
              </TabsList>

               <TabsContent value="university">
                  <Card>
                      <CardHeader><CardTitle>University Information</CardTitle></CardHeader>
                      <CardContent className="space-y-4">
                          <div className="grid md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                  <Label htmlFor="name">University Name</Label>
                                  <Input id="name" {...register('name')} />
                                  {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                              </div>
                              <div className="space-y-2">
                                  <Label htmlFor="email">Email Address</Label>
                                  <Input id="email" type="email" {...register('email')} />
                                  {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                              </div>
                          </div>
                          <div className="grid md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                  <Label htmlFor="phoneNumber">Phone Number</Label>
                                  <Input id="phoneNumber" {...register('phoneNumber')} />
                              </div>
                              <div className="space-y-2">
                                  <Label>Type</Label>
                                  <Controller
                                      name="type"
                                      control={control}
                                      render={({ field }) => (
                                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                                              <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                                              <SelectContent>
                                                  {universityTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                                              </SelectContent>
                                          </Select>
                                      )}
                                  />
                              </div>
                          </div>
                          {selectedType === 'Other' && (
                               <div className="space-y-2">
                                  <Label htmlFor="otherType">Please Specify Type</Label>
                                  <Input id="otherType" {...register('otherType')} />
                                  {errors.otherType && <p className="text-sm text-destructive">{errors.otherType.message}</p>}
                              </div>
                          )}
                          <div className="space-y-2">
                              <Label htmlFor="about">About University</Label>
                              <Textarea id="about" {...register('about')} placeholder="Brief description of the university..."/>
                          </div>
                      </CardContent>
                  </Card>
                  <div className="mt-6 flex justify-end">
                      <Button type="button" onClick={goToNextTab}>Next <ChevronRight className="ml-2 h-4 w-4" /></Button>
                  </div>
              </TabsContent>

               <TabsContent value="location">
                   <Card>
                      <CardHeader><CardTitle>Location Information</CardTitle></CardHeader>
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
                                                      <CommandGroup className="max-h-60 overflow-auto">
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
                                                      <CommandGroup className="max-h-60 overflow-auto">
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
                                                      <CommandGroup className="max-h-60 overflow-auto">
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

               <TabsContent value="account">
                   <Card className="mb-6">
                      <CardHeader><CardTitle>Media & Account</CardTitle></CardHeader>
                      <CardContent className="space-y-4">
                           <div className="flex items-center gap-6">
                            <Avatar className="h-20 w-20">
                                <AvatarImage src={croppedImageUrl} alt="University profile photo" />
                                <AvatarFallback>{form.getValues('name')?.slice(0,2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="flex-grow space-y-2">
                                <Label htmlFor="profilePhoto-input">Profile Photo</Label>
                                <Input id="profilePhoto-input" type="file" accept="image/*" onChange={onFileChange} />
                                <p className="text-xs text-muted-foreground">Image must be at least 200x200px.</p>
                                {errors.profilePhoto && <p className="text-sm text-destructive">{errors.profilePhoto.message as string}</p>}
                            </div>
                         </div>
                           <div className="space-y-2 pt-4 border-t">
                              <Label htmlFor="password">Set New Password</Label>
                              <Input id="password" type="password" {...register('password')} placeholder={university ? "Leave blank to keep unchanged" : ""} />
                              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
                          </div>
                      </CardContent>
                  </Card>
                   <Card>
                      <CardHeader><CardTitle>Account Settings</CardTitle></CardHeader>
                      <CardContent className="space-y-4">
                          <div className="flex items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                  <Label>Verification Status</Label>
                                  <CardDescription>Indicates if the university has been verified.</CardDescription>
                              </div>
                              <Controller name="isVerified" control={control} render={({ field }) => (<Switch checked={field.value} onCheckedChange={field.onChange} />)} />
                          </div>
                          <div className="flex items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                  <Label>Active Status</Label>
                                  <CardDescription>Inactive universities cannot be associated with new jobseekers.</CardDescription>
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
                {isSubmitting ? 'Saving...' : 'Save Changes'}
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




