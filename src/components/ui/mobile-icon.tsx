
import React from 'react';
import { Menu, X } from 'lucide-react';

interface MobileIconProps {
  showMobileMenu: boolean;
}

export const MobileIcon: React.FC<MobileIconProps> = ({ showMobileMenu }) => {
  return showMobileMenu ? (
    <X className="h-6 w-6" />
  ) : (
    <Menu className="h-6 w-6" />
  );
};
