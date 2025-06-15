# Welcome to your Expo app 👋

# MedLYNX - Medication Tracking App

A professional medication tracking app built with React Native, Expo, and TypeScript. This app helps users manage their medications with custom reminders, refill tracking, and biometric authentication.

## 🚀 Features

### Core Features
- **Medication Management**: Add, edit, and delete medications with custom schedules
- **Smart Reminders**: Custom notification times for each medication
- **Refill Tracking**: Monitor pill supplies and refill dates
- **Progress Tracking**: Daily medication adherence visualization
- **Biometric Authentication**: Secure access with Face ID/Touch ID
- **Calendar Integration**: View medication schedules in calendar format
- **Local Data Storage**: Secure offline data with AsyncStorage

### User Interface
- **Modern Design**: Clean, intuitive interface with gradient backgrounds
- **Color-Coded Medications**: Visual organization with custom colors
- **Responsive Layout**: Optimized for both iOS and Android
- **Smooth Animations**: Enhanced user experience with React Native Reanimated
- **Dark/Light Theme Support**: Adaptive design for user preferences

## 📱 Tech Stack

- **React Native**: Cross-platform mobile development
- **Expo**: Native app features and tooling
- **TypeScript**: Type-safe codebase
- **React Navigation**: Smooth app navigation
- **AsyncStorage**: Local data persistence
- **Expo Notifications**: Push notification system (planned)
- **React Native Reanimated**: Smooth animations
- **Expo Linear Gradient**: Beautiful gradient backgrounds
- **React Native Safe Area Context**: Safe area handling

## 🛠 Installation

1. **Clone the repository**
   ```bash
   cd MedLYNX/MedLynx
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on device/simulator**
   - iOS: Press `i` or scan QR code with Camera app
   - Android: Press `a` or scan QR code with Expo Go app
   - Web: Press `w` or visit http://localhost:8081

## 📱 App Structure

```
MedLynx/
├── app/
│   └── (tabs)/
│       ├── index.tsx          # Splash Screen
│       ├── auth.tsx           # Authentication Screen
│       ├── home.tsx           # Main Dashboard
│       ├── add-medication.tsx # Add Medication Form
│       ├── profile.tsx        # User Profile & Settings
│       ├── calendar.tsx       # Calendar View
│       └── _layout.tsx        # Navigation Layout
├── assets/
│   ├── images/                # App icons and images
│   └── fonts/                 # Custom fonts
├── components/                # Reusable UI components
├── utils/
│   └── MedicationStorage.ts   # Data management utilities
├── types/
│   └── index.ts              # TypeScript type definitions
└── constants/
    └── Colors.ts             # App color scheme
```

## 🎨 Color Scheme

The app uses a consistent color palette:
- **Primary**: `#3726a6` (Deep purple)
- **Secondary**: `#4a37b8` (Light purple)
- **Accent Colors**: Various medication colors for visual organization
- **Status Colors**: Green for success, red for warnings

## 📋 Key Screens

### 1. Splash Screen (`index.tsx`)
- Animated app logo with fade and scale effects
- Automatic navigation to authentication after 3 seconds
- Purple gradient background matching app theme

### 2. Authentication Screen (`auth.tsx`)
- Biometric authentication (Face ID/Touch ID)
- PIN fallback for devices without biometric support
- Modern card-based UI with clear instructions

### 3. Home Dashboard (`home.tsx`)
- Daily progress tracking with visual progress bar
- Today's medications list with "Take" action buttons
- Quick access to add medications and calendar
- Personalized greeting based on time of day

### 4. Add Medication (`add-medication.tsx`)
- Comprehensive medication form with validation
- Frequency selection with automatic time suggestions
- Color picker for visual organization
- Date picker for refill scheduling
- Real-time form validation

### 5. Profile Screen (`profile.tsx`)
- User preferences and app settings
- Data management options
- Help and support information
- Dangerous actions (clear data) with confirmations

### 6. Calendar View (`calendar.tsx`)
- Monthly calendar with medication indicators
- Date selection to view specific day's medications
- Visual medication scheduling overview

## 💾 Data Management

### Medication Storage
- **Local Storage**: All data stored securely using AsyncStorage
- **Data Structure**: Comprehensive medication objects with scheduling info
- **CRUD Operations**: Full create, read, update, delete functionality
- **Data Validation**: Input validation and error handling

### Key Data Fields
```typescript
interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  time: string[];
  refillDate: string;
  pillsRemaining: number;
  color: string;
  taken: boolean;
  createdAt: string;
}
```

## 🔒 Security Features

- **Biometric Authentication**: Face ID/Touch ID support
- **Local Data Storage**: No cloud dependencies, all data stays on device
- **Input Validation**: Comprehensive form validation
- **Error Handling**: Graceful error management and user feedback

## 🚀 Future Enhancements

### Planned Features
- [ ] Push notifications for medication reminders
- [ ] Cloud backup and sync across devices
- [ ] Medication interaction warnings
- [ ] Doctor/pharmacy integration
- [ ] Medication history analytics
- [ ] Family member management
- [ ] Apple Health/Google Fit integration
- [ ] Medication image recognition
- [ ] Voice reminders
- [ ] Advanced reporting and insights

### Technical Improvements
- [ ] Unit and integration tests
- [ ] Performance optimizations
- [ ] Accessibility improvements
- [ ] Internationalization (i18n)
- [ ] Offline-first architecture
- [ ] Background task handling

## 🧪 Development

### Running Tests
```bash
npm test
```

### Building for Production
```bash
# iOS
npx expo build:ios

# Android
npx expo build:android
```

### Code Quality
- ESLint configuration for code consistency
- TypeScript for type safety
- Formatted with Prettier (recommended)

## 📱 Compatibility

- **iOS**: 13.0+
- **Android**: API 21+ (Android 5.0+)
- **Expo SDK**: 49+
- **Node.js**: 16+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with Expo and React Native
- Icons provided by Expo Vector Icons
- Gradient backgrounds using Expo Linear Gradient
- Date/time pickers from React Native Community

## 📞 Support

For support or questions:
- Create an issue in the repository
- Email: support@medlynx.com (placeholder)

---

**Made with ❤️ for better health management**
