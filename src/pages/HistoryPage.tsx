
import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useFinancial, Transaction } from '@/contexts/FinancialContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { ArrowDown, ArrowUp, PiggyBank, Wallet } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const HistoryPage = () => {
  const { transactions } = useFinancial();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  
  // Apply filters
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch = transaction.title.toLowerCase().includes(search.toLowerCase()) ||
                          (transaction.description?.toLowerCase().includes(search.toLowerCase()) || false);
    const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
    
    // Check dates if filters are applied
    let matchesDate = true;
    if (startDate) {
      matchesDate = matchesDate && new Date(transaction.date) >= startDate;
    }
    if (endDate) {
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);
      matchesDate = matchesDate && new Date(transaction.date) <= endOfDay;
    }
    
    return matchesSearch && matchesType && matchesDate;
  });
  
  // Sort transactions by date (most recent first)
  const sortedTransactions = [...filteredTransactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  const getTransactionIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'expense':
        return <ArrowDown className="w-4 h-4 text-money-negative" />;
      case 'income':
        return <ArrowUp className="w-4 h-4 text-money-positive" />;
      case 'saving':
        return <PiggyBank className="w-4 h-4 text-money-savings" />;
      case 'return':
        return <Wallet className="w-4 h-4 text-money-neutral" />;
      default:
        return <ArrowDown className="w-4 h-4" />;
    }
  };
  
  const getAmountClass = (type: Transaction['type']) => {
    switch (type) {
      case 'expense':
        return 'expense-amount';
      case 'income':
        return 'income-amount';
      case 'saving':
        return 'savings-amount';
      case 'return':
        return 'neutral-amount';
      default:
        return '';
    }
  };
  
  const getAmountPrefix = (type: Transaction['type']) => {
    switch (type) {
      case 'expense':
      case 'saving':
        return '-';
      case 'income':
      case 'return':
        return '+';
      default:
        return '';
    }
  };
  
  const resetFilters = () => {
    setSearch('');
    setTypeFilter('all');
    setStartDate(undefined);
    setEndDate(undefined);
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Transaction History</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="Search transactions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              
              <Select
                value={typeFilter}
                onValueChange={setTypeFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="expense">Expenses</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="saving">Savings</SelectItem>
                  <SelectItem value="return">Returns</SelectItem>
                </SelectContent>
              </Select>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "pl-3 text-left w-full justify-between",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    {startDate ? format(startDate, "PP") : "Start date"}
                    <CalendarIcon className="h-4 w-4 ml-2" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "pl-3 text-left w-full justify-between",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    {endDate ? format(endDate, "PP") : "End date"}
                    <CalendarIcon className="h-4 w-4 ml-2" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="mt-4 flex justify-end">
              <Button variant="outline" onClick={resetFilters}>
                Reset Filters
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Transaction Records</CardTitle>
          </CardHeader>
          <CardContent>
            {sortedTransactions.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="p-2 rounded-full bg-muted">
                              {getTransactionIcon(transaction.type)}
                            </div>
                            <span>
                              {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{format(new Date(transaction.date), 'PP')}</TableCell>
                        <TableCell className="font-medium">{transaction.title}</TableCell>
                        <TableCell>{transaction.category || 'N/A'}</TableCell>
                        <TableCell>{transaction.description || 'N/A'}</TableCell>
                        <TableCell className={getAmountClass(transaction.type)}>
                          {getAmountPrefix(transaction.type)}₹{transaction.amount.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No transactions found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default HistoryPage;
