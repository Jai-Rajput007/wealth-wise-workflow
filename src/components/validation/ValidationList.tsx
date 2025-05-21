
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
  
  const handleValidate = async (id: string, approved: boolean) => {
    try {
      await validateItem(id, approved);
      
      toast({
        title: approved ? "Validated successfully" : "Item rejected",
        description: "Your financial information has been updated.",
      });
    } catch (error) {
      console.error("Error validating item:", error);
      toast({
        title: "Validation failed",
        description: "An error occurred while processing your validation.",
        variant: "destructive",
      });
    }
  };
  
  // Show a placeholder when there's nothing to validate
  if (validations.length === 0) {
    return (
      <Card className="h-full border border-gray-200 shadow-sm bg-white">
        <CardHeader className="bg-white border-b border-gray-100">
          <CardTitle>Pending Validations</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground py-6 text-center">No pending validations</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="h-full border border-gray-200 shadow-sm bg-white">
      <CardHeader className="bg-white border-b border-gray-100">
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
                      <span className="inline-flex items-center text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
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
                    className="border-primary hover:bg-primary hover:text-white"
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
