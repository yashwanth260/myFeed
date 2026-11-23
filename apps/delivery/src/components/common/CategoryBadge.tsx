import React from 'react';
import { CategoryType } from '../../types';
import { Utensils, ShoppingCart, Carrot, Beef, Shirt, Smartphone, Package } from 'lucide-react';

interface CategoryBadgeProps {
  category: CategoryType;
  showIconOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category, showIconOnly = false, size = 'md' }) => {
  const getCategoryConfig = (cat: CategoryType) => {
    switch (cat) {
      case 'FOOD':
        return {
          label: 'FOOD',
          icon: Utensils,
          bgColor: 'bg-amber-100',
          textColor: 'text-amber-950',
          borderColor: 'border-amber-300',
        };
      case 'GROCERY':
        return {
          label: 'GROCERY',
          icon: ShoppingCart,
          bgColor: 'bg-emerald-100',
          textColor: 'text-emerald-950',
          borderColor: 'border-emerald-300',
        };
      case 'VEGETABLES':
        return {
          label: 'FRUITS & VEG',
          icon: Carrot,
          bgColor: 'bg-green-100',
          textColor: 'text-green-950',
          borderColor: 'border-green-300',
        };
      case 'MEAT':
        return {
          label: 'FRESH MEAT',
          icon: Beef,
          bgColor: 'bg-rose-100',
          textColor: 'text-rose-950',
          borderColor: 'border-rose-300',
        };
      case 'FASHION':
        return {
          label: 'FASHION',
          icon: Shirt,
          bgColor: 'bg-purple-100',
          textColor: 'text-purple-950',
          borderColor: 'border-purple-300',
        };
      case 'ELECTRONICS':
        return {
          label: 'ELECTRONICS',
          icon: Smartphone,
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-950',
          borderColor: 'border-blue-300',
        };
      case 'HYPERLOCAL':
      default:
        return {
          label: 'HYPERLOCAL',
          icon: Package,
          bgColor: 'bg-slate-100',
          textColor: 'text-slate-900',
          borderColor: 'border-slate-300',
        };
    }
  };

  const config = getCategoryConfig(category);
  const Icon = config.icon;

  const iconSizes = {
    sm: 13,
    md: 15,
    lg: 18,
  };

  if (showIconOnly) {
    return (
      <div className={`p-2 rounded-xl border ${config.bgColor} ${config.textColor} ${config.borderColor} flex items-center justify-center shadow-xs`}>
        <Icon size={iconSizes[size]} />
      </div>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border ${config.bgColor} ${config.textColor} ${config.borderColor} shadow-xs`}>
      <Icon size={iconSizes[size]} />
      <span>{config.label}</span>
    </span>
  );
};
