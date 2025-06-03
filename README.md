# MediNex 2 - Medication Reminder App 💊

## Overview

MediNex 2 is a modern, sleek medication reminder application built with React Native and Expo. It helps users manage their medications, track refills, view their medication history, and includes a menstrual cycle tracker feature.

## Features

- **Medication Management**: Add, edit, and delete medications with customizable dosage schedules
- **Reminders**: Get notified when it's time to take your medications
- **Calendar View**: See all your medication schedules in a calendar format
- **History Log**: Track your medication adherence over time
- **Refill Tracker**: Never run out of important medications again
- **Menstrual Cycle Tracker**: Track your menstrual cycle and fertility windows

## New in MediNex 2

- **Modern UI**: Completely redesigned with a sleek purple, teal, and coral color scheme
- **Improved Navigation**: Fixed routing issues with the cycle tracker feature
- **Enhanced Performance**: Optimized for better speed and reliability

## Getting Started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

## Development

This project uses Expo Router for navigation with file-based routing. The main screens are located in the `app` directory:

- `home.tsx`: Main dashboard with quick actions
- `calendar/index.tsx`: Calendar view of all medications
- `history/index.tsx`: Medication history log
- `refills/index.tsx`: Refill tracking
- `menstrual-tracker.tsx`: Menstrual cycle tracking

## Technologies Used

- React Native
- Expo
- Expo Router
- AsyncStorage for local data persistence
- Linear Gradient for UI elements

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
