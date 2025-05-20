
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useFinancial, ExpenseCategory } from '@/contexts/FinancialContext';

// Category colors
const COLORS = [
  '#8B5CF6', // primary
  '#EC4899', // pink
  '#3B82F6', // blue
  '#10B981', // emerald
  '#F59E0B', // amber
  '#6366F1', // indigo
  '#EF4444', // red
  '#0EA5E9', // sky
  '#F97316', // orange
  '#8B5CF6', // primary again
];

// Category labels
const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  rent: 'Rent/Housing',
  food: 'Food & Dining',
  subscription: 'Subscriptions',
  recharge: 'Recharges',
  travel: 'Travel',
  bill: 'Bills & Utilities',
  emi: 'EMIs & Loans',
  entertainment: 'Entertainment',
  shopping: 'Shopping',
  other: 'Other'
};

const ExpensesChart: React.FC = () => {
  const { expenses } = useFinancial();

  // Process data for chart
  const chartData = useMemo(() => {
    const validatedExpenses = expenses.filter(exp => exp.isValidated);
    
    // Group expenses by category
    const categoryTotals: Record<string, number> = {};
    
    validatedExpenses.forEach(expense => {
      if (!categoryTotals[expense.category]) {
        categoryTotals[expense.category] = 0;
      }
      categoryTotals[expense.category] += expense.amount;
    });
    
    // Convert to array for chart
    return Object.entries(categoryTotals).map(([category, amount]) => ({
      name: CATEGORY_LABELS[category as ExpenseCategory] || category,
      value: amount
    }));
  }, [expenses]);
  
  // Show a placeholder when there's no data
  if (chartData.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Expense Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">No expense data available</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Expense Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              fill="#8884d8"
              paddingAngle={2}
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Amount']}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default ExpensesChart;
