
import React, { useState } from 'react';
import { useFinancial, Expense } from '@/contexts/FinancialContext';
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
import { format } from 'date-fns';

const ExpensesList: React.FC = () => {
  const { expenses } = useFinancial();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  
  // Apply filters
  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch = expense.title.toLowerCase().includes(search.toLowerCase()) ||
                         (expense.description?.toLowerCase().includes(search.toLowerCase()) || false);
    const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter;
    const matchesType = typeFilter === 'all' || expense.type === typeFilter;
    
    return matchesSearch && matchesCategory && matchesType;
  });
  
  // Get unique categories from the expenses
  const expenseCategories = Array.from(new Set(expenses.map(e => e.category)));
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>All Expenses</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Input
            placeholder="Search expenses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="md:w-1/3"
          />
          
          <Select
            value={categoryFilter}
            onValueChange={setCategoryFilter}
          >
            <SelectTrigger className="md:w-1/3">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {expenseCategories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select
            value={typeFilter}
            onValueChange={setTypeFilter}
          >
            <SelectTrigger className="md:w-1/3">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="permanent">Recurring</SelectItem>
              <SelectItem value="temporary">One-time</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {filteredExpenses.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell className="font-medium">{expense.title}</TableCell>
                    <TableCell className="expense-amount">₹{expense.amount.toLocaleString()}</TableCell>
                    <TableCell>{format(new Date(expense.date), 'PP')}</TableCell>
                    <TableCell>
                      {expense.category.charAt(0).toUpperCase() + expense.category.slice(1)}
                    </TableCell>
                    <TableCell>
                      {expense.type === 'permanent' ? 'Recurring' : 'One-time'}
                    </TableCell>
                    <TableCell>
                      {expense.isValidated ? (
                        <span className="text-green-500">Validated</span>
                      ) : (
                        <span className="text-amber-500">Pending</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No expenses found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExpensesList;
