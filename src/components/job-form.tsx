
'use client';

import * as React from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { type Job, type Question, jobCategories, employers, skills, skillCategories } from '@/lib/data';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { CalendarIcon, Check, ChevronsUpDown, Loader2, Sparkles, Trash2, Wand2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Form, FormControl, FormField, FormItem, FormMessage } from './ui/form';
import { suggestJobTitles } from '@/ai/flows/suggest-job-title-flow';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from './ui/badge';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from './ui/command';


const questionSchema = z.object({
  question: z.string().min(1, 'Question text is required'),
  type: z.enum(['boolean', 'single-choice', 'multi-choice', 'text']),
  options: z.array(z.string()).optional(),
});

const jobSchema = z.object({
  title: z.string().min(3, 'Job title must be at least 3 characters'),
  description: z.string().min(1, 'Description is required'),
  minExperience: z.coerce.number().min(0),
  maxExperience: z.coerce.number().min(0),
  numberOfPosts: z.coerce.number().optional(),
  type: z.enum(['full-time', 'part-time', 'contract']),
  payrollType: z.enum(['contract', 'direct']),
  contractDuration: z.coerce.number().optional(),
  contractDurationUnit: z.enum(['days', 'months', 'years']).optional(),
  expectedMinHoursPerWeek: z.coerce.number().optional(),
  expectedMaxHoursPerWeek: z.coerce.number().optional(),
  shiftType: z.enum(['morning', 'evening', 'regular', 'night', 'flexible', 'weekend', 'us', 'uk', 'other']),
  otherShiftType: z.string().optional(),
  ctcCurrency: z.string().min(1, 'Currency is required'),
  ctcMinAmount: z.coerce.number().optional(),
  ctcMaxAmount: z.coerce.number().optional(),
  ctcFrequency: z.enum(['weekly', 'yearly', 'monthly']),
  supplementalPayments: z.array(z.string()).optional(),
  otherSupplementalPaymentType: z.string().optional(),
  jobCategoryId: z.string().min(1, 'Job Category is required'),
  companyId: z.string().min(1, 'Company is required'),
  workMode: z.array(z.string()).min(1, 'At least one work mode is required'),
  otherWorkModeType: z.string().optional(),
  expectedStartDate: z.date().optional(),
  skills: z.array(z.string()).optional(),
  address: z.string().optional(),
  country: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  zipCode: z.string().optional(),
  status: z.enum(['active', 'inactive', 'draft', 'archived']),
  languagesRequired: z.array(z.string()).optional(),
  benefits: z.array(z.string()).optional(),
  questions: z.array(questionSchema).optional(),
}).refine(data => !data.maxExperience || !data.minExperience || data.maxExperience >= data.minExperience, {
    message: "Max experience must be greater than or equal to min experience",
    path: ["maxExperience"],
});

type JobFormValues = z.infer<typeof jobSchema>;

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
  const [isSuggesting, setIsSuggesting] = React.useState(false);
  const [suggestedTitles, setSuggestedTitles] = React.useState<string[]>([]);
  const [allSkills, setAllSkills] = React.useState(skills);
  const [newSkillInputs, setNewSkillInputs] = React.useState<Record<string, string>>({});
  const [openCurrency, setOpenCurrency] = React.useState(false);
  
  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: job?.title || '',
      description: job?.description || '',
      minExperience: job?.minExperience || 0,
      maxExperience: job?.maxExperience || 0,
      numberOfPosts: job?.numberOfPosts,
      type: job?.type || 'full-time',
      payrollType: job?.payrollType || 'direct',
      contractDuration: job?.contractDuration,
      contractDurationUnit: job?.contractDurationUnit,
      expectedMinHoursPerWeek: job?.expectedMinHoursPerWeek,
      expectedMaxHoursPerWeek: job?.expectedMaxHoursPerWeek,
      shiftType: job?.shiftType || 'regular',
      otherShiftType: job?.otherShiftType,
      ctcCurrency: job?.ctcCurrency || 'USD',
      ctcMinAmount: job?.ctcMinAmount,
      ctcMaxAmount: job?.ctcMaxAmount,
      ctcFrequency: job?.ctcFrequency || 'yearly',
      supplementalPayments: job?.supplementalPayments || [],
      otherSupplementalPaymentType: job?.otherSupplementalPaymentType,
      jobCategoryId: job?.jobCategoryId || '',
      companyId: job?.companyId || '',
      workMode: job?.workMode || [],
      otherWorkModeType: job?.otherWorkModeType,
      expectedStartDate: job?.expectedStartDate ? new Date(job.expectedStartDate) : undefined,
      skills: job?.skills || [],
      address: job?.address || '',
      country: job?.country || '',
      state: job?.state || '',
      city: job?.city || '',
      zipCode: job?.zipCode || '',
      status: job?.status || 'draft',
      languagesRequired: job?.languagesRequired || [],
      benefits: job?.benefits || [],
      questions: job?.questions || [],
    },
  });

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

  const handleAddNewSkill = (categoryId: string, categoryName: string) => {
    const newSkillName = newSkillInputs[categoryId]?.trim();
    if (!newSkillName) {
        toast({ title: "Skill name cannot be empty.", variant: "destructive" });
        return;
    }

    if (allSkills.some(s => s.name.toLowerCase() === newSkillName.toLowerCase())) {
        toast({ title: "Skill already exists.", description: `"${newSkillName}" is already in the list.`, variant: "destructive" });
        return;
    }

    const newSkill = {
        id: `SKL_${Date.now()}`,
        name: newSkillName,
        categoryId,
        categoryName,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    setAllSkills(prev => [...prev, newSkill].sort((a, b) => a.name.localeCompare(b.name)));
    
    const currentSelectedSkills = form.getValues('skills') || [];
    form.setValue('skills', [...currentSelectedSkills, newSkill.name], { shouldDirty: true });
    
    setNewSkillInputs(prev => ({...prev, [categoryId]: ''}));
    
    toast({ title: "Skill Added", description: `"${newSkillName}" has been added and selected.` });
  };


  const onSubmit = (data: JobFormValues) => {
    console.log(data);
    toast({
        title: job ? 'Job Updated' : 'Job Created',
        description: `${data.title} has been successfully ${job ? 'updated' : 'created'}.`,
    });
    router.push('/jobs');
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Tabs defaultValue="details" className="w-full">
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
                                    <Label htmlFor="title">Job Title</Label>
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
                                    <Label htmlFor="description" className="flex items-center justify-between">
                                        Job Description
                                        <Button type="button" size="sm" variant="outline" onClick={handleSuggestTitles} disabled={!canSuggest || isSuggesting}>
                                            {isSuggesting ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Wand2 className="mr-1 h-4 w-4" />}
                                            Suggest Titles
                                        </Button>
                                    </Label>
                                    <FormControl>
                                        <Textarea id="description" {...field} className="min-h-40" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="companyId"
                                render={({ field }) => (
                                    <FormItem>
                                        <Label>Company</Label>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger><SelectValue placeholder="Select a company" /></SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {employers.map(e => <SelectItem key={e.id} value={e.id}>{e.companyName}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="jobCategoryId"
                                render={({ field }) => (
                                    <FormItem>
                                        <Label>Job Category</Label>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {jobCategories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
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
                                        <Label>Job Type</Label>
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
                                        <Label>Payroll Type</Label>
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
                                render={({ field }) => (<FormItem><Label>Min. Hours/Week</Label><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)}
                            />
                            <FormField
                                control={form.control}
                                name="expectedMaxHoursPerWeek"
                                render={({ field }) => (<FormItem><Label>Max. Hours/Week</Label><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)}
                            />
                        </div>
                         <FormField
                            control={form.control}
                            name="shiftType"
                            render={({ field }) => (
                                <FormItem>
                                    <Label>Shift Type</Label>
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
                                        <Label>Currency</Label>
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
                                render={({ field }) => (<FormItem><Label>Min Amount</Label><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)}
                            />
                             <FormField
                                control={form.control}
                                name="ctcMaxAmount"
                                render={({ field }) => (<FormItem><Label>Max Amount</Label><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="ctcFrequency"
                            render={({ field }) => (
                                <FormItem>
                                    <Label>Salary Frequency</Label>
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
                                    <Label>Benefits (comma-separated)</Label>
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
                                render={({ field }) => (<FormItem><Label>Min Experience (years)</Label><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)}
                            />
                            <FormField
                                control={form.control}
                                name="maxExperience"
                                render={({ field }) => (<FormItem><Label>Max Experience (years)</Label><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="skills"
                            render={({ field }) => (
                            <FormItem>
                                <Label>Required Skills</Label>
                                <div className="space-y-4">
                                    <div className="flex flex-wrap gap-2 min-h-10 border rounded-md p-2">
                                        {field.value?.length > 0 ? (
                                            field.value.map(skillName => (
                                                <Badge key={skillName} variant="secondary">
                                                    {skillName}
                                                    <button
                                                        type="button"
                                                        className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                                        onClick={() => {
                                                            field.onChange(field.value?.filter(s => s !== skillName));
                                                        }}
                                                    >
                                                        <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                                    </button>
                                                </Badge>
                                            ))
                                        ) : (
                                            <span className="text-sm text-muted-foreground px-2 py-1">No skills selected.</span>
                                        )}
                                    </div>
                                    <Accordion type="multiple" className="w-full">
                                        {skillCategories.map(category => {
                                            const categorySkills = allSkills
                                                .filter(s => s.categoryId === category.id)
                                                .sort((a,b) => a.name.localeCompare(b.name));
                                                
                                            if (categorySkills.length === 0) return null;

                                            return (
                                                <AccordionItem value={category.id} key={category.id}>
                                                    <AccordionTrigger>{category.name}</AccordionTrigger>
                                                    <AccordionContent>
                                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                                            {categorySkills.map(skill => (
                                                                <div key={skill.id} className="flex items-center space-x-2">
                                                                    <Checkbox
                                                                        id={`skill-${skill.id}`}
                                                                        checked={field.value?.includes(skill.name)}
                                                                        onCheckedChange={(checked) => {
                                                                            const currentSkills = field.value || [];
                                                                            if (checked) {
                                                                                field.onChange([...currentSkills, skill.name]);
                                                                            } else {
                                                                                field.onChange(currentSkills.filter(s => s !== skill.name));
                                                                            }
                                                                        }}
                                                                    />
                                                                    <Label htmlFor={`skill-${skill.id}`} className="font-normal cursor-pointer">
                                                                        {skill.name}
                                                                    </Label>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <div className="mt-4 pt-4 border-t border-dashed">
                                                            <p className="text-xs font-semibold text-muted-foreground mb-2">Not listed? Add a new skill to this category.</p>
                                                            <div className="flex items-center gap-2">
                                                                <Input
                                                                    placeholder="Enter new skill name"
                                                                    value={newSkillInputs[category.id] || ''}
                                                                    onChange={(e) => setNewSkillInputs(prev => ({ ...prev, [category.id]: e.target.value }))}
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === 'Enter') {
                                                                            e.preventDefault();
                                                                            handleAddNewSkill(category.id, category.name);
                                                                        }
                                                                    }}
                                                                />
                                                                <Button type="button" onClick={() => handleAddNewSkill(category.id, category.name)}>Add</Button>
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
                                    <Label>Work Mode</Label>
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
                                                        <Label className="font-normal capitalize">{item}</Label>
                                                    </FormItem>
                                                )}
                                            />
                                        ))}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField control={form.control} name="city" render={({ field }) => (<FormItem><Label>City</Label><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="state" render={({ field }) => (<FormItem><Label>State</Label><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField control={form.control} name="country" render={({ field }) => (<FormItem><Label>Country</Label><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="zipCode" render={({ field }) => (<FormItem><Label>Zip Code</Label><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        </div>
                         <FormField
                            control={form.control}
                            name="expectedStartDate"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <Label>Expected Start Date</Label>
                                    <Popover>
                                        <PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-[240px] pl-3 text-left font-normal", !field.value && "text-muted-foreground")}><CalendarIcon className="mr-1 h-4 w-4" />{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}</Button></FormControl></PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date()} initialFocus /></PopoverContent>
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
                                <FormField control={form.control} name={`questions.${index}.question`} render={({ field }) => (<FormItem><Label>Question</Label><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField
                                    control={form.control}
                                    name={`questions.${index}.type`}
                                    render={({ field: typeField }) => (
                                    <FormItem>
                                        <Label>Question Type</Label>
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
                                                <Label>Options (comma-separated)</Label>
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
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <Label>Job Status</Label>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="draft">Draft</SelectItem>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                            <SelectItem value="archived">Archived</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="numberOfPosts"
                            render={({ field }) => (<FormItem><Label>Number of Openings</Label><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)}
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
