
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { UserProvider } from "@/contexts/UserContext";
import { FinancialProvider } from "@/contexts/FinancialContext";

import Index from "./pages/Index";
import ExpensePage from "./pages/ExpensePage";
import SavingsPage from "./pages/SavingsPage";
import HistoryPage from "./pages/HistoryPage";
import ProfilePage from "./pages/ProfilePage";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";
import SalarySetupPage from "./pages/SalarySetupPage";
import ValidationPage from "./pages/ValidationPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <UserProvider>
        <FinancialProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/salary-setup" element={<SalarySetupPage />} />
              <Route path="/" element={<Index />} />
              <Route path="/expenses" element={<ExpensePage />} />
              <Route path="/savings" element={<SavingsPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/validations" element={<ValidationPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </FinancialProvider>
      </UserProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
