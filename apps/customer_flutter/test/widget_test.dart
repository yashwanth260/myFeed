import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:feedo_customer/shared/widgets/feedo_button.dart';

void main() {
  testWidgets('FeedoButton renders text and triggers callback', (WidgetTester tester) async {
    bool tapped = false;

    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: Center(
            child: FeedoButton(
              text: 'Order Feast',
              onPressed: () {
                tapped = true;
              },
            ),
          ),
        ),
      ),
    );

    expect(find.text('Order Feast'), findsOneWidget);

    await tester.tap(find.text('Order Feast'));
    await tester.pumpAndSettle();

    expect(tapped, isTrue);
  });
}
