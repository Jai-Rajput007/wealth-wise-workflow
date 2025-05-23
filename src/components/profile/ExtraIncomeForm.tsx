
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
import { toast as sonnerToast } from "sonner";
import { motion } from "framer-motion";

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
      // Ensure we pass all required parameters and await the result
      await addIncome(data.amount, data.title, data.description || '');
      
      form.reset({
        title: '',
        amount: 0,
        description: '',
      });
      
      toast({
        title: 'Extra income added',
        description: `Added ₹${data.amount} to your balance`,
      });
      
      sonnerToast.success(`Added ₹${data.amount} to your balance`, {
        description: 'Your extra income has been added successfully',
        duration: 3000,
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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b border-gray-100">
          <CardTitle className="text-blue-700">Add Extra Income</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-blue-700">Income Title</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Bonus, Gift, etc." 
                        {...field} 
                        className="border-gray-200 focus:border-blue-300 focus:ring-blue-300"
                      />
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
                    <FormLabel className="text-blue-700">Amount (₹)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="5000" 
                        {...field}
                        className="border-gray-200 focus:border-blue-300 focus:ring-blue-300"
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
                    <FormLabel className="text-blue-700">Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Details about this income" 
                        {...field} 
                        className="border-gray-200 focus:border-blue-300 focus:ring-blue-300"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  type="submit" 
                  className="w-full bg-green-600 hover:bg-green-700 text-white transition-colors"
                >
                  Add Income
                </Button>
              </motion.div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ExtraIncomeForm;
