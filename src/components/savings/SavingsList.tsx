
import React, { useState } from 'react';
import { useFinancial, Saving } from '@/contexts/FinancialContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

const SavingsList: React.FC = () => {
  const { savings } = useFinancial();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  
  // Apply filters
  const filteredSavings = savings.filter((saving) => {
    const matchesSearch = saving.title.toLowerCase().includes(search.toLowerCase()) ||
                         (saving.description?.toLowerCase().includes(search.toLowerCase()) || false);
    const matchesType = typeFilter === 'all' || saving.type === typeFilter;
    
    return matchesSearch && matchesType;
  });
  
  // Get unique types from the savings
  const savingsTypes = Array.from(new Set(savings.map(s => s.type)));
  
  const formatFrequency = (frequency: string): string => {
    return frequency.charAt(0).toUpperCase() + frequency.slice(1);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>All Savings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Input
            placeholder="Search savings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="md:w-2/3"
          />
          
          <Select
            value={typeFilter}
            onValueChange={setTypeFilter}
          >
            <SelectTrigger className="md:w-1/3">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {savingsTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type === 'sip' ? 'SIP' : 
                   type === 'mutual_fund' ? 'Mutual Fund' : 
                   type === 'gullak' ? 'Gullak' : 
                   type === 'fixed_deposit' ? 'Fixed Deposit' : 
                   type.charAt(0).toUpperCase() + type.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {filteredSavings.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Return Rate</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSavings.map((saving) => (
                  <TableRow key={saving.id}>
                    <TableCell className="font-medium">{saving.title}</TableCell>
                    <TableCell className="savings-amount">₹{saving.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      {saving.type === 'sip' ? 'SIP' : 
                       saving.type === 'mutual_fund' ? 'Mutual Fund' : 
                       saving.type === 'gullak' ? 'Gullak' : 
                       saving.type === 'fixed_deposit' ? 'Fixed Deposit' : 
                       saving.type.charAt(0).toUpperCase() + saving.type.slice(1)}
                    </TableCell>
                    <TableCell>{formatFrequency(saving.frequency)}</TableCell>
                    <TableCell>
                      {saving.returnRate ? `${saving.returnRate}%` : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {saving.isValidated ? (
                        <Badge className="bg-green-500">Active</Badge>
                      ) : (
                        <Badge variant="outline">Pending</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No savings found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SavingsList;
