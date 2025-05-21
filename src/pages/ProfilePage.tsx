
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/contexts/UserContext';
import { supabase } from '@/integrations/supabase/client';
import { Separator } from '@/components/ui/separator';

// Define the profile form schema
const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email address.'),
  username: z.string().min(3, 'Username must be at least 3 characters.'),
  phoneNumber: z.string().optional(),
  monthlySalary: z.coerce.number().nonnegative('Monthly salary cannot be negative.')
});

// Define the extra income form schema
const extraIncomeSchema = z.object({
  amount: z.coerce.number().positive('Amount must be positive.'),
  description: z.string().min(3, 'Description must be at least 3 characters.')
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type ExtraIncomeFormValues = z.infer<typeof extraIncomeSchema>;

const ProfilePage = () => {
  const { user, profile, updateProfile, addExtraIncome } = useUser();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingIncome, setIsAddingIncome] = useState(false);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile?.name || '',
      email: profile?.email || '',
      username: profile?.username || '',
      phoneNumber: profile?.phoneNumber || '',
      monthlySalary: profile?.monthlySalary || 0
    },
  });

  const incomeForm = useForm<ExtraIncomeFormValues>({
    resolver: zodResolver(extraIncomeSchema),
    defaultValues: {
      amount: 0,
      description: ''
    }
  });

  useEffect(() => {
    if (profile) {
      profileForm.reset({
        name: profile.name,
        email: profile.email,
        username: profile.username,
        phoneNumber: profile.phoneNumber || '',
        monthlySalary: profile.monthlySalary
      });
    }
  }, [profile, profileForm]);

  const onProfileSubmit = async (values: ProfileFormValues) => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      const completeProfile = {
        name: values.name,
        email: values.email,
        username: values.username,
        phoneNumber: values.phoneNumber || '',
        monthlySalary: values.monthlySalary
      };
      
      await updateProfile(completeProfile);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully."
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "There was a problem updating your profile.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onExtraIncomeSubmit = async (values: ExtraIncomeFormValues) => {
    if (!user) return;
    
    setIsAddingIncome(true);
    
    try {
      await addExtraIncome(values.amount, values.description);
      
      toast({
        title: "Extra income added",
        description: `Added ${values.amount} to your balance.`
      });
      
      incomeForm.reset({
        amount: 0,
        description: ''
      });
    } catch (error) {
      console.error("Error adding extra income:", error);
      toast({
        title: "Error",
        description: "There was a problem adding your extra income.",
        variant: "destructive"
      });
    } finally {
      setIsAddingIncome(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">Profile Settings</h1>

        <Card className="border border-gray-200 shadow-sm bg-white">
          <CardHeader className="bg-white border-b border-gray-100">
            <CardTitle>Your Profile</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <Form {...profileForm}>
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={profileForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} className="border-gray-200" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={profileForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john@example.com" {...field} className="border-gray-200" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={profileForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="johndoe" {...field} className="border-gray-200" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={profileForm.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="+1 (555) 123-4567" {...field} className="border-gray-200" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={profileForm.control}
                  name="monthlySalary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly Salary</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} className="border-gray-200" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" disabled={isLoading} className="bg-primary hover:bg-primary/90 text-white">
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm bg-white">
          <CardHeader className="bg-white border-b border-gray-100">
            <CardTitle>Add Extra Income</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <Form {...incomeForm}>
              <form onSubmit={incomeForm.handleSubmit(onExtraIncomeSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={incomeForm.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="1000" {...field} className="border-gray-200" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={incomeForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Input placeholder="Bonus, Gift, etc." {...field} className="border-gray-200" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <Button type="submit" disabled={isAddingIncome} className="bg-green-600 hover:bg-green-700 text-white">
                  {isAddingIncome ? "Adding..." : "Add Extra Income"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
