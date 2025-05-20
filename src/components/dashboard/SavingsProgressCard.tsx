
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useFinancial, SavingsType } from '@/contexts/FinancialContext';

// Savings category labels and colors
const SAVINGS_TYPES: Record<SavingsType, { label: string, color: string }> = {
  sip: { label: 'SIP', color: 'bg-violet-500' },
  mutual_fund: { label: 'Mutual Fund', color: 'bg-blue-500' },
  gullak: { label: 'Gullak', color: 'bg-amber-500' },
  fixed_deposit: { label: 'Fixed Deposit', color: 'bg-green-500' },
  other: { label: 'Other', color: 'bg-slate-500' }
};

const SavingsProgressCard: React.FC = () => {
  const { savings, totalSaved } = useFinancial();

  // Calculate savings distribution by type
  const savingsData = useMemo(() => {
    const validatedSavings = savings.filter(saving => saving.isValidated);
    
    // Group savings by type
    const typeTotals: Record<string, number> = {};
    let total = 0;
    
    validatedSavings.forEach(saving => {
      if (!typeTotals[saving.type]) {
        typeTotals[saving.type] = 0;
      }
      typeTotals[saving.type] += saving.amount;
      total += saving.amount;
    });
    
    // Convert to array with percentages
    return Object.entries(typeTotals).map(([type, amount]) => ({
      type: type as SavingsType,
      label: SAVINGS_TYPES[type as SavingsType]?.label || type,
      amount,
      percentage: total > 0 ? (amount / total) * 100 : 0,
      color: SAVINGS_TYPES[type as SavingsType]?.color || 'bg-slate-500'
    }));
  }, [savings]);
  
  // Show a placeholder when there's no data
  if (savings.length === 0 || totalSaved === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Savings Progress</CardTitle>
        </CardHeader>
        <CardContent className="py-6">
          <p className="text-muted-foreground text-center">No savings data available</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Savings Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span>Total Savings</span>
            <span className="font-medium">₹{totalSaved.toLocaleString()}</span>
          </div>
          <Progress value={100} className="bg-muted h-2" />
        </div>
        
        {savingsData.map((item) => (
          <div key={item.type} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span>{item.label}</span>
              <span>₹{item.amount.toLocaleString()}</span>
            </div>
            <Progress 
              value={item.percentage} 
              className={`h-2 ${item.color}`} 
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default SavingsProgressCard;
