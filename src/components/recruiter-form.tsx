
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { type User, employers } from '@/lib/data';
import { Switch } from './ui/switch';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from './ui/command';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const recruiterSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
  phoneNumber: z.string().optional(),
  status: z.enum(['Active', 'Inactive']),
  employerId: z.string().min(1, 'Employer is required'),
});

type RecruiterFormValues = z.infer<typeof recruiterSchema>;

type RecruiterFormProps = {
    user?: User;
}

export function RecruiterForm({ user }: RecruiterFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [openEmployer, setOpenEmployer] = React.useState(false);
  
  const form = useForm<RecruiterFormValues>({
    resolver: zodResolver(recruiterSchema),
    defaultValues: {
        name: user?.name || '',
        email: user?.email || '',
        phoneNumber: user?.phoneNumber || '',
        status: user?.status || 'Active',
        employerId: user?.employerId || '',
    }
  });

  const onSubmit = (data: RecruiterFormValues) => {
    console.log(data);
    toast({
        title: user ? 'Recruiter Updated' : 'Recruiter Created',
        description: `${data.name} has been successfully ${user ? 'updated' : 'created'}.`,
    });
    router.push('/recruiters');
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                  <Card>
                      <CardHeader>
                          <CardTitle>Recruiter Details</CardTitle>
                          <CardDescription>
                              Enter the main details for the recruiter.
                          </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                  control={form.control}
                                  name="name"
                                  render={({ field }) => (
                                      <FormItem>
                                          <FormLabel>Full Name</FormLabel>
                                          <FormControl>
                                              <Input {...field} />
                                          </FormControl>
                                          <FormMessage />
                                      </FormItem>
                                  )}
                              />
                              <FormField
                                  control={form.control}
                                  name="email"
                                  render={({ field }) => (
                                      <FormItem>
                                          <FormLabel>Email</FormLabel>
                                          <FormControl>
                                              <Input type="email" {...field} />
                                          </FormControl>
                                          <FormMessage />
                                      </FormItem>
                                  )}
                              />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                  control={form.control}
                                  name="phoneNumber"
                                  render={({ field }) => (
                                      <FormItem>
                                          <FormLabel>Phone Number</FormLabel>
                                          <FormControl>
                                              <Input {...field} />
                                          </FormControl>
                                          <FormMessage />
                                      </FormItem>
                                  )}
                              />
                              <FormField
                                  control={form.control}
                                  name="password"
                                  render={({ field }) => (
                                      <FormItem>
                                          <FormLabel>Password</FormLabel>
                                          <FormControl>
                                              <Input type="password" {...field} placeholder={user ? 'Leave blank to keep current password' : ''} />
                                          </FormControl>
                                          <FormMessage />
                                      </FormItem>
                                  )}
                              />
                          </div>
                          <FormField
                              control={form.control}
                              name="employerId"
                              render={({ field }) => (
                                  <FormItem className="flex flex-col">
                                      <FormLabel>Employer</FormLabel>
                                      <Popover open={openEmployer} onOpenChange={setOpenEmployer}>
                                          <PopoverTrigger asChild>
                                              <FormControl>
                                                  <Button
                                                  variant="outline"
                                                  role="combobox"
                                                  className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
                                                  >
                                                  {field.value
                                                      ? employers.find((employer) => employer.id === field.value)?.companyName
                                                      : "Select employer..."}
                                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                  </Button>
                                              </FormControl>
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
                          <CardTitle>Account Status</CardTitle>
                      </CardHeader>
                      <CardContent>
                           <FormField
                              control={form.control}
                              name="status"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                  <div className="space-y-0.5">
                                    <FormLabel>Active Status</FormLabel>
                                    <FormDescription>Inactive recruiters cannot log in.</FormDescription>
                                  </div>
                                  <FormControl>
                                    <Switch
                                      checked={field.value === 'Active'}
                                      onCheckedChange={(checked) => field.onChange(checked ? 'Active' : 'Inactive')}
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
                  {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
          </CardFooter>
      </form>
    </Form>
  );
}
