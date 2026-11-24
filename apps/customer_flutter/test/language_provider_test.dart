import 'package:flutter_test/flutter_test.dart';
import 'package:feedo_customer/core/localization/language_provider.dart';

void main() {
  group('Language Provider & AppStrings Tests', () {
    test('English translations provide default strings', () {
      final strings = AppStrings(AppLanguage.english);

      expect(strings.isKn, isFalse);
      expect(strings.selectLanguageTitle, 'Choose Your Language');
      expect(strings.continueBtn, 'Continue');
      expect(strings.navHome, 'Home');
      expect(strings.navOrders, 'Orders');
      expect(strings.whatLookingFor, 'What are you craving?');
    });

    test('Kannada translations provide Kannada strings', () {
      final strings = AppStrings(AppLanguage.kannada);

      expect(strings.isKn, isTrue);
      expect(strings.selectLanguageTitle, 'ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ');
      expect(strings.continueBtn, 'ಮುಂದುವರಿಯಿರಿ');
      expect(strings.navHome, 'ಮುಖಪುಟ');
      expect(strings.navOrders, 'ಆರ್ಡರ್‌ಗಳು');
      expect(strings.whatLookingFor, 'ನಿಮಗೆ ಏನು ಬೇಕು?');
    });

    test('AppLanguage enum resolves code correctly', () {
      expect(AppLanguage.fromCode('en'), AppLanguage.english);
      expect(AppLanguage.fromCode('kn'), AppLanguage.kannada);
      expect(AppLanguage.fromCode('unknown'), AppLanguage.english);
    });
  });
}
