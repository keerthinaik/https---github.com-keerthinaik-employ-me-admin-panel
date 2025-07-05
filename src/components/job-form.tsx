

'use client';

import * as React from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { type Job, type Question, type SkillCategory, type Employer, type JobCategory, type Country, type State, type City } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { CalendarIcon, Check, ChevronsUpDown, Loader2, Sparkles, Trash2, Wand2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { suggestJobTitles } from '@/ai/flows/suggest-job-title-flow';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from './ui/badge';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from './ui/command';
import { getEmployers, getJobCategories, getSkills, getSkillCategories, createJob, updateJob, createSkill, getCountries, getStates, getCities } from '@/services/api';
import type { Skill } from '@/lib/types';
import { Skeleton } from './ui/skeleton';
import { Switch } from './ui/switch';
import { Textarea } from './ui/textarea';


const questionSchema = z.object({
  question: z.string().min(1, 'Question text is required'),
  type: z.enum(['boolean', 'single-choice', 'multi-choice', 'text']),
  options: z.array(z.string()).optional(),
  _id: z.string().optional(),
});

const jobSchema = z.object({
  title: z.string().min(3, 'Job title must be at least 3 characters'),
  description: z.string().min(1, 'Description is required'),
  minExperience: z.coerce.number().min(0),
  maxExperience: z.coerce.number().min(0),
  numberOfPosts: z.coerce.number().optional().or(z.literal('')),
  type: z.enum(['full-time', 'part-time', 'contract']),
  payrollType: z.enum(['contract', 'direct']),
  contractDuration: z.coerce.number().optional().or(z.literal('')),
  contractDurationUnit: z.enum(['days', 'months', 'years']).optional(),
  expectedMinHoursPerWeek: z.coerce.number().optional().or(z.literal('')),
  expectedMaxHoursPerWeek: z.coerce.number().optional().or(z.literal('')),
  shiftType: z.enum(['morning', 'evening', 'regular', 'night', 'flexible', 'weekend', 'us', 'uk', 'other']),
  otherShiftType: z.string().optional(),
  ctcCurrency: z.string().min(1, 'Currency is required'),
  ctcMinAmount: z.coerce.number().optional().or(z.literal('')),
  ctcMaxAmount: z.coerce.number().optional().or(z.literal('')),
  ctcFrequency: z.enum(['weekly', 'yearly', 'monthly']),
  supplementalPayments: z.array(z.string()).optional(),
  otherSupplementalPaymentType: z.string().optional(),
  jobCategory: z.string().min(1, 'Job Category is required'),
  employer: z.string().min(1, 'Employer is required'),
  workMode: z.array(z.string()).min(1, 'At least one work mode is required'),
  otherWorkModeType: z.string().optional(),
  expectedStartDate: z.date().optional(),
  skills: z.array(z.string()).optional(),
  address: z.string().optional(),
  country: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  zipCode: z.string().optional(),
  isActive: z.boolean().default(false),
  languagesRequired: z.array(z.string()).optional(),
  benefits: z.array(z.string()).optional(),
  questions: z.array(questionSchema).optional(),
}).refine(data => !data.maxExperience || !data.minExperience || data.maxExperience >= data.minExperience, {
    message: "Max experience must be greater than or equal to min experience",
    path: ["maxExperience"],
});

type JobFormValues = z.infer<typeof jobSchema>;

const fieldToTabMap: Record<keyof JobFormValues, string> = {
  title: 'details',
  description: 'details',
  employer: 'details',
  jobCategory: 'details',
  type: 'type',
  payrollType: 'type',
  contractDuration: 'type',
  contractDurationUnit: 'type',
  expectedMinHoursPerWeek: 'type',
  expectedMaxHoursPerWeek: 'type',
  shiftType: 'type',
  otherShiftType: 'type',
  ctcCurrency: 'compensation',
  ctcMinAmount: 'compensation',
  ctcMaxAmount: 'compensation',
  ctcFrequency: 'compensation',
  supplementalPayments: 'compensation',
  otherSupplementalPaymentType: 'compensation',
  benefits: 'compensation',
  minExperience: 'skills',
  maxExperience: 'skills',
  skills: 'skills',
  languagesRequired: 'skills',
  workMode: 'logistics',
  otherWorkModeType: 'logistics',
  address: 'logistics',
  country: 'logistics',
  state: 'logistics',
  city: 'logistics',
  zipCode: 'logistics',
  expectedStartDate: 'logistics',
  questions: 'questions',
  isActive: 'publish',
  numberOfPosts: 'publish',
};

const currencies = [
  { value: 'USD', label: 'USD - United States Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'JPY', label: 'JPY - Japanese Yen' },
  { value: 'GBP', label: 'GBP - British Pound Sterling' },
  { value: 'AUD', label: 'AUD - Australian Dollar' },
  { value: 'CAD', label: 'CAD - Canadian Dollar' },
  { value: 'CHF', label: 'CHF - Swiss Franc' },
  { value: 'INR', label: 'INR - Indian Rupee' },
  { value: 'CNY', label: 'CNY - Chinese Yuan' },
];

export function JobForm({ job }: { job?: Job }) {
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = React.useState('details');

  const [employers, setEmployers] = React.useState<Employer[]>([]);
  const [jobCategories, setJobCategories] = React.useState<JobCategory[]>([]);
  const [allSkills, setAllSkills] = React.useState<Skill[]>([]);
  const [skillCategories, setSkillCategories] = React.useState<SkillCategory[]>([]);
  
  const [countries, setCountries] = React.useState<Country[]>([]);
  const [states, setStates] = React.useState<State[]>([]);
  const [cities, setCities] = React.useState<City[]>([]);

  const [isLoadingData, setIsLoadingData] = React.useState(true);
  const [isLoadingCountries, setIsLoadingCountries] = React.useState(false);
  const [isLoadingStates, setIsLoadingStates] = React.useState(false);
  const [isLoadingCities, setIsLoadingCities] = React.useState(false);

  const [isSuggesting, setIsSuggesting] = React.useState(false);
  const [suggestedTitles, setSuggestedTitles] = React.useState<string[]>([]);
  
  const [openCurrency, setOpenCurrency] = React.useState(false);
  const [openEmployer, setOpenEmployer] = React.useState(false);
  const [openJobCategory, setOpenJobCategory] = React.useState(false);
  const [startDateOpen, setStartDateOpen] = React.useState(false);
  const [openCountry, setOpenCountry] = React.useState(false);
  const [openState, setOpenState] = React.useState(false);
  const [openCity, setOpenCity] = React.useState(false);

  const [openAccordionItems, setOpenAccordionItems] = React.useState<string[]>([]);

  const [newSkillInputs, setNewSkillInputs] = React.useState<Record<string, string>>({});
  const [isAddingSkill, setIsAddingSkill] = React.useState<Record<string, boolean>>({});
  
  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: '',
      description: '',
      minExperience: 0,
      maxExperience: 0,
      numberOfPosts: '',
      type: 'full-time',
      payrollType: 'direct',
      contractDuration: '',
      expectedMinHoursPerWeek: '',
      expectedMaxHoursPerWeek: '',
      shiftType: 'regular',
      ctcCurrency: 'USD',
      ctcMinAmount: '',
      ctcMaxAmount: '',
      ctcFrequency: 'yearly',
      workMode: [],
      isActive: false,
      skills: [],
      benefits: [],
      languagesRequired: [],
      supplementalPayments: [],
      questions: [],
      address: '',
      country: '',
      state: '',
      city: '',
      zipCode: '',
    },
  });

  const { control, handleSubmit, formState: { errors, isSubmitting }, setError, watch, reset, setValue } = form;

  const watchedCountry = watch('country');
  const watchedState = watch('state');

  const countryRef = React.useRef(job?.country);
  const stateRef = React.useRef(job?.state);

  React.useEffect(() => {
    if (job) {
      reset({
        ...job,
        jobCategory: typeof job.jobCategory === 'object' ? job.jobCategory.id : job.jobCategory || '',
        employer: typeof job.employer === 'object' ? job.employer.id : job.employer || '',
        expectedStartDate: job.expectedStartDate ? new Date(job.expectedStartDate) : undefined,
        skills: Array.isArray(job.skills) ? job.skills.map((skill: any) => typeof skill === 'object' && skill !== null ? skill._id || skill.id : skill) : [],
        benefits: Array.isArray(job.benefits) ? job.benefits : [],
        languagesRequired: Array.isArray(job.languagesRequired) ? job.languagesRequired : [],
        supplementalPayments: Array.isArray(job.supplementalPayments) ? job.supplementalPayments : [],
        workMode: Array.isArray(job.workMode) ? job.workMode : [],
        questions: Array.isArray(job.questions) ? job.questions : [],
      });
    }
  }, [job, reset]);

  React.useEffect(() => {
    const fetchData = async () => {
      setIsLoadingData(true);
      setIsLoadingCountries(true);
      try {
        const [employersRes, jobCategoriesRes, skillsRes, skillCategoriesRes, countriesRes] = await Promise.all([
          getEmployers({ limit: 1000 }),
          getJobCategories({ limit: 1000 }),
          getSkills({ limit: 1000 }),
          getSkillCategories({ limit: 1000 }),
          getCountries(),
        ]);
        setEmployers(employersRes.data);
        setJobCategories(jobCategoriesRes.data);
        setAllSkills(skillsRes.data);
        setSkillCategories(skillCategoriesRes.data);
        setCountries(countriesRes);
      } catch (error) {
        toast({ title: "Failed to load form data", variant: "destructive" });
      } finally {
        setIsLoadingData(false);
        setIsLoadingCountries(false);
      }
    };
    fetchData();
  }, [toast]);
  
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


  const { fields: questionFields, append: appendQuestion, remove: removeQuestion } = useFieldArray({
    control: form.control,
    name: "questions"
  });

  const watchDescription = form.watch('description');
  const canSuggest = watchDescription && watchDescription.length > 50;

  const handleSuggestTitles = async () => {
    setIsSuggesting(true);
    setSuggestedTitles([]);
    try {
      const result = await suggestJobTitles({ description: watchDescription });
      setSuggestedTitles(result.titles);
    } catch (error) {
      console.error("Error suggesting titles:", error);
      toast({
        title: "Suggestion Failed",
        description: "Could not generate job title suggestions.",
        variant: "destructive",
      });
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleAddNewSkill = async (categoryId: string) => {
    const skillName = newSkillInputs[categoryId]?.trim();
    if (!skillName) {
        toast({ title: 'Skill name cannot be empty', variant: 'destructive' });
        return;
    }

    setIsAddingSkill(prev => ({ ...prev, [categoryId]: true }));

    try {
        const createdSkillFromApi = await createSkill({ name: skillName, skillCategory: categoryId, isActive: true });
        
        const category = skillCategories.find(c => c.id === categoryId);

        const newSkillForState: Skill = {
            ...createdSkillFromApi,
            skillCategory: category ? { id: category.id, _id: category.id, name: category.name } : createdSkillFromApi.skillCategory,
        };
        
        setAllSkills(prevSkills => [...prevSkills, newSkillForState]);
        setNewSkillInputs(prev => ({ ...prev, [categoryId]: '' }));
        toast({ title: 'Skill Added', description: `${newSkillForState.name} has been added.` });
    } catch (error: any) {
        toast({ title: 'Failed to add skill', description: error.message, variant: 'destructive' });
    } finally {
        setIsAddingSkill(prev => ({ ...prev, [categoryId]: false }));
    }
  };

  const onError = (errors: any) => {
    const firstErrorField = Object.keys(errors)[0] as keyof JobFormValues;
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

  const onSubmit = async (data: JobFormValues) => {
    if (data.shiftType !== 'other') {
        data.otherShiftType = '';
    }
    
    if (typeof data.benefits === 'string') {
        data.benefits = data.benefits.split(',').map(s => s.trim()).filter(Boolean);
    }
    if (typeof data.languagesRequired === 'string') {
        data.languagesRequired = data.languagesRequired.split(',').map(s => s.trim()).filter(Boolean);
    }
    
    try {
      if (job) {
        await updateJob(job.id, data);
      } else {
        await createJob(data);
      }
      toast({
          title: job ? 'Job Updated' : 'Job Created',
          description: `${data.title} has been successfully ${job ? 'updated' : 'created'}.`,
      });
      router.push('/jobs');
      router.refresh();
    } catch (error: any) {
        if (error.data && error.data.errors) {
            const serverErrors = error.data.errors;
            let firstErrorField: keyof JobFormValues | null = null;
            Object.keys(serverErrors).forEach((key) => {
                if (!firstErrorField) firstErrorField = key as keyof JobFormValues;
                if (Object.prototype.hasOwnProperty.call(jobSchema._def.schema.shape, key)) {
                    form.setError(key as keyof JobFormValues, { type: 'server', message: serverErrors[key] });
                }
            });
            if (firstErrorField) {
                const tab = fieldToTabMap[firstErrorField];
                if (tab && tab !== activeTab) setActiveTab(tab);
            }
            toast({
                title: 'Could not save job',
                description: error.data.message || 'Please correct the errors and try again.',
                variant: 'destructive',
            });
        } else {
           toast({ title: 'An error occurred', description: error.message, variant: 'destructive' });
        }
    }
  };

  if (isLoadingData) {
    return (
        <div>
            <Skeleton className="h-10 w-full mb-6" />
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-1/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2"><Skeleton className="h-4 w-16" /><Skeleton className="h-10 w-full" /></div>
                    <div className="space-y-2"><Skeleton className="h-4 w-16" /><Skeleton className="h-20 w-full" /></div>
                </CardContent>
            </Card>
        </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, onError)}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="w-full overflow-x-auto mb-6">
                <TabsList>
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="type">Type & Schedule</TabsTrigger>
                    <TabsTrigger value="compensation">Compensation</TabsTrigger>
                    <TabsTrigger value="skills">Skills & Exp.</TabsTrigger>
                    <TabsTrigger value="logistics">Logistics</TabsTrigger>
                    <TabsTrigger value="questions">Questions</TabsTrigger>
                    <TabsTrigger value="publish">Publish</TabsTrigger>
                </TabsList>
            </div>

            <TabsContent value="details">
                 <Card>
                    <CardHeader>
                        <CardTitle>Core Details</CardTitle>
                        <CardDescription>Provide the main information about the job posting.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel htmlFor="title">Job Title</FormLabel>
                                    <FormControl>
                                        <Input id="title" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {suggestedTitles.length > 0 && (
                            <div className="p-4 bg-muted/50 rounded-lg">
                                <h4 className="font-semibold text-sm mb-2 flex items-center"><Sparkles className="mr-1 h-4 w-4 text-yellow-500" /> AI Suggestions</h4>
                                <div className="flex flex-wrap gap-2">
                                {suggestedTitles.map(title => (
                                    <Button key={title} type="button" variant="secondary" size="sm" onClick={() => {
                                        form.setValue('title', title, { shouldValidate: true });
                                        setSuggestedTitles([]);
                                    }}>
                                        {title}
                                    </Button>
                                ))}
                                </div>
                            </div>
                        )}
                        
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel htmlFor="description" className="flex items-center justify-between">
                                        Job Description
                                        <Button type="button" size="sm" variant="outline" onClick={handleSuggestTitles} disabled={!canSuggest || isSuggesting}>
                                            {isSuggesting ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Wand2 className="mr-1 h-4 w-4" />}
                                            Suggest Titles
                                        </Button>
                                    </FormLabel>
                                    <CardDescription>
                                        Provide a detailed job description.
                                    </CardDescription>
                                    <FormControl>
                                        <Textarea
                                            {...field}
                                            placeholder="Provide a detailed job description..."
                                            className="min-h-40"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="employer"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Employer</FormLabel>
                                         <Popover open={openEmployer} onOpenChange={setOpenEmployer}>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button variant="outline" role="combobox" className={cn("w-full justify-between", !field.value && "text-muted-foreground")}>
                                                        {field.value ? employers.find((e) => e.id === field.value)?.name : "Select Employer"}
                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                                <Command>
                                                    <CommandInput placeholder="Search employer..." />
                                                    <CommandEmpty>No employer found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {employers.map((e) => (
                                                            <CommandItem value={e.name} key={e.id} onSelect={() => { form.setValue("employer", e.id); setOpenEmployer(false); }}>
                                                                <Check className={cn("mr-2 h-4 w-4", e.id === field.value ? "opacity-100" : "opacity-0")} />
                                                                {e.name}
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
                                control={form.control}
                                name="jobCategory"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Job Category</FormLabel>
                                        <Popover open={openJobCategory} onOpenChange={setOpenJobCategory}>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button variant="outline" role="combobox" className={cn("w-full justify-between", !field.value && "text-muted-foreground")}>
                                                        {field.value ? jobCategories.find((c) => c.id === field.value)?.name : "Select Category"}
                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                                <Command>
                                                    <CommandInput placeholder="Search category..." />
                                                    <CommandEmpty>No category found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {jobCategories.map((c) => (
                                                            <CommandItem value={c.name} key={c.id} onSelect={() => { form.setValue("jobCategory", c.id); setOpenJobCategory(false); }}>
                                                                <Check className={cn("mr-2 h-4 w-4", c.id === field.value ? "opacity-100" : "opacity-0")} />
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
                    </CardContent>
                </Card>
            </TabsContent>
            
            <TabsContent value="type">
                 <Card>
                    <CardHeader>
                        <CardTitle>Role Type & Schedule</CardTitle>
                        <CardDescription>Define the employment type and working hours.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Job Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="full-time">Full-time</SelectItem>
                                                <SelectItem value="part-time">Part-time</SelectItem>
                                                <SelectItem value="contract">Contract</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="payrollType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Payroll Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="direct">Direct</SelectItem>
                                                <SelectItem value="contract">Contract</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="expectedMinHoursPerWeek"
                                render={({ field }) => (<FormItem><FormLabel>Min. Hours/Week</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)}
                            />
                            <FormField
                                control={form.control}
                                name="expectedMaxHoursPerWeek"
                                render={({ field }) => (<FormItem><FormLabel>Max. Hours/Week</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)}
                            />
                        </div>
                         <FormField
                            control={form.control}
                            name="shiftType"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Shift Type</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            {['morning', 'evening', 'regular', 'night', 'flexible', 'weekend', 'us', 'uk', 'other'].map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>
            </TabsContent>
            
            <TabsContent value="compensation">
                 <Card>
                    <CardHeader>
                        <CardTitle>Compensation & Benefits</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                                control={form.control}
                                name="ctcCurrency"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Currency</FormLabel>
                                        <Popover open={openCurrency} onOpenChange={setOpenCurrency}>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        className={cn(
                                                            "w-full justify-between",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value
                                                            ? currencies.find(
                                                                (currency) => currency.value === field.value
                                                              )?.value
                                                            : "Select currency..."}
                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                                <Command>
                                                    <CommandInput placeholder="Search currency..." />
                                                    <CommandEmpty>No currency found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {currencies.map((currency) => (
                                                            <CommandItem
                                                                value={currency.label}
                                                                key={currency.value}
                                                                onSelect={() => {
                                                                    form.setValue("ctcCurrency", currency.value, { shouldValidate: true });
                                                                    setOpenCurrency(false);
                                                                }}
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        "mr-1 h-4 w-4",
                                                                        currency.value === field.value
                                                                            ? "opacity-100"
                                                                            : "opacity-0"
                                                                    )}
                                                                />
                                                                {currency.label}
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
                                control={form.control}
                                name="ctcMinAmount"
                                render={({ field }) => (<FormItem><FormLabel>Min Amount</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)}
                            />
                             <FormField
                                control={form.control}
                                name="ctcMaxAmount"
                                render={({ field }) => (<FormItem><FormLabel>Max Amount</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="ctcFrequency"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Salary Frequency</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="weekly">Weekly</SelectItem>
                                            <SelectItem value="monthly">Monthly</SelectItem>
                                            <SelectItem value="yearly">Yearly</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="benefits"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Benefits (comma-separated)</FormLabel>
                                    <FormControl><Input {...field} onChange={e => field.onChange(e.target.value.split(',').map(s => s.trim()))} value={Array.isArray(field.value) ? field.value.join(', ') : ''} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                 </Card>
            </TabsContent>
            
            <TabsContent value="skills">
                 <Card>
                    <CardHeader>
                        <CardTitle>Skills & Experience</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="minExperience"
                                render={({ field }) => (<FormItem><FormLabel>Min Experience (years)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)}
                            />
                            <FormField
                                control={form.control}
                                name="maxExperience"
                                render={({ field }) => (<FormItem><FormLabel>Max Experience (years)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="skills"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Required Skills</FormLabel>
                                <div className="space-y-4">
                                    <div className="flex flex-wrap gap-2 min-h-10 border rounded-md p-2">
                                        {field.value?.length > 0 ? (
                                            field.value.map(skillId => {
                                                const skill = allSkills.find(s => s.id === skillId);
                                                return (
                                                <Badge key={skillId} variant="secondary">
                                                    {skill?.name || 'Loading...'}
                                                    <button
                                                        type="button"
                                                        className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                                        onClick={() => {
                                                            field.onChange(field.value?.filter(id => id !== skillId));
                                                        }}
                                                    >
                                                        <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                                    </button>
                                                </Badge>
                                                )
                                            })
                                        ) : (
                                            <span className="text-sm text-muted-foreground px-2 py-1">No skills selected.</span>
                                        )}
                                    </div>
                                    <Accordion 
                                      type="multiple" 
                                      className="w-full"
                                      value={openAccordionItems}
                                      onValueChange={setOpenAccordionItems}
                                    >
                                        {skillCategories.map(category => {
                                            const categorySkills = allSkills
                                                .filter(s => s.skillCategory?.id === category.id)
                                                .sort((a,b) => a.name.localeCompare(b.name));
                                                
                                            return (
                                                <AccordionItem value={category.id} key={category.id}>
                                                    <AccordionTrigger>{category.name}</AccordionTrigger>
                                                    <AccordionContent>
                                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                                            {categorySkills.map(skill => (
                                                                <div key={skill.id} className="flex items-center space-x-2">
                                                                    <Checkbox
                                                                        id={`skill-${skill.id}`}
                                                                        checked={field.value?.includes(skill.id)}
                                                                        onCheckedChange={(checked) => {
                                                                            const currentSkills = field.value || [];
                                                                            if (checked) {
                                                                                field.onChange([...currentSkills, skill.id]);
                                                                            } else {
                                                                                field.onChange(currentSkills.filter(s => s !== skill.id));
                                                                            }
                                                                        }}
                                                                    />
                                                                    <FormLabel htmlFor={`skill-${skill.id}`} className="font-normal cursor-pointer">
                                                                        {skill.name}
                                                                    </FormLabel>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <div className="mt-4 pt-4 border-t border-dashed">
                                                            <div className="flex items-center gap-2">
                                                                <Input 
                                                                    placeholder="Add new skill..." 
                                                                    value={newSkillInputs[category.id] || ''}
                                                                    onChange={(e) => setNewSkillInputs(prev => ({...prev, [category.id]: e.target.value}))}
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === 'Enter') {
                                                                            e.preventDefault();
                                                                            handleAddNewSkill(category.id);
                                                                        }
                                                                    }}
                                                                />
                                                                <Button 
                                                                    type="button" 
                                                                    variant="outline" 
                                                                    size="sm" 
                                                                    onClick={() => handleAddNewSkill(category.id)}
                                                                    disabled={isAddingSkill[category.id] || !newSkillInputs[category.id]}
                                                                >
                                                                    {isAddingSkill[category.id] ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add'}
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </AccordionContent>
                                                </AccordionItem>
                                            );
                                        })}
                                    </Accordion>
                               </div>
                               <FormMessage />
                            </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="languagesRequired"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Languages (comma-separated)</FormLabel>
                                    <FormControl><Input {...field} onChange={e => field.onChange(e.target.value.split(',').map(s => s.trim()))} value={Array.isArray(field.value) ? field.value.join(', ') : ''} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                 </Card>
            </TabsContent>

             <TabsContent value="logistics">
                 <Card>
                    <CardHeader>
                        <CardTitle>Location & Logistics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                         <FormField
                            control={form.control}
                            name="workMode"
                            render={() => (
                                <FormItem>
                                    <FormLabel>Work Mode</FormLabel>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {['remote', 'hybrid', 'onsite'].map((item) => (
                                            <FormField
                                                key={item}
                                                control={form.control}
                                                name="workMode"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                        <FormControl>
                                                            <Checkbox checked={field.value?.includes(item)} onCheckedChange={(checked) => {
                                                                return checked ? field.onChange([...(field.value || []), item]) : field.onChange(field.value?.filter((value) => value !== item))
                                                            }}/>
                                                        </FormControl>
                                                        <FormLabel className="font-normal capitalize">{item}</FormLabel>
                                                    </FormItem>
                                                )}
                                            />
                                        ))}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
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
                                                            <CommandItem key={c.isoCode} value={c.name} onSelect={() => { setValue('country', c.isoCode, { shouldValidate: true }); setOpenCountry(false); }}>
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
                                                            <CommandItem key={s.isoCode} value={s.name} onSelect={() => { setValue('state', s.isoCode, { shouldValidate: true }); setOpenState(false); }}>
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
                                                            <CommandItem key={c.name} value={c.name} onSelect={() => {setValue('city', c.name, { shouldValidate: true }); setOpenCity(false);}}>
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
                         <FormField
                            control={form.control}
                            name="expectedStartDate"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Expected Start Date</FormLabel>
                                    <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                                        <PopoverTrigger asChild>
                                          <FormControl>
                                            <Button variant={"outline"} className={cn("w-[240px] pl-3 text-left font-normal",!field.value && "text-muted-foreground")}>
                                              <CalendarIcon className="mr-1 h-4 w-4" />
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
                                                setStartDateOpen(false)
                                              }} 
                                              disabled={(date) => date < new Date()} 
                                              initialFocus 
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                 </Card>
            </TabsContent>
            
            <TabsContent value="questions">
                 <Card>
                    <CardHeader>
                        <CardTitle>Screening Questions</CardTitle>
                        <CardDescription>Add questions to pre-screen applicants.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {questionFields.map((field, index) => (
                            <div key={field.id} className="p-4 border rounded-lg space-y-4 relative">
                                <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive hover:bg-destructive/10" onClick={() => removeQuestion(index)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                                <FormField control={form.control} name={`questions.${index}.question`} render={({ field }) => (<FormItem><FormLabel>Question</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField
                                    control={form.control}
                                    name={`questions.${index}.type`}
                                    render={({ field: typeField }) => (
                                    <FormItem>
                                        <FormLabel>Question Type</FormLabel>
                                        <Select onValueChange={typeField.onChange} defaultValue={typeField.value}>
                                            <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="text">Text</SelectItem>
                                                <SelectItem value="boolean">Boolean (Yes/No)</SelectItem>
                                                <SelectItem value="single-choice">Single Choice</SelectItem>
                                                <SelectItem value="multi-choice">Multiple Choice</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                {['single-choice', 'multi-choice'].includes(form.watch(`questions.${index}.type`)) && (
                                     <FormField
                                        control={form.control}
                                        name={`questions.${index}.options`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Options (comma-separated)</FormLabel>
                                                <FormControl><Input {...field} onChange={e => field.onChange(e.target.value.split(',').map(s => s.trim()))} value={Array.isArray(field.value) ? field.value.join(', ') : ''} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}
                            </div>
                        ))}
                        <Button type="button" variant="outline" onClick={() => appendQuestion({ question: '', type: 'text', options: [] })}>Add Question</Button>
                    </CardContent>
                 </Card>
            </TabsContent>
            
            <TabsContent value="publish">
                 <Card>
                    <CardHeader>
                        <CardTitle>Publishing</CardTitle>
                        <CardDescription>Control the visibility and status of this job posting.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                       <FormField
                            control={form.control}
                            name="isActive"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Job Status</FormLabel>
                                        <CardDescription>
                                            Set whether this job is active and accepting applications.
                                        </CardDescription>
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
                        <FormField
                            control={form.control}
                            name="numberOfPosts"
                            render={({ field }) => (<FormItem><FormLabel>Number of Openings</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)}
                        />
                    </CardContent>
                 </Card>
            </TabsContent>

        </Tabs>
        <CardFooter className="flex justify-end gap-2 mt-6 px-0">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Saving...' : 'Save Job'}
          </Button>
      </CardFooter>
      </form>
    </Form>
  );
}
