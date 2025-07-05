
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
import { Switch } from './ui/switch';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon, Check, ChevronsUpDown } from 'lucide-react';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { getCountries, getStates, getCities, createJobseeker, updateJobseeker, getBusinesses, getUniversities } from '@/services/api';
import type { Jobseeker, Country, State, City, Business, University } from '@/lib/types';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from './ui/command';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Skeleton } from './ui/skeleton';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://148.72.244.169:3000';

const jobseekerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be at most 50 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
  phoneNumber: z.string().optional(),
  
  profilePhoto: z.any().optional(),
  
  dateOfBirth: z.date().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  
  address: z.string().optional(),
  country: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  zipCode: z.string().optional(),
  
  businessAssociationId: z.string().nullable().optional(),
  universityAssociationId: z.string().nullable().optional(),

  isVerified: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

type JobseekerFormValues = z.infer<typeof jobseekerSchema>;

type JobseekerFormProps = {
    jobseeker?: Jobseeker;
}

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

export function JobseekerForm({ jobseeker }: JobseekerFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  
  const [countries, setCountries] = React.useState<Country[]>([]);
  const [states, setStates] = React.useState<State[]>([]);
  const [cities, setCities] = React.useState<City[]>([]);
  const [businesses, setBusinesses] = React.useState<Business[]>([]);
  const [universities, setUniversities] = React.useState<University[]>([]);

  const [isLoadingCountries, setIsLoadingCountries] = React.useState(false);
  const [isLoadingStates, setIsLoadingStates] = React.useState(false);
  const [isLoadingCities, setIsLoadingCities] = React.useState(false);
  const [isLoadingAssociations, setIsLoadingAssociations] = React.useState(false);
  
  const [openCountry, setOpenCountry] = React.useState(false);
  const [openState, setOpenState] = React.useState(false);
  const [openCity, setOpenCity] = React.useState(false);
  const [openBusiness, setOpenBusiness] = React.useState(false);
  const [openUniversity, setOpenUniversity] = React.useState(false);
  const [datePickerOpen, setDatePickerOpen] = React.useState(false);

  const [imgSrc, setImgSrc] = React.useState('')
  const imgRef = React.useRef<HTMLImageElement>(null)
  const [crop, setCrop] = React.useState<Crop>()
  const [completedCrop, setCompletedCrop] = React.useState<Crop>()
  const [croppedImageUrl, setCroppedImageUrl] = React.useState<string>('')
  const [dialogOpen, setDialogOpen] = React.useState(false)

  const form = useForm<JobseekerFormValues>({
    resolver: zodResolver(jobseekerSchema),
    defaultValues: {
        name: '',
        email: '',
        password: '',
        phoneNumber: '',
        address: '',
        country: '',
        state: '',
        city: '',
        zipCode: '',
        gender: undefined,
        dateOfBirth: undefined,
        isVerified: false,
        isActive: true,
        profilePhoto: undefined,
        businessAssociationId: null,
        universityAssociationId: null,
    }
  });

  const { control, handleSubmit, formState: { errors, isSubmitting }, setError, setValue, watch, reset } = form;

  const watchedCountry = watch('country');
  const watchedState = watch('state');

  const countryRef = React.useRef(jobseeker?.country);
  const stateRef = React.useRef(jobseeker?.state);

   React.useEffect(() => {
    if (jobseeker) {
      reset({
        ...jobseeker,
        dateOfBirth: jobseeker.dateOfBirth ? new Date(jobseeker.dateOfBirth) : undefined,
        password: '',
        profilePhoto: undefined,
        businessAssociationId: jobseeker.businessAssociationId || null,
        universityAssociationId: jobseeker.universityAssociationId || null,
      });

      if (jobseeker.profilePhoto) {
          const fullUrl = `${API_BASE_URL}${jobseeker.profilePhoto.startsWith('/') ? '' : '/'}${jobseeker.profilePhoto}`;
          setCroppedImageUrl(fullUrl);
      } else {
        setCroppedImageUrl('');
      }
    }
  }, [jobseeker, reset]);
  
  React.useEffect(() => {
    const fetchInitialData = async () => {
        setIsLoadingCountries(true);
        setIsLoadingAssociations(true);
        try {
            const [countryData, businessData, universityData] = await Promise.all([
                getCountries(),
                getBusinesses({ limit: 1000 }),
                getUniversities({ limit: 1000 }),
            ]);
            setCountries(countryData);
            setBusinesses(businessData.data);
            setUniversities(universityData.data);
        } catch (error) {
            toast({ title: "Failed to load initial form data", variant: "destructive" });
        } finally {
            setIsLoadingCountries(false);
            setIsLoadingAssociations(false);
        }
    };
    fetchInitialData();
  }, [toast]);
  
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

  const onError = (errors: any) => {
    toast({
        title: "Validation Error",
        description: "Please check the form for errors and try again.",
        variant: "destructive"
    });
  };

  const onSubmit = async (data: JobseekerFormValues) => {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (key === 'password' && jobseeker && !value) {
        return;
      }
      
      if (value !== undefined && value !== null) {
        if (key === 'profilePhoto' && value instanceof File) {
          formData.append(key, value);
        } else if (value instanceof Date) {
          formData.append(key, value.toISOString());
        } else if (typeof value === 'boolean') {
          formData.append(key, String(value));
        } else if (key !== 'profilePhoto') {
          formData.append(key, String(value));
        }
      }
    });

    try {
        if (jobseeker) {
            await updateJobseeker(jobseeker.id, formData);
        } else {
            await createJobseeker(formData);
        }
        toast({
            title: jobseeker ? 'Jobseeker Updated' : 'Jobseeker Created',
            description: `${data.name} has been successfully ${jobseeker ? 'updated' : 'created'}.`,
        });
        router.push('/jobseekers');
        router.refresh();
    } catch (error: any) {
        if (error.data && error.data.errors) {
            const serverErrors = error.data.errors;
            Object.keys(serverErrors).forEach((key) => {
                if (Object.prototype.hasOwnProperty.call(jobseekerSchema.shape, key)) {
                    setError(key as keyof JobseekerFormValues, {
                        type: 'server',
                        message: serverErrors[key],
                    });
                }
            });

            toast({
                title: 'Could not save jobseeker',
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
            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                             <div className="grid md:grid-cols-2 gap-4">
                                <FormField name="name" control={control} render={({field}) => <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>}/>
                                <FormField name="email" control={control} render={({field}) => <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>}/>
                            </div>
                             <div className="grid md:grid-cols-2 gap-4">
                                <FormField name="phoneNumber" control={control} render={({field}) => <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>}/>
                                <FormField control={control} name="password" render={({ field }) => ( <FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" {...field} placeholder={jobseeker ? "Leave blank to keep unchanged" : ""} /></FormControl><FormMessage /></FormItem>)}/>
                            </div>
                             <div className="grid md:grid-cols-2 gap-4">
                                <FormField control={control} name="dateOfBirth" render={({ field }) => (<FormItem className="flex flex-col"><FormLabel>Date of Birth</FormLabel><Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}><PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal",!field.value && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}</Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={(date) => { field.onChange(date); setDatePickerOpen(false); }} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} /></PopoverContent></Popover><FormMessage /></FormItem>)} />
                                <FormField control={control} name="gender" render={({ field }) => (<FormItem><FormLabel>Gender</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger></FormControl><SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Associations</CardTitle></CardHeader>
                        <CardContent className="grid md:grid-cols-2 gap-4">
                            <FormField
                                control={control}
                                name="businessAssociationId"
                                render={({ field }) => {
                                    const displayValue = React.useMemo(() => {
                                        if (!field.value) return "Select business...";
                                        if (isLoadingAssociations) return <Skeleton className="h-5 w-4/5" />;
                                        const selected = businesses.find(b => b.id === field.value);
                                        return selected ? selected.name : "Select business...";
                                    }, [field.value, businesses, isLoadingAssociations]);

                                    return (
                                        <FormItem>
                                            <FormLabel>Business Association</FormLabel>
                                            <Popover open={openBusiness} onOpenChange={setOpenBusiness}>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button variant="outline" role="combobox" className="w-full justify-between" disabled={isLoadingAssociations}>
                                                            {displayValue}
                                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                                    <Command>
                                                        <CommandInput placeholder="Search business..." />
                                                        <CommandEmpty>No business found.</CommandEmpty>
                                                        <CommandGroup className="max-h-60 overflow-auto">
                                                            <CommandItem value="__none__" onSelect={() => { setValue('businessAssociationId', null); setOpenBusiness(false); }}>None</CommandItem>
                                                            {businesses.map(b => (
                                                                <CommandItem key={b.id} value={b.name} onSelect={() => { setValue('businessAssociationId', b.id); setValue('universityAssociationId', null); setOpenBusiness(false); toast({title: "Business Selected", description: `${b.name} (ID: ${b.id})`}) }}>
                                                                    <Check className={cn("mr-2 h-4 w-4", b.id === field.value ? "opacity-100" : "opacity-0")} />
                                                                    {b.name}
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )
                                }}
                            />
                             <FormField
                                control={control}
                                name="universityAssociationId"
                                render={({ field }) => {
                                    const displayValue = React.useMemo(() => {
                                        if (!field.value) return "Select university...";
                                        if (isLoadingAssociations) return <Skeleton className="h-5 w-4/5" />;
                                        const selected = universities.find(u => u.id === field.value);
                                        return selected ? selected.name : "Select university...";
                                    }, [field.value, universities, isLoadingAssociations]);

                                    return (
                                        <FormItem>
                                            <FormLabel>University Association</FormLabel>
                                            <Popover open={openUniversity} onOpenChange={setOpenUniversity}>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button variant="outline" role="combobox" className="w-full justify-between" disabled={isLoadingAssociations}>
                                                            {displayValue}
                                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                                    <Command>
                                                        <CommandInput placeholder="Search university..." />
                                                        <CommandEmpty>No university found.</CommandEmpty>
                                                        <CommandGroup className="max-h-60 overflow-auto">
                                                            <CommandItem value="__none__" onSelect={() => { setValue('universityAssociationId', null); setOpenUniversity(false); }}>None</CommandItem>
                                                            {universities.map(u => (
                                                                <CommandItem key={u.id} value={u.name} onSelect={() => { setValue('universityAssociationId', u.id); setValue('businessAssociationId', null); setOpenUniversity(false); toast({title: "University Selected", description: `${u.name} (ID: ${u.id})`}) }}>
                                                                    <Check className={cn("mr-2 h-4 w-4", u.id === field.value ? "opacity-100" : "opacity-0")} />
                                                                    {u.name}
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )
                                }}
                            />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Location</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <FormField control={control} name="address" render={({ field }) => ( <FormItem><FormLabel>Address</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                 <FormField control={control} name="country" render={({ field }) => ( <FormItem><FormLabel>Country</FormLabel><Popover open={openCountry} onOpenChange={setOpenCountry}><PopoverTrigger asChild><FormControl><Button variant="outline" role="combobox" className="w-full justify-between">{isLoadingCountries ? <Skeleton className="h-5 w-3/4" /> : field.value ? countries.find(c => c.isoCode === field.value)?.name : "Select country..."}<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-[--radix-popover-trigger-width] p-0"><Command><CommandInput placeholder="Search country..." /><CommandEmpty>No country found.</CommandEmpty><CommandGroup className="max-h-60 overflow-auto">{countries.map(c => ( <CommandItem key={c.isoCode} value={c.name} onSelect={() => { setValue('country', c.isoCode, { shouldValidate: true }); setOpenCountry(false); }}> <Check className={cn("mr-2 h-4 w-4", c.isoCode === field.value ? "opacity-100" : "opacity-0")} /> {c.name}</CommandItem>))}</CommandGroup></Command></PopoverContent></Popover><FormMessage /></FormItem>)}/>
                                <FormField control={control} name="state" render={({ field }) => ( <FormItem><FormLabel>State / Province</FormLabel><Popover open={openState} onOpenChange={setOpenState}><PopoverTrigger asChild><FormControl><Button variant="outline" role="combobox" className="w-full justify-between" disabled={!watchedCountry || isLoadingStates}>{isLoadingStates ? <Skeleton className="h-5 w-3/4" /> : field.value ? states.find(s => s.isoCode === field.value)?.name : "Select state..."}<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-[--radix-popover-trigger-width] p-0"><Command><CommandInput placeholder="Search state..." /><CommandEmpty>No state found.</CommandEmpty><CommandGroup className="max-h-60 overflow-auto">{states.map(s => ( <CommandItem key={s.isoCode} value={s.name} onSelect={() => { setValue('state', s.isoCode, { shouldValidate: true }); setOpenState(false); }}> <Check className={cn("mr-2 h-4 w-4", s.isoCode === field.value ? "opacity-100" : "opacity-0")} /> {s.name}</CommandItem>))}</CommandGroup></Command></PopoverContent></Popover><FormMessage /></FormItem>)}/>
                                <FormField control={control} name="city" render={({ field }) => ( <FormItem><FormLabel>City</FormLabel><Popover open={openCity} onOpenChange={setOpenCity}><PopoverTrigger asChild><FormControl><Button variant="outline" role="combobox" className="w-full justify-between" disabled={!watchedState || isLoadingCities}>{isLoadingCities ? <Skeleton className="h-5 w-3/4" /> : field.value ? field.value : "Select city..."}<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-[--radix-popover-trigger-width] p-0"><Command><CommandInput placeholder="Search city..." /><CommandEmpty>No city found.</CommandEmpty><CommandGroup className="max-h-60 overflow-auto">{cities.map(c => ( <CommandItem key={c.name} value={c.name} onSelect={() => {setValue('city', c.name, { shouldValidate: true }); setOpenCity(false);}}><Check className={cn("mr-2 h-4 w-4", c.name === field.value ? "opacity-100" : "opacity-0")} />{c.name}</CommandItem>))}</CommandGroup></Command></PopoverContent></Popover><FormMessage /></FormItem>)}/>
                            </div>
                            <FormField control={control} name="zipCode" render={({ field }) => (<FormItem><FormLabel>Zip Code</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                        </CardContent>
                    </Card>
                </div>
                <div className="space-y-6">
                    <Card>
                        <CardHeader><CardTitle>Profile Photo</CardTitle></CardHeader>
                        <CardContent>
                            <FormField name="profilePhoto" control={control} render={() => (
                                <FormItem>
                                    <div className="flex flex-col items-center gap-4">
                                        <Avatar className="h-32 w-32">
                                            <AvatarImage src={croppedImageUrl} alt="Jobseeker profile photo" />
                                            <AvatarFallback>{form.getValues('name')?.slice(0,2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <FormControl>
                                            <Input type="file" className="w-full" accept="image/*" onChange={onFileChange} />
                                        </FormControl>
                                        <FormMessage />
                                    </div>
                                </FormItem>
                            )}/>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Account Status</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <FormField control={control} name="isVerified" render={({ field }) => (<FormItem className="flex items-center justify-between rounded-lg border p-4"><div className="space-y-0.5"><FormLabel>Verification</FormLabel></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormMessage /></FormItem>)}/>
                            <FormField control={control} name="isActive" render={({ field }) => (<FormItem className="flex items-center justify-between rounded-lg border p-4"><div className="space-y-0.5"><FormLabel>Active Status</FormLabel></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormMessage /></FormItem>)}/>
                        </CardContent>
                    </Card>
                </div>
            </div>
            <CardFooter className="flex justify-end gap-2 mt-6 px-0">
                <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : jobseeker ? 'Save Changes' : 'Create Jobseeker'}
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
