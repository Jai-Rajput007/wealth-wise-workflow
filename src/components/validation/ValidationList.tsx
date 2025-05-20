
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { useFinancial } from '@/contexts/FinancialContext';
import { useToast } from '@/hooks/use-toast';

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
                  <h3 className="font-medium">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    ₹{item.amount.toLocaleString()} • Expires: {new Date(item.expiresAt).toLocaleDateString()}
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
