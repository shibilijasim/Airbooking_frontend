<<<<<<< HEAD
# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```

You can also install [eslint-plugin-react-x](https://npmx.dev/package/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://npmx.dev/package/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```
=======
# AirBooking — Frontend (React, TypeScript & Tailwind CSS)

Frontend web application for **AirBooking**, built with React, TypeScript, Vite, Tailwind CSS, React Router, and Axios.

## Features

- **Authentication & Route Protection**: User registration, JWT login, automatic token refresh via `axiosPrivate`, and admin/user route guards.
- **Flight Search, Filtering & Sorting**: Search upcoming flights by departure/arrival airport IATA code, travel date (from the current date onward), minimum available seats, price range, and maximum travel hours; sort by departure date, price, or travel duration.
- **Real-Time Status Synchronization**: Displays `On-Time`, `Delayed`, `Boarding`, `Cancelled`, and `Landed` statuses and updates open user windows automatically via `BroadcastChannel`, `localStorage` events, and background polling without manual page reloads.
- **Flight Selection & Booking**: Select eligible flights and manage personal bookings.
- **Admin User Approvals**: Filter registrations (`Pending`, `Approved`, `Rejected`, `All`) and approve or reject users with inline confirmation.
- **Admin Flight Management**: Sync schedules from AirLabs by airport IATA code, filter flights by status, and update flight statuses in real time.

## Tech Stack

- **Framework & Language**: React, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router (`react-router-dom`)
- **HTTP Client**: Axios (`axiosAuth` & `axiosPrivate` interceptors)

## Setup & Installation

### 1. Clone the Repository and Install Dependencies

```bash
git clone <your-frontend-repo-url>
open your folder
npm install
>>>>>>> 0d6e2059fec229af731cd21ef3e74ac6a8875322
