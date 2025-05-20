
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SavingsType, Frequency, useFinancial } from '@/contexts/FinancialContext';
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
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

// Define savings types and frequencies
const savingsTypes: { value: SavingsType; label: string }[] = [
  { value: 'sip', label: 'SIP' },
  { value: 'mutual_fund', label: 'Mutual Fund' },
  { value: 'gullak', label: 'Gullak (Daily Saving)' },
  { value: 'fixed_deposit', label: 'Fixed Deposit' },
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
  type: z.enum(['sip', 'mutual_fund', 'gullak', 'fixed_deposit', 'other']),
  description: z.string().optional(),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'once']),
  returnRate: z.coerce.number().min(0).optional(),
  returnFrequency: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'once']).optional(),
});

type FormValues = z.infer<typeof formSchema>;

const AddSavingForm: React.FC = () => {
  const { addSaving } = useFinancial();
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      amount: 0,
      date: new Date(),
      type: 'sip',
      description: '',
      frequency: 'monthly',
      returnRate: 0,
      returnFrequency: 'monthly',
    },
  });
  
  const watchType = form.watch('type');
  const watchReturnRate = form.watch('returnRate');
  
  // Set default frequencies based on saving type
  React.useEffect(() => {
    if (watchType === 'gullak') {
      form.setValue('frequency', 'daily');
    } else if (watchType === 'sip' || watchType === 'mutual_fund') {
      form.setValue('frequency', 'monthly');
    }
  }, [watchType, form]);
  
  const onSubmit = (data: FormValues) => {
    try {
      // Add the saving through the context
      addSaving({
        title: data.title,
        amount: data.amount,
        date: data.date.toISOString(),
        type: data.type,
        description: data.description,
        frequency: data.frequency,
        returnRate: data.returnRate,
        returnFrequency: data.returnFrequency,
      });
      
      toast({
        title: 'Saving plan added successfully',
        description: `Added "${data.title}" for ₹${data.amount}`,
      });
      
      // Reset the form
      form.reset({
        title: '',
        amount: 0,
        date: new Date(),
        type: 'sip',
        description: '',
        frequency: 'monthly',
        returnRate: 0,
        returnFrequency: 'monthly',
      });
    } catch (error) {
      console.error('Error adding saving:', error);
      toast({
        title: 'Failed to add saving plan',
        description: 'An error occurred while adding the saving plan.',
        variant: 'destructive',
      });
    }
  };
  
  return (
    // The issue was with the Form component import - the shadcn Form component is a wrapper of FormProvider
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
                  <Input 
                    placeholder={
                      watchType === 'gullak' 
                        ? "Daily savings goal" 
                        : watchType === 'sip' 
                        ? "SIP investment" 
                        : "Saving plan"
                    } 
                    {...field} 
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
                <FormLabel>Start Date</FormLabel>
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
                <FormLabel>Saving Type</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select saving type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {savingsTypes.map((type) => (
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
            name="frequency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contribution Frequency</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {frequencyOptions.map((option) => (
                      <SelectItem 
                        key={option.value} 
                        value={option.value}
                        disabled={
                          watchType === 'gullak' && option.value !== 'daily'
                        }
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  {watchType === 'gullak' 
                    ? 'Gullak savings must be daily' 
                    : 'How often will you contribute to this saving?'}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {watchType !== 'gullak' && (
            <FormField
              control={form.control}
              name="returnRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expected Return Rate (%)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01"
                      placeholder="7.5" 
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Expected annual return rate (optional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
        
        {/* Fixed the conditional rendering syntax here */}
        {watchType !== 'gullak' && watchReturnRate > 0 && (
          <FormField
            control={form.control}
            name="returnFrequency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Return Frequency</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select return frequency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {frequencyOptions.map((option) => (
                      <SelectItem 
                        key={option.value} 
                        value={option.value}
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  How often do you expect to receive returns?
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Add details about this saving plan" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full">Add Saving Plan</Button>
      </form>
    </Form>
  );
};

export default AddSavingForm;
