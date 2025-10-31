# Task Management System

A feature-rich task management application featuring intelligent storage switching, theme customization, and an intuitive user interface built with modern web technologies.

---

## 🚀 Quick Start

**Live Demo:** [https://pathlock-basic-task-manager-client.vercel.app/](https://pathlock-basic-task-manager-client.vercel.app/)

**API Server:** [https://pathlock-basic-task-manager-server.onrender.com](https://pathlock-basic-task-manager-server.onrender.com)

---

## 📋 What's Inside

This application delivers a comprehensive task management experience with smart backend integration and local storage capabilities. The interface adapts to network conditions automatically while providing users with full control over their data storage preferences.

### Built With

**Frontend Stack:**
- React 18.2 with TypeScript 5.3
- React Router v6.20 for navigation
- Tailwind CSS 3.4 for styling
- Axios 1.6 for HTTP requests
- PostCSS & Autoprefixer for CSS optimization

---

## ✨ Key Capabilities

### Task Operations
- ✅ Add new tasks with real-time validation
- ✏️ Edit existing task descriptions inline
- 🎯 Toggle completion status with visual feedback
- 🗑️ Remove tasks with confirmation
- 📊 View task statistics and counts

### User Experience
- 🌓 **Dark/Light theme toggle** for comfortable viewing
- 🧭 **Navigation bar** for easy access
- 📱 Fully responsive across all devices
- ⚡ Instant UI updates with optimistic rendering
- 🔄 Smart filtering (All, Active, Completed views)
- ⌨️ Keyboard shortcuts for productivity

### Storage Intelligence
- 🌐 Seamless cloud synchronization when online
- 💾 Automatic local storage fallback
- 🔌 Real-time connection monitoring
- 🔀 Manual storage mode switching
- 📍 Connection status indicator in header

---

## 🗂️ Application Architecture

```
project-root/
│
├── src/
│   ├── App.tsx                 # Core application logic
│   ├── index.css              # Global styling definitions
│   └── [additional components]
│
├── public/                     # Static assets
├── package.json               # Dependencies & scripts
└── README.md                  # Project documentation
```

---

## 🎨 Interface Components

### Navigation Bar
Professional navigation with theme switching and status indicators

### Main Dashboard

**Header Area:**
- Application branding
- Network status badge (Connected/Offline)
- Storage mode selector (Cloud/Local)
- Theme toggle button

**Task Input Zone:**
- Description field with validation
- Submit button with loading animation
- Error feedback display

**Filter Controls:**
- All tasks view
- Active tasks only
- Completed tasks only
- Count badges on each filter

**Task Display Area:**
- Completion checkboxes
- Task text with edit capability
- Hover-revealed action buttons
- Edit mode with save/cancel options
- Empty state messaging

**Statistics Footer:**
- Remaining task counter
- Completion percentage (if implemented)

---

## 💻 Getting Started

### System Requirements

- Node.js version 18 or higher
- npm package manager
- Modern web browser
- Git (for cloning)

### Installation Process

**Step 1 - Clone Repository:**
```bash
git clone <your-repository-url>
cd <project-directory>
```

**Step 2 - Install Packages:**
```bash
npm install
```

**Step 3 - Launch Development Server:**
```bash
npm start
```

Navigate to `http://localhost:3000` in your browser.

---

## 🛠️ Available Commands

### Development Server
```bash
npm start
```
Starts local development environment with hot reload at port 3000

### Production Build
```bash
npm run build
```
Creates optimized production bundle in `/build` directory with:
- Minified assets
- Optimized bundle splitting
- Compressed resources

### Build Preview
```bash
npm run preview
```
Serves production build locally for testing

### Type Validation
```bash
npx tsc --noEmit
```
Validates TypeScript types throughout the codebase

---

## 🔌 Backend Integration

### API Configuration

**Production URL:**
```
https://pathlock-project-1-server.onrender.com/api/tasks
```

**Local Development:**
```
http://localhost:8080/api/tasks
```

### Endpoint Reference

| HTTP Method | Route | Purpose |
|:------------|:------|:--------|
| `GET` | `/api/tasks` | Retrieve all tasks |
| `POST` | `/api/tasks` | Create new task |
| `PUT` | `/api/tasks/{id}` | Modify existing task |
| `DELETE` | `/api/tasks/{id}` | Remove task |

### Data Models

```typescript
interface Task {
  id: string;
  description: string;
  isCompleted: boolean;
}

type FilterType = 'all' | 'active' | 'completed';
type StorageMode = 'backend' | 'local';
```

---

## 🔄 Storage Strategy

### Cloud Mode (Backend Connected)
- Real-time synchronization with server
- Cross-device task access
- Persistent data storage
- Requires active internet connection

### Local Mode (Offline Operation)
- Browser-based localStorage
- Device-specific data
- No internet required
- Automatic activation when backend unavailable

### Smart Switching
The application intelligently:
1. Tests backend connectivity on startup
2. Falls back to local storage if needed
3. Displays current storage mode
4. Enables manual mode switching when online

---

## 👨‍💻 Developer

**Aaditya Vardhan Vij**

📧 2003hims@gmail.com  
🐙 [@himanshusab12](https://github.com/himanshusab12)

---

## 📝 License

This project is available for educational and personal use.

---

**Note:** Ensure backend service is running for full cloud functionality. Local mode provides complete offline capabilities.
