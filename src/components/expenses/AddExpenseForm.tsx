
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ExpenseType, ExpenseCategory, Frequency, useFinancial } from '@/contexts/FinancialContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

// Define expense types and categories
const expenseTypes: { value: ExpenseType; label: string }[] = [
  { value: 'permanent', label: 'Recurring Expense' },
  { value: 'temporary', label: 'One-time Expense' },
];

const expenseCategories: { value: ExpenseCategory; label: string }[] = [
  { value: 'rent', label: 'Rent/Housing' },
  { value: 'food', label: 'Food & Dining' },
  { value: 'subscription', label: 'Subscriptions' },
  { value: 'recharge', label: 'Recharges' },
  { value: 'travel', label: 'Travel' },
  { value: 'bill', label: 'Bills & Utilities' },
  { value: 'emi', label: 'EMIs & Loans' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'other', label: 'Other' },
];

const frequencyOptions: { value: Frequency; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'once', label: 'One Time' },
];

// Create schema for form validation
const formSchema = z.object({
  title: z.string().min(2, 'Title is required').max(50),
  amount: z.coerce.number().min(1, 'Amount must be greater than 0'),
  date: z.date(),
  type: z.enum(['permanent', 'temporary']),
  category: z.enum([
    'rent', 'food', 'subscription', 'recharge', 'travel', 
    'bill', 'emi', 'entertainment', 'shopping', 'other'
  ]),
  description: z.string().optional(),
  // Conditional fields for permanent expenses
  frequency: z.enum([
    'daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'once'
  ]).optional(),
  // Split expense fields
  isSplit: z.boolean().default(false),
  splitWith: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const AddExpenseForm: React.FC = () => {
  const { addExpense } = useFinancial();
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      amount: 0,
      date: new Date(),
      type: 'temporary',
      category: 'other',
      description: '',
      frequency: 'once',
      isSplit: false,
      splitWith: '',
    },
  });
  
  const watchType = form.watch('type');
  const watchIsSplit = form.watch('isSplit');
  
  const onSubmit = (data: FormValues) => {
    try {
      // Add the expense through the context
      addExpense({
        title: data.title,
        amount: data.amount,
        date: data.date.toISOString(),
        type: data.type,
        category: data.category,
        description: data.description,
        frequency: data.type === 'permanent' ? data.frequency : undefined,
        isSplit: data.isSplit,
        splitWith: data.isSplit ? data.splitWith : undefined,
        splitStatus: data.isSplit ? 'pending' : undefined,
      });
      
      toast({
        title: 'Expense added successfully',
        description: `Added "${data.title}" for ₹${data.amount}`,
      });
      
      // Reset the form
      form.reset({
        title: '',
        amount: 0,
        date: new Date(),
        type: 'temporary',
        category: 'other',
        description: '',
        frequency: 'once',
        isSplit: false,
        splitWith: '',
      });
    } catch (error) {
      console.error('Error adding expense:', error);
      toast({
        title: 'Failed to add expense',
        description: 'An error occurred while adding the expense.',
        variant: 'destructive',
      });
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Grocery shopping" {...field} />
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
                    placeholder="1000" 
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expense Type</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select expense type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {expenseTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {expenseCategories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {watchType === 'permanent' && (
            <FormField
              control={form.control}
              name="frequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Frequency</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {frequencyOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Add details about this expense" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="isSplit"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Split this expense</FormLabel>
                <FormDescription>
                  Split this expense with another user
                </FormDescription>
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
        
        {watchIsSplit && (
          <FormField
            control={form.control}
            name="splitWith"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Split with (username)</FormLabel>
                <FormControl>
                  <Input placeholder="friend_username" {...field} />
                </FormControl>
                <FormDescription>
                  Enter the username of the person to split with
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        <Button type="submit" className="w-full">Add Expense</Button>
      </form>
    </Form>
  );
};

export default AddExpenseForm;
