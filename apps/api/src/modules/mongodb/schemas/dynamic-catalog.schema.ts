import { Document } from 'mongodb';

export interface NutritionalInfo {
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
}

export interface CustomizationOptionDoc {
  optionId: string;
  name: string;
  priceModifierPaise: number;
  isDefault: boolean;
  isAvailable: boolean;
}

export interface CustomizationGroupDoc {
  groupId: string;
  groupName: string;
  minSelect: number;
  maxSelect: number;
  isRequired: boolean;
  options: CustomizationOptionDoc[];
}

export interface DynamicMenuItemDoc {
  id: string;
  name: string;
  description: string;
  basePricePaise: number;
  dietaryTags: string[]; // VEG, NON_VEG, VEGAN, GLUTEN_FREE, JAIN, KETO, HALAL
  allergens: string[];    // NUTS, DAIRY, SOY, SHELLFISH, GLUTEN
  nutritionalInfo?: NutritionalInfo;
  imageUrl?: string;
  isAvailable: boolean;
  isBestseller: boolean;
  customizationMatrix: CustomizationGroupDoc[];
  updatedAt: Date;
}

export interface DynamicCategoryDoc {
  id: string;
  name: string;
  description?: string;
  displayOrder: number;
  items: DynamicMenuItemDoc[];
}

export interface RestaurantCatalogDocument extends Document {
  _id?: any;
  restaurantId: string; // Linked to PostgreSQL restaurant UUID
  restaurantName: string;
  schemaVersion: number;
  categories: DynamicCategoryDoc[];
  promotions: Array<{
    bannerText: string;
    validUntil: Date;
    applicableItemIds: string[];
  }>;
  createdAt: Date;
  updatedAt: Date;
}
