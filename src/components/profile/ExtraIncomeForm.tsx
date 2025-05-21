
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFinancial } from '@/contexts/FinancialContext';
import { useToast } from '@/hooks/use-toast';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Create schema for form validation
const formSchema = z.object({
  title: z.string().min(2, 'Title is required').max(50),
  amount: z.coerce.number().min(1, 'Amount must be greater than 0'),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const ExtraIncomeForm: React.FC = () => {
  const { addIncome } = useFinancial();
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      amount: 0,
      description: '',
    },
  });
  
  const onSubmit = async (data: FormValues) => {
    try {
      await addIncome(data.amount, data.title, data.description);
      
      form.reset({
        title: '',
        amount: 0,
        description: '',
      });
      
      toast({
        title: 'Extra income added',
        description: `Added ₹${data.amount} to your balance`,
      });
    } catch (error) {
      console.error('Error adding income:', error);
      toast({
        title: 'Error adding income',
        description: 'Failed to add your extra income',
        variant: 'destructive',
      });
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Extra Income</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Income Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Bonus, Gift, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (₹)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="5000" 
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Details about this income" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit">Add Income</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ExtraIncomeForm;
