import 'package:flutter/material.dart';
import '../../../../core/theme/feedo_colors.dart';

class PromoCarousel extends StatefulWidget {
  final ValueChanged<String>? onPromoTap;

  const PromoCarousel({super.key, this.onPromoTap});

  @override
  State<PromoCarousel> createState() => _PromoCarouselState();
}

class _PromoCarouselState extends State<PromoCarousel> {
  final PageController _controller = PageController(viewportFraction: 0.92);
  int _currentPage = 0;

  final List<_PromoBannerData> _banners = const [
    _PromoBannerData(
      tag: 'GOLD EXCLUSIVE',
      headline: '50% Delicious Savings',
      subtext: 'Up to ₹100 on chef royal recipes',
      code: 'FEEDO50',
      gradient: FeedoColors.goldGradient,
      textColor: FeedoColors.textPrimaryLight,
      imageIcon: '👑',
    ),
    _PromoBannerData(
      tag: 'PREMIUM TASTE',
      headline: '20% Flat Gold Discount',
      subtext: 'Valid across all Biryanis & Sourdough crusts',
      code: 'GOLD20',
      gradient: LinearGradient(
        colors: [Color(0xFF2A2416), Color(0xFF1B170E)],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      ),
      textColor: FeedoColors.lightGold,
      imageIcon: '✨',
    ),
    _PromoBannerData(
      tag: 'ZERO FEE',
      headline: 'Free Priority Delivery',
      subtext: 'On all orders above ₹249 doorstep verified',
      code: 'FREEDEL',
      gradient: LinearGradient(
        colors: [Color(0xFF1B3828), Color(0xFF0F2218)],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      ),
      textColor: Colors.white,
      imageIcon: '🚴',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        SizedBox(
          height: 145,
          child: PageView.builder(
            controller: _controller,
            itemCount: _banners.length,
            onPageChanged: (i) => setState(() => _currentPage = i),
            itemBuilder: (context, index) {
              final b = _banners[index];
              return GestureDetector(
                onTap: () => widget.onPromoTap?.call(b.code),
                child: Container(
                  margin: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    gradient: b.gradient,
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.08),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                              decoration: BoxDecoration(
                                color: Colors.black.withOpacity(0.18),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                b.tag,
                                style: TextStyle(
                                  fontFamily: 'Inter',
                                  fontSize: 9,
                                  fontWeight: FontWeight.w800,
                                  color: b.textColor,
                                  letterSpacing: 0.5,
                                ),
                              ),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              b.headline,
                              style: TextStyle(
                                fontFamily: 'Poppins',
                                fontSize: 16,
                                fontWeight: FontWeight.w700,
                                color: b.textColor,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              b.subtext,
                              style: TextStyle(
                                fontFamily: 'Inter',
                                fontSize: 11,
                                color: b.textColor.withOpacity(0.85),
                              ),
                            ),
                            const SizedBox(height: 8),
                            Row(
                              children: [
                                Text(
                                  'Use code ',
                                  style: TextStyle(
                                    fontFamily: 'Inter',
                                    fontSize: 11,
                                    color: b.textColor,
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: Colors.white.withOpacity(0.2),
                                    borderRadius: BorderRadius.circular(4),
                                    border: Border.all(color: Colors.white.withOpacity(0.4)),
                                  ),
                                  child: Text(
                                    b.code,
                                    style: TextStyle(
                                      fontFamily: 'Inter',
                                      fontSize: 11,
                                      fontWeight: FontWeight.w800,
                                      color: b.textColor,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                      Text(
                        b.imageIcon,
                        style: const TextStyle(fontSize: 48),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
        const SizedBox(height: 8),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: List.generate(_banners.length, (i) {
            return AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              margin: const EdgeInsets.symmetric(horizontal: 3),
              width: _currentPage == i ? 18 : 6,
              height: 5,
              decoration: BoxDecoration(
                color: _currentPage == i ? FeedoColors.primaryGold : Colors.grey.withOpacity(0.3),
                borderRadius: BorderRadius.circular(3),
              ),
            );
          }),
        ),
      ],
    );
  }
}

class _PromoBannerData {
  final String tag;
  final String headline;
  final String subtext;
  final String code;
  final Gradient gradient;
  final Color textColor;
  final String imageIcon;

  const _PromoBannerData({
    required this.tag,
    required this.headline,
    required this.subtext,
    required this.code,
    required this.gradient,
    required this.textColor,
    required this.imageIcon,
  });
}

