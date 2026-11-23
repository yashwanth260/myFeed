enum DietaryType { veg, nonVeg, egg }

class CustomizationOption {
  final String id;
  final String name;
  final double price;

  const CustomizationOption({
    required this.id,
    required this.name,
    required this.price,
  });
}

class CustomizationGroup {
  final String id;
  final String title;
  final bool isRequired;
  final int maxSelect;
  final List<CustomizationOption> options;

  const CustomizationGroup({
    required this.id,
    required this.title,
    this.isRequired = false,
    this.maxSelect = 1,
    required this.options,
  });
}

class MenuItemModel {
  final String id;
  final String restaurantId;
  final String name;
  final String description;
  final double price;
  final double? originalPrice;
  final String imageUrl;
  final String category;
  final DietaryType dietaryType;
  final double rating;
  final int ratingCount;
  final bool isBestseller;
  final List<CustomizationGroup> customizationGroups;

  const MenuItemModel({
    required this.id,
    required this.restaurantId,
    required this.name,
    required this.description,
    required this.price,
    this.originalPrice,
    required this.imageUrl,
    required this.category,
    required this.dietaryType,
    this.rating = 4.5,
    this.ratingCount = 120,
    this.isBestseller = false,
    this.customizationGroups = const [],
  });
}

class RestaurantModel {
  final String id;
  final String name;
  final String heroImageUrl;
  final String logoUrl;
  final List<String> cuisines;
  final double rating;
  final int ratingCount;
  final int deliveryTimeMinutes;
  final double distanceKm;
  final double baseDeliveryFee;
  final String promoOffer;
  final bool isFeatured;
  final bool isOpen;
  final List<MenuItemModel> menuItems;

  const RestaurantModel({
    required this.id,
    required this.name,
    required this.heroImageUrl,
    this.logoUrl = '',
    required this.cuisines,
    required this.rating,
    required this.ratingCount,
    required this.deliveryTimeMinutes,
    required this.distanceKm,
    this.baseDeliveryFee = 35.0,
    this.promoOffer = '50% OFF up to ₹100',
    this.isFeatured = false,
    this.isOpen = true,
    this.menuItems = const [],
  });
}

