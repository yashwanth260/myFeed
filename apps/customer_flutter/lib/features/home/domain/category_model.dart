class CategoryModel {
  final String id;
  final String name;
  final String subname; // Regional Kannada subtitle
  final String icon;
  final String imageUrl;
  final String description;
  final bool isParcel;
  final String? badgeText;

  const CategoryModel({
    required this.id,
    required this.name,
    this.subname = '',
    required this.icon,
    required this.imageUrl,
    this.description = '',
    this.isParcel = false,
    this.badgeText,
  });
}
