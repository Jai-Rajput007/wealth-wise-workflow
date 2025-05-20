
import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useUser } from '@/contexts/UserContext';
import { useFinancial } from '@/contexts/FinancialContext';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Separator } from '@/components/ui/separator';
import { UserProfile } from '@/contexts/UserContext';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  email: z.string().email('Please enter a valid email'),
  phoneNumber: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number must be at most 15 digits'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(/^[a-z0-9_]+$/, 'Username can only contain lowercase letters, numbers, and underscores'),
  monthlySalary: z.coerce.number().min(1, 'Salary must be greater than 0'),
});

const incomeSchema = z.object({
  amount: z.coerce.number().min(1, 'Amount must be greater than 0'),
  description: z.string().min(2, 'Description is required').max(50),
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type IncomeFormValues = z.infer<typeof incomeSchema>;

const ProfilePage = () => {
  const { profile, updateProfile, addExtraIncome, loading } = useUser();
  const { addTransaction } = useFinancial();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(!profile);
  
  const defaultValues: UserProfile = {
    name: '',
    email: '',
    phoneNumber: '',
    username: '',
    monthlySalary: 0,
  };
  
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: profile || defaultValues,
  });
  
  const incomeForm = useForm<IncomeFormValues>({
    resolver: zodResolver(incomeSchema),
    defaultValues: {
      amount: 0,
      description: '',
    },
  });
  
  const onProfileSubmit = async (data: ProfileFormValues) => {
    try {
      await updateProfile(data);
      setIsEditing(false);
      toast({
        title: 'Profile updated successfully',
        description: 'Your profile information has been saved.',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Failed to update profile',
        description: 'An error occurred while saving your profile.',
        variant: 'destructive',
      });
    }
  };
  
  const onAddIncome = async (data: IncomeFormValues) => {
    try {
      addExtraIncome(data.amount, data.description);
      
      // Add transaction
      await addTransaction({
        title: data.description,
        amount: data.amount,
        date: new Date().toISOString(),
        type: 'income',
        description: 'Extra income',
      });
      
      toast({
        title: 'Income added successfully',
        description: `Added ₹${data.amount.toLocaleString()} to your account.`,
      });
      
      incomeForm.reset({
        amount: 0,
        description: '',
      });
    } catch (error) {
      console.error('Error adding income:', error);
      toast({
        title: 'Failed to add income',
        description: 'An error occurred while adding your income.',
        variant: 'destructive',
      });
    }
  };
  
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading profile information...</p>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout requireAuth={true}>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Profile</h1>
        
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-white">
            <TabsTrigger value="profile">Profile Information</TabsTrigger>
            <TabsTrigger value="income">Add Extra Income</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <Card className="border border-gray-200">
              <CardHeader className="bg-white">
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  {isEditing
                    ? 'Enter your personal details and financial information.'
                    : 'Your personal details and monthly income.'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Form {...profileForm}>
                    <form
                      id="profile-form"
                      onSubmit={profileForm.handleSubmit(onProfileSubmit)}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={profileForm.control}
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
                          control={profileForm.control}
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
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={profileForm.control}
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
                          control={profileForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormDescription>
                                This will be used for splitting expenses
                              </FormDescription>
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
                            <FormLabel>Monthly Salary (₹)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormDescription>
                              Your primary monthly income
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </form>
                  </Form>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium">Personal Information</h3>
                      <Separator className="my-2" />
                      <dl className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 mt-4">
                        <div>
                          <dt className="text-sm text-muted-foreground">Name</dt>
                          <dd className="mt-1">{profile?.name}</dd>
                        </div>
                        <div>
                          <dt className="text-sm text-muted-foreground">Email</dt>
                          <dd className="mt-1">{profile?.email}</dd>
                        </div>
                        <div>
                          <dt className="text-sm text-muted-foreground">Phone Number</dt>
                          <dd className="mt-1">{profile?.phoneNumber}</dd>
                        </div>
                        <div>
                          <dt className="text-sm text-muted-foreground">Username</dt>
                          <dd className="mt-1">{profile?.username}</dd>
                        </div>
                      </dl>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium">Financial Information</h3>
                      <Separator className="my-2" />
                      <dl className="mt-4">
                        <div>
                          <dt className="text-sm text-muted-foreground">Monthly Salary</dt>
                          <dd className="mt-1 text-xl font-semibold text-green-600">
                            ₹{profile?.monthlySalary.toLocaleString()}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-end gap-2 bg-white">
                {isEditing ? (
                  <Button type="submit" form="profile-form">
                    Save Profile
                  </Button>
                ) : (
                  <Button onClick={() => setIsEditing(true)}>
                    Edit Profile
                  </Button>
                )}
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="income">
            <Card className="border border-gray-200">
              <CardHeader className="bg-white">
                <CardTitle>Add Extra Income</CardTitle>
                <CardDescription>
                  Record any additional income besides your regular salary
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...incomeForm}>
                  <form
                    id="income-form"
                    onSubmit={incomeForm.handleSubmit(onAddIncome)}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={incomeForm.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Amount (₹)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
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
                              <Input placeholder="Bonus, Gift, Freelance, etc." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="flex justify-end bg-white">
                <Button type="submit" form="income-form">
                  Add Income
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
