# Scrum Notes

![Version](https://img.shields.io/npm/v/scrum-notes)
![License](https://img.shields.io/npm/l/scrum-notes)

A Vue 3 application for managing scrum notes with drag-and-drop functionality and IndexedDB storage.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Data Model](#data-model)
- [Usage](#usage)
- [Database](#database)
- [Development](#development)
- [Build](#build)

## Features

- **Title Management**: Create, edit, and delete scrum titles
- **TODO Items**: Add, reorder, and complete TODO items under each title
- **Drag-and-Drop**: Reorder titles and TODO items using vue-draggable-next
- **IndexedDB Storage**: All data persists locally using IndexedDB
- **Filter/Search**: Filter titles by text search
- **Delete Mode**: Select and delete multiple titles and items
- **Responsive Design**: Clean, unstyled HTML components

## Tech Stack

- **Framework**: Vue 3 with Composition API
- **Language**: TypeScript
- **Build Tool**: Vite
- **State Management**: Pinia
- **Database**: IndexedDB via `idb` library
- **Drag & Drop**: vue-draggable-next
- **Routing**: Vue Router
- **Testing**: Vitest + Vue Test Utils

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm run test

# Run tests with UI
npm run test:ui

# Lint code
npm run lint
```

## Project Structure

```
src/
├── components/
│   ├── common/
│   │   ├── TodoItem.vue       # Reusable TODO item component
│   │   ├── DraggableIcon.vue  # Drag handle icon
│   │   ├── CompletedIcon.vue  # Completion status toggle
│   │   └── DeleteButton.vue   # Delete button
│   ├── home/
│   │   ├── TitleCard.vue      # Individual title display card
│   │   └── TitleList.vue      # Filtered list of titles
│   └── edit/
│       ├── ChildrenList.vue   # Draggable TODO items list
│       └── EmptyTodo.vue      # New TODO input placeholder
├── views/
│   ├── HomeView.vue           # Main page with search and list
│   ├── EditView.vue           # Edit page for titles and items
│   └── DeleteView.vue         # Delete page for multi-select deletion
├── stores/
│   ├── notes.ts               # Pinia store for state management
│   └── notes.test.ts          # Store unit tests
├── services/
│   ├── database.ts            # IndexedDB operations
│   └── database.test.ts       # Database service tests
├── types/
│   └── index.ts               # TypeScript type definitions
├── router/
│   └── index.ts               # Vue Router configuration
├── App.vue
└── main.ts
```

## Data Model

### TodoItem
```typescript
interface TodoItem {
  id: number;              // Unique identifier
  parentId: number;        // 0 for titles, parent ID for children
  index: number;           // Display order
  completed: boolean;      // Completion status
  text: string;            // Item text
  createdAt: Date;         // Creation timestamp
  completedAt?: Date | null; // Completion timestamp (optional)
}
```

## Usage

### Home Page
1. **Add Title**: Enter text in the input box and click "Add"
2. **Filter**: Enter text to filter displayed titles
3. **Edit Title**: Click the ✏️ icon to edit a title
4. **View Items**: Click the title or expand (▼/▲) to see TODO items
5. **Reorder Titles**: Drag using the ⠿ handle to reorder titles
6. **Delete Mode**: Click 🗑️ to go to delete page

### Delete Page
1. **Select Items**: Check boxes for titles and children
2. **Title Checkbox**: Enabled only when all children are completed (✅)
3. **Child Checkboxes**: Toggle individual children
4. **Delete Button**: Click 🗑️ to delete selected items
5. **Navigate Home**: Click 🏠 to return to home page

### Edit Page
1. **Edit Title**: Modify the title text directly
2. **Complete Items**: Click ◻️ to complete, ✅ for completed
3. **Reorder Items**: Drag items using the ⠿ handle
4. **Delete Items**: Click 🗑️ or clear text to remove
5. **Add Items**: Type in the empty TODO field and press Enter
6. **Delete Title**: Click 🗑️ to delete title and all children
7. **Navigate Home**: Click 🏠 to return to home page

### Delete Page
1. **Select Items**: Check boxes for titles and their completed children
2. **Title Checkbox**: Only enabled when all children are completed (✅)
3. **Child Checkboxes**: Toggle individual completed children
4. **Delete Button**: Click 🗑️ to delete selected items (shows count)
5. **Navigate Home**: Click 🏠 to return to home page

## Database

### IndexedDB Configuration
- **Database Name**: `scrum-notes-db`
- **Store**: `todos`
- **Indexes**: `parent-id`, `created-at`

## Development

### Adding New Components

1. Create component in appropriate directory under `src/components/`
2. Import and use in views
3. Add styles as needed

### Testing

```bash
# Run all tests
npm run test

# Run with coverage
npm run test -- --coverage

# Run specific test file
npm run test -- notes.test.ts

# Run tests with UI
npm run test:ui
```

### Linting

```bash
# Run lint check
npm run lint

# Lint with auto-fix
npm run lint -- --fix
```

## Build

```bash
# Production build
npm run build

# Preview build
npm run preview
```

## License

MIT