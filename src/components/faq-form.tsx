'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { type Faq } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { createFaq, updateFaq } from '@/services/api';

const faqSchema = z.object({
  question: z.string().min(1, 'Question is required'),
  answer: z.string().min(1, 'Answer is required'),
  order: z.coerce.number().min(0, 'Order must be a positive number'),
  isActive: z.boolean().default(true),
});

type FaqFormValues = z.infer<typeof faqSchema>;

type FaqFormProps = {
    faq?: Faq;
}

export function FaqForm({ faq }: FaqFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
    setError,
  } = useForm<FaqFormValues>({
    resolver: zodResolver(faqSchema),
    defaultValues: {
        question: faq?.question || '',
        answer: faq?.answer || '',
        order: faq?.order || 0,
        isActive: faq?.isActive ?? true,
    }
  });

  const onSubmit = async (data: FaqFormValues) => {
    try {
      if (faq) {
        await updateFaq(faq.id, data);
      } else {
        await createFaq(data);
      }
      toast({
          title: faq ? 'FAQ Updated' : 'FAQ Created',
          description: `The FAQ has been successfully ${faq ? 'updated' : 'created'}.`,
      });
      router.push('/faqs');
      router.refresh();
    } catch (error: any) {
        if (error.data && error.data.errors) {
            const serverErrors = error.data.errors;
            Object.keys(serverErrors).forEach((key) => {
                if (Object.prototype.hasOwnProperty.call(faqSchema.shape, key)) {
                    setError(key as keyof FaqFormValues, {
                        type: 'server',
                        message: serverErrors[key],
                    });
                }
            });
            toast({
                title: 'Could not save FAQ',
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
        <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
                 <Card>
                    <CardHeader>
                        <CardTitle>FAQ Content</CardTitle>
                        <CardDescription>Enter the question and the corresponding answer.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="question">Question</Label>
                            <Textarea id="question" {...register('question')} className="min-h-24" />
                            {errors.question && <p className="text-sm text-destructive">{errors.question.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="answer">Answer</Label>
                            <Textarea id="answer" {...register('answer')} className="min-h-48" />
                            {errors.answer && <p className="text-sm text-destructive">{errors.answer.message}</p>}
                        </div>
                    </CardContent>
                </Card>
             </div>
             <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Settings</CardTitle>
                        <CardDescription>Configure visibility and order.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="order">Display Order</Label>
                            <Input id="order" type="number" {...register('order')} />
                            {errors.order && <p className="text-sm text-destructive">{errors.order.message}</p>}
                        </div>
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <Label htmlFor="isActive">Active Status</Label>
                                <CardDescription>Inactive FAQs will not be shown publicly.</CardDescription>
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
                {isSubmitting ? 'Saving...' : 'Save FAQ'}
            </Button>
        </CardFooter>
    </form>
  );
}
