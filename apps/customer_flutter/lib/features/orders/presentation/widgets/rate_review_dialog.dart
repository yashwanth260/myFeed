import 'package:flutter/material.dart';
import '../../../../core/theme/feedo_colors.dart';
import '../../../../shared/widgets/feedo_button.dart';

class RateReviewDialog extends StatefulWidget {
  final String orderNumber;
  final String restaurantName;

  const RateReviewDialog({
    super.key,
    required this.orderNumber,
    required this.restaurantName,
  });

  @override
  State<RateReviewDialog> createState() => _RateReviewDialogState();
}

class _RateReviewDialogState extends State<RateReviewDialog> {
  int _selectedStars = 5;
  final TextEditingController _commentController = TextEditingController();

  final List<String> _tags = const [
    'Hot & Fresh',
    'Gold Packaging',
    'Super Fast',
    'Delicious Taste',
    'Great Portion',
  ];
  final Set<String> _selectedTags = {};

  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
      title: Column(
        children: [
          const Text(
            'Rate Your Feast',
            style: TextStyle(fontFamily: 'Poppins', fontWeight: FontWeight.w700, fontSize: 18),
          ),
          const SizedBox(height: 4),
          Text(
            widget.restaurantName,
            style: const TextStyle(fontFamily: 'Inter', fontSize: 13, color: Colors.grey),
          ),
        ],
      ),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // 5 Stars
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(5, (index) {
                final starIndex = index + 1;
                return IconButton(
                  icon: Icon(
                    starIndex <= _selectedStars ? Icons.star_rounded : Icons.star_border_rounded,
                    color: FeedoColors.starRating,
                    size: 34,
                  ),
                  onPressed: () => setState(() => _selectedStars = starIndex),
                );
              }),
            ),
            const SizedBox(height: 12),

            // Compliment Chips
            Wrap(
              spacing: 6,
              runSpacing: 6,
              children: _tags.map((tag) {
                final isSelected = _selectedTags.contains(tag);
                return FilterChip(
                  label: Text(tag, style: const TextStyle(fontSize: 11)),
                  selected: isSelected,
                  selectedColor: FeedoColors.lightGold.withOpacity(0.4),
                  onSelected: (val) {
                    setState(() {
                      if (val) {
                        _selectedTags.add(tag);
                      } else {
                        _selectedTags.remove(tag);
                      }
                    });
                  },
                );
              }).toList(),
            ),
            const SizedBox(height: 14),

            TextField(
              controller: _commentController,
              maxLines: 2,
              decoration: InputDecoration(
                hintText: 'Add a review comment for the chef...',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Cancel'),
        ),
        FeedoButton(
          text: 'Submit Review',
          height: 42,
          onPressed: () {
            Navigator.pop(context);
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Thank you! Your feedback has been shared with the kitchen.'),
                backgroundColor: FeedoColors.success,
              ),
            );
          },
        ),
      ],
    );
  }
}

