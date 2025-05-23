
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';

const salarySchema = z.object({
  monthlySalary: z.string()
    .refine(val => !isNaN(Number(val)), { message: "Monthly salary must be a number" })
    .refine(val => Number(val) >= 0, { message: "Monthly salary must be positive" })
});

type SalaryFormValues = z.infer<typeof salarySchema>;

const SalarySetupPage: React.FC = () => {
  const { profile, updateProfile, hasSalarySetup } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // If user already has salary setup, redirect to dashboard
    if (hasSalarySetup) {
      navigate('/dashboard');
    }
  }, [hasSalarySetup, navigate]);

  const form = useForm<SalaryFormValues>({
    resolver: zodResolver(salarySchema),
    defaultValues: {
      monthlySalary: profile?.monthlySalary ? profile.monthlySalary.toString() : '0'
    }
  });

  const onSubmit = async (data: SalaryFormValues) => {
    setIsLoading(true);
    
    try {
      if (!profile) {
        throw new Error("Profile not found");
      }
      
      const updatedProfile = {
        ...profile,
        monthlySalary: Number(data.monthlySalary)
      };
      
      await updateProfile(updatedProfile);
      
      toast({
        title: "Salary updated!",
        description: "Your monthly salary has been set successfully."
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update salary",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <DashboardLayout requireAuth={true} showNav={false}>
      <div className="flex justify-center items-center min-h-[80vh]">
        <Card className="w-full max-w-md border border-gray-200">
          <CardHeader className="bg-white">
            <CardTitle className="text-2xl">Welcome to ExpenseChecker</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="mb-6 text-gray-600">Before you begin, please set your monthly salary so we can help you manage your expenses effectively.</p>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="monthlySalary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly Salary</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter your monthly salary" 
                          type="number" 
                          min="0" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Continue'
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SalarySetupPage;
