import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/theme/feedo_theme.dart';
import 'core/theme/theme_provider.dart';
import 'core/router/app_router.dart';
import 'core/constants/app_constants.dart';

class FeedoApp extends ConsumerWidget {
  const FeedoApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isDark = ref.watch(themeModeProvider);

    return MaterialApp.router(
      title: AppConstants.appName,
      debugShowCheckedModeBanner: false,
      routerConfig: appRouter,
      theme: FeedoTheme.lightTheme,
      darkTheme: FeedoTheme.darkTheme,
      themeMode: isDark ? ThemeMode.dark : ThemeMode.light,
    );
  }
}

