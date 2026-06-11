# AttachME Native Mobile Application 📱

Welcome to the **AttachME Cross-Platform Mobile Application** project. This is a production-ready **React Native (Expo + TypeScript)** codebase designed to interact with the AttachME REST API.

---

## 🛠️ Mobile Architecture

The mobile app mirrors the web platform's robust full-stack capabilities with special optimizations for mobile runtimes:

1. **JWT & Biometric Authentication Flow**:
   - Synchronizes with the backend using JWT bearer tokens.
   - Saves access and refresh tokens locally in secure hardware storage using `expo-secure-store`.
   - Allows instant biometric logic (FaceID / TouchID) using `expo-local-authentication` to bypass credential re-entry.

2. **Offline Local state caching**:
   - Tracks network state actively.
   - Caches recently fetched attachment job listings inside `@react-native-async-storage/async-storage`.
   - In case of offline operation, retrieves jobs from cache instantly and tags records for synchronous updates once connection resumes.

3. **File System & CV PDF Uploads**:
   - Integrates with the native document picker.
   - Employs `expo-file-system` to download attachments and mock upload files seamlessly.

4. **Notifications Centre**:
   - Integrates with Expo Push Notifications enabling instant cellular alerts for candidate shortlistings and messages.

5. **WhatsApp direct support**:
   - Launches direct support chat deep-links instantly with template messages tailored to active placements.

---

## 🏗️ Directory Structure

```text
/mobile
├── App.tsx                     # Main navigation registry & auth bootstrap
├── package.json               # Native dependency manifest
├── tsconfig.json              # TypeScript compilation rules
├── src/
│   ├── api/
│   │   └── api.ts             # Rest API, JWT storage cache
│   ├── components/
│   │   └── GlassCard.tsx      # Standardized glassmorphic card ui
│   └── screens/
│       ├── AuthScreen.tsx     # Sign in / Register with FaceID credentials
│       ├── StudentDashboard.tsx # Student CV matches, recommendations
│       ├── EmployerDashboard.tsx # Shortlist evaluator car, reviews & stars
│       ├── ChatScreen.tsx     # Messaging threads with active applicants
│       └── SupportScreen.tsx  # Direct Support tickets + Offline cache sync logs
```

---

## 🚀 Setup & Build Instructions

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **Git**
- **Expo Go** application installed on your Android/iOS test device or:
  - **Android Studio** (for Android Emulator)
  - **XCode** (for macOS iOS Simulator)

### 2. Install Dependencies
Navigate into the mobile directory and install npm packages:
```bash
cd mobile
npm install
# OR using yarn:
# yarn install
```

### 3. Environment Configurations
Create a `/mobile/.env` file or adjust `/mobile/src/api/api.ts` to point to your live deployment server URL:
```env
EXPO_PUBLIC_API_URL=https://ais-dev-unq3prlqaklkjhsy4enlqw-529095381960.europe-west1.run.app
```

### 4. Running the Development Server
Start the local packager check:
```bash
npm run start
# OR
# npx expo start
```

- **Scan QR Code**: Open the camera (iOS) or Expo Go app (Android) and scan the CLI QR code to launch the preview on your physical phone!
- **Run on Simulator**: Press `i` to launch on the iOS simulator, or `a` to load on the Android emulator.

### 5. Build for Production (Android AAB / iOS IPA)
We use EAS (Expo Application Services) to bundle production code:
```bash
# Register with expo
npm install -g eas-cli
eas login

# Initialize project configuration
eas build:configure

# Build for Android (generates .aab files ready for Google Play Store console)
eas build --platform android --profile production

# Build for iOS (generates .ipa files ready for Apple App Store Connect)
eas build --platform ios --profile production
```

---

## 🔒 Implementing Features

### Biometric Keychain Configuration
In `App.json` (Expo template), ensure you specify permissions:
```json
{
  "expo": {
    "plugins": [
      [
        "expo-local-authentication",
        {
          "faceIDPermission": "Allow AttachME to unlock your workspace profile with FaceID."
        }
      ]
    ]
  }
}
```

### Offline Caching Mechanics
Our system relies on standard asynchronous key-val stores to provide smooth offline browsing. When the client fetches the jobs registry, it calls:
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Fetch & Cache
const fetchJobs = async () => {
  try {
    const res = await fetch(`${API_URL}/api/jobs`);
    const data = await res.json();
    await AsyncStorage.setItem('@cached_jobs', JSON.stringify(data));
    return data;
  } catch (err) {
    // Return cached list offline
    const local = await AsyncStorage.getItem('@cached_jobs');
    return local ? JSON.parse(local) : [];
  }
}
```
This is fully wired into `src/api/api.ts` so the customer is never locked out of their placements ledger in weak connectivity regions.
