# 🚀 MedLynx Quick Start Guide

## Prerequisites

### Required Software
- **Node.js** 18.x or higher ([Download](https://nodejs.org/))
- **npm** or **yarn** package manager
- **Expo CLI** (`npm install -g @expo/cli`)
- **Git** for version control

### For iOS Development
- **macOS** required
- **Xcode** 15.x or higher
- **iOS Simulator** or physical iOS device
- **Apple Developer Account** (for device testing)

### For Android Development
- **Android Studio** with Android SDK
- **Android Emulator** or physical Android device
- **Java Development Kit (JDK)** 11 or higher

## 🏁 Quick Setup (5 minutes)

```bash
# 1. Clone the repository
git clone https://github.com/lynxsa/MedLynx.git
cd MedLynx/MedLynx

# 2. Install dependencies
npm install

# 3. Verify setup
npm run type-check

# 4. Start development server
npm start
```

## 📱 Running the App

### Option 1: Expo Go (Recommended for beginners)
1. Install **Expo Go** on your mobile device
2. Run `npm start`
3. Scan the QR code with your device camera

### Option 2: iOS Simulator
```bash
npm run ios
```

### Option 3: Android Emulator
```bash
npm run android
```

## 🛠️ Development Commands

```bash
# Development
npm start              # Start Expo development server
npm run dev           # Type check + start server
npm run ios           # Run on iOS simulator
npm run android       # Run on Android emulator

# Code Quality
npm run type-check    # TypeScript validation
npm run lint          # ESLint code analysis
npm run lint:fix      # Auto-fix linting issues
npm run test          # Full test suite

# Build & Deploy
npm run build:ios     # Build for iOS App Store
npm run build:android # Build for Google Play Store
npm run prebuild      # Generate native code
```

## 📁 Project Structure Overview

```
MedLynx/
├── app/                    # Expo Router screens
├── components/             # Reusable UI components
├── constants/              # Theme and configuration
├── contexts/               # React contexts (Theme, App state)
├── hooks/                  # Custom React hooks
├── i18n/                   # Internationalization
├── locales/                # Translation files
├── utils/                  # Utility functions
└── types/                  # TypeScript definitions
```

## 🎨 Key Development Patterns

### Theme Usage
```typescript
import { useTheme } from '../contexts/ThemeContext';
import { useThemeColor } from '../hooks/useThemeColor';

const { theme } = useTheme();
const primaryColor = useThemeColor('primary');
```

### Notification Service
```typescript
import { EnhancedNotificationService } from '../utils/EnhancedNotificationService';

await EnhancedNotificationService.scheduleMedicationReminder(reminder);
```

### Internationalization
```typescript
import { useTranslation } from 'react-i18next';

const { t } = useTranslation(['common', 'health']);
const title = t('common:welcome');
```

## 🐛 Common Issues & Solutions

### Metro bundler issues
```bash
npx expo start --clear
```

### iOS simulator not starting
```bash
npx expo run:ios --device
```

### Android emulator issues
```bash
npx expo run:android --device
```

### TypeScript errors
```bash
npm run type-check
# Fix errors and re-run
```

### Dependency issues
```bash
npm run clean
npm install
```

## 🔧 IDE Setup (VS Code Recommended)

### Required Extensions
- **ES7+ React/Redux/React-Native snippets**
- **TypeScript Importer**
- **Expo Tools**
- **Prettier - Code formatter**
- **ESLint**

### Workspace Settings
```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

## 📚 Learning Resources

### Expo Documentation
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [Expo Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Expo SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore/)

### React Native
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [React Navigation](https://reactnavigation.org/docs/getting-started)

### TypeScript
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

## 🚀 Ready to Contribute!

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Run tests: `npm run test`
4. Commit: `git commit -m "feat: your feature description"`
5. Push: `git push origin feature/your-feature`
6. Create a Pull Request

## 📞 Need Help?

- Check the [README.md](./README.md) for detailed documentation
- Review [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) for production info
- Check existing issues on GitHub
- Contact the development team

---

**Welcome to the MedLynx development team! 🎉**
