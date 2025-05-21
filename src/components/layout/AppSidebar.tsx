
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, DollarSign, PiggyBank, History } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from '@/components/ui/sidebar';

const AppSidebar = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const sidebarItems = [
    {
      title: 'Dashboard',
      path: '/',
      icon: LayoutDashboard,
    },
    {
      title: 'Expenses',
      path: '/expenses',
      icon: DollarSign,
    },
    {
      title: 'Savings',
      path: '/savings',
      icon: PiggyBank,
    },
    {
      title: 'History',
      path: '/history',
      icon: History,
    },
  ];

  return (
    <div className="h-full border-r border-gray-200 w-[250px] bg-white">
      <div className="py-4">
        <SidebarProvider>
          <Sidebar collapsible="none">
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {sidebarItems.map((item) => (
                      <SidebarMenuItem key={item.path}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive(item.path)}
                        >
                          <Link to={item.path} className={cn(
                            "flex items-center gap-3 px-3 py-2 text-sm font-medium",
                            isActive(item.path) ? "text-primary" : "text-gray-600 hover:text-primary"
                          )}>
                            <item.icon className="h-5 w-5" />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
        </SidebarProvider>
      </div>
    </div>
  );
};

export default AppSidebar;
