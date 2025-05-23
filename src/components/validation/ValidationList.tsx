
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X, Calendar, BellRing } from 'lucide-react';
import { useFinancial } from '@/contexts/FinancialContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { motion, Variants } from 'framer-motion';
import { toast as sonnerToast } from 'sonner';

const ValidationList: React.FC = () => {
  const { validations, validateItem } = useFinancial();
  const { toast } = useToast();
  
  const handleValidate = async (id: string, approved: boolean) => {
    try {
      await validateItem(id, approved);
      
      sonnerToast[approved ? 'success' : 'info'](
        approved ? "Validated successfully" : "Item rejected",
        {
          description: "Your financial information has been updated.",
          duration: 3000,
        }
      );
    } catch (error) {
      console.error("Error validating item:", error);
      toast({
        title: "Validation failed",
        description: "An error occurred while processing your validation.",
        variant: "destructive",
      });
    }
  };

  // Define proper animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };
  
  // Show a placeholder when there's nothing to validate
  if (validations.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="h-full border border-gray-200 shadow-sm bg-white">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b border-gray-100">
            <CardTitle className="text-blue-700 flex items-center">
              <BellRing className="h-5 w-5 mr-2 text-blue-500" />
              Pending Validations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="py-12 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                <Check className="h-8 w-8 text-blue-400" />
              </div>
              <p className="text-muted-foreground">No pending validations</p>
              <p className="text-sm text-gray-400 mt-1">You're all caught up!</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="h-full border border-gray-200 shadow-sm bg-white overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b border-gray-100">
          <CardTitle className="text-blue-700 flex items-center">
            <BellRing className="h-5 w-5 mr-2 text-blue-500" />
            Pending Validations
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <motion.ul 
            className="divide-y"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {validations.map((item) => (
              <motion.li 
                key={item.id} 
                className="p-4 hover:bg-gray-50 transition-colors"
                variants={itemVariants}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-blue-700">{item.title}</h3>
                      {item.type === 'future_expense' && (
                        <span className="inline-flex items-center text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                          <Calendar className="w-3 h-3 mr-1" />
                          {format(new Date(item.date), 'MMM d')}
                        </span>
                      )}
                      {item.type === 'split_expense' && (
                        <span className="inline-flex items-center text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full">
                          Split Request
                        </span>
                      )}
                      {item.type === 'saving_return' && (
                        <span className="inline-flex items-center text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full">
                          Return
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
                  <div className="flex items-center space-x-2 self-end md:self-auto">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="border-red-400 text-red-500 hover:bg-red-500 hover:text-white"
                        onClick={() => handleValidate(item.id, false)}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="border-green-400 text-green-500 hover:bg-green-500 hover:text-white"
                        onClick={() => handleValidate(item.id, true)}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                    </motion.div>
                  </div>
                </div>
                {item.description && (
                  <p className="text-sm text-muted-foreground bg-gray-50 p-2 rounded-md">{item.description}</p>
                )}
              </motion.li>
            ))}
          </motion.ul>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ValidationList;
