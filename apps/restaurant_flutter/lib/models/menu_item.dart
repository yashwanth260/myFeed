class MenuItem {
  final String id;
  final String name;
  final String category;
  final String description;
  final int pricePaise;
  final String imageUrl;
  final bool isVeg;
  bool isAvailable;

  MenuItem({
    required this.id,
    required this.name,
    required this.category,
    required this.description,
    required this.pricePaise,
    required this.imageUrl,
    required this.isVeg,
    required this.isAvailable,
  });

  factory MenuItem.fromJson(Map<String, dynamic> json) {
    return MenuItem(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      category: json['category'] ?? json['section'] ?? 'Main Course',
      description: json['description'] ?? '',
      pricePaise: json['pricePaise'] ?? json['price_paise'] ?? 0,
      imageUrl: json['imageUrl'] ?? json['image_url'] ?? '',
      isVeg: json['dietaryType'] == 'VEG' || json['isVeg'] == true,
      isAvailable: json['isAvailable'] ?? json['is_available'] ?? true,
    );
  }

  String get formattedPrice => '₹${(pricePaise / 100).toStringAsFixed(2)}';
}

