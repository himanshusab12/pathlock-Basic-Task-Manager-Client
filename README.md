# Home Assignment 1 – Basic Task Manager - Frontend Application

A modern, responsive task management application built with React and TypeScript that seamlessly switches between cloud backend and local storage.

## Table of Contents

- [Overview](#overview)
- [Technologies Used](#technologies-used)
- [Features](#features)
- [Project Structure](#project-structure)
- [Pages and Components](#pages-and-components)
- [Setup and Installation](#setup-and-installation)
- [Running the Application](#running-the-application)
- [API Integration](#api-integration)

## Overview

This is a full-featured task management application that provides a seamless user experience with automatic fallback to local storage when the backend is unavailable. The application features a dark theme, real-time updates, and intuitive task management capabilities including creating, editing, completing, and deleting tasks.

**Live Application**: https://pathlock-project-1-client.vercel.app/

**Backend API**: https://pathlock-project-1-server.onrender.com

## Technologies Used

### Core Framework
- **React 18.2** - UI library with Hooks
- **TypeScript 5.3** - Type-safe JavaScript

### Routing & State
- **React Router v6.20** - Client-side routing

### Styling
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing

### HTTP Client
- **Axios 1.6** - Promise-based HTTP client

## Features

- Create, read, update, and delete tasks
- Mark tasks as completed/incomplete
- Edit task descriptions inline
- Filter tasks by status (All, Active, Completed)
- Task statistics and counters
- Automatic backend/local storage switching
- Connection status indicator
- Offline-first with localStorage fallback
- Responsive design
- Loading states and error handling
- Keyboard shortcuts (Enter to add/save)

## Project Structure
```
Root/
├── src/
│   ├── App.tsx              # Application Entrypoint + Main TaskManager component
│   ├── index.css            # Global styles
├── public/
├── package.json
└── README.md
```

## Pages and Components

### TaskManager (Main Component)

The primary component that handles all task management functionality.

**Key Elements:**

1. **Header Section**
   - Application title
   - Connection status indicator (Connected/Offline)
   - Storage mode toggle (Backend/Local)

2. **Input Section**
   - Task input field with placeholder
   - Add button with loading state
   - Error message display

3. **Filter Section**
   - Three filter buttons: All, Active, Completed
   - Task count badges for each filter

4. **Task List**
   - Individual task items with:
     - Checkbox for completion toggle
     - Task description
     - Edit button (visible on hover)
     - Delete button (visible on hover)
   - Inline editing mode with save/cancel actions
   - Empty state messages

5. **Footer Section**
   - Remaining tasks counter

**State Management:**
```typescript
interface Task {
  id: string;
  description: string;
  isCompleted: boolean;
}

type FilterType = 'all' | 'active' | 'completed';
type StorageMode = 'backend' | 'local';
```

**Key Features:**

- Automatic backend connection detection on mount
- Bi-directional sync between backend and local storage
- Optimistic UI updates
- Error handling with user-friendly messages
- Hover interactions for edit/delete actions

## Setup and Installation

### Prerequisites

- **Node.js 18+** and npm installed
- Git for version control
- Code editor (VS Code recommended)

### Installation Steps

1. **Clone the repository**
```bash
   git clone <repository-url>
   cd <folder-name>
```

2. **Install dependencies**
```bash
   npm install
```


3. **Verify installation**
```bash
   npm start
```

   Should start dev server at `http://localhost:3000`

## Running the Application

### Development Mode
```bash
npm start
```

**Access at**: `http://localhost:3000`

**Features**:
- Hot module replacement (HMR)
- Fast refresh for React components
- Source maps for debugging
- TypeScript type checking

### Build for Production
```bash
npm run build
```

**Output**: `build/` folder with optimized bundle

**Features**:
- Minified JavaScript and CSS
- Tree-shaking for smaller bundle size
- Asset optimization
- Production-ready build

### Preview Production Build
```bash
npm run preview
```

**Access at**: `http://localhost:4173`

Tests the production build locally before deployment.

### Type Checking
```bash
npx tsc --noEmit
```

Checks TypeScript types without emitting files.

### Linting (if configured)
```bash
npm run lint
```

## API Integration

### Backend Endpoint

The application integrates with a RESTful API at:
```
https://pathlock-project-1-server.onrender.com/api/tasks
```

For local development, use:
```
http://localhost:8080/api/tasks
```

### API Endpoints Used

```
| Method | Endpoint           | Description       |
|--------|--------------------|-------------------|
| GET    | `/api/tasks`       | Fetch all tasks   |
| POST   | `/api/tasks`       | Create a new task |
| PUT    | `/api/tasks/{id}`  | Update a task     |
| DELETE | `/api/tasks/{id}`  | Delete a task     |
```


### Storage Mode Behavior

**Backend Mode (Cloud Icon Active):**
- All operations sync with the backend API
- Tasks persist across devices and sessions
- Requires internet connection

**Local Mode (Hard Drive Icon Active):**
- All operations use browser localStorage
- Tasks persist only on the current device/browser
- Works offline
- Automatic fallback when backend is unavailable

### Connection Detection

The app automatically:
1. Checks backend connectivity on mount
2. Switches to local storage if backend is unavailable
3. Displays connection status in the header
4. Allows manual toggle between modes when backend is available

## Author

**Aaditya Vardhan Vij**
- GitHub: [@aadityavvij](https://github.com/aadityavvij)
- Email: aadityavvij@gmail.com
