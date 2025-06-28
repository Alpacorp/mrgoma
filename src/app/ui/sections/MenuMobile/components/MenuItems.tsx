import React from 'react';

import { menuItems } from '@/app/ui/sections/Header/MenuItems';

import { MenuItem } from './MenuItem';

interface MenuItemsProps {
  onItemClick: () => void;
  animationStage: number;
}

/**
 * Component that renders the list of menu items
 */
export const MenuItems: React.FC<MenuItemsProps> = ({
  onItemClick,
  animationStage,
}) => {
  return (
    <div className="mt-8 flow-root">
      <div className="-my-6">
        <div className="space-y-4 py-6">
          {menuItems.map((item, index) => (
            <MenuItem
              key={item.name}
              name={item.name}
              href={item.href}
              index={index}
              animationStage={animationStage}
              onClick={onItemClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
