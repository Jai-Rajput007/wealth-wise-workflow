
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X, Calendar } from 'lucide-react';
import { useFinancial } from '@/contexts/FinancialContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const ValidationList: React.FC = () => {
  const { validations, validateItem } = useFinancial();
  const { toast } = useToast();
  
  const handleValidate = (id: string, approved: boolean) => {
    validateItem(id, approved);
    
    toast({
      title: approved ? "Validated successfully" : "Item rejected",
      description: "Your financial information has been updated.",
    });
  };
  
  // Show a placeholder when there's nothing to validate
  if (validations.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Pending Validations</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground py-6 text-center">No pending validations</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Pending Validations</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y">
          {validations.map((item) => (
            <li key={item.id} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{item.title}</h3>
                    {item.type === 'future_expense' && (
                      <span className="inline-flex items-center text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                        <Calendar className="w-3 h-3 mr-1" />
                        {format(new Date(item.date), 'MMM d')}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    ₹{item.amount.toLocaleString()} • 
                    {item.type === 'future_expense' 
                      ? ` Scheduled for: ${format(new Date(item.date), 'PP')}` 
                      : ` Expires: ${format(new Date(item.expiresAt), 'PP')}`}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="border-red-500 hover:bg-red-500 hover:text-white"
                    onClick={() => handleValidate(item.id, false)}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Reject
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="border-green-500 hover:bg-green-500 hover:text-white"
                    onClick={() => handleValidate(item.id, true)}
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Approve
                  </Button>
                </div>
              </div>
              {item.description && (
                <p className="text-sm text-muted-foreground">{item.description}</p>
              )}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default ValidationList;
