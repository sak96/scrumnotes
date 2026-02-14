# Scrum Notes

A Vue 3 application for managing scrum notes with drag-and-drop functionality and IndexedDB storage.

## Features

- **Title Management**: Create, edit, and delete scrum titles
- **TODO Items**: Add, reorder, and complete TODO items under each title
- **Drag-and-Drop**: Reorder TODO items using vue-draggable-plus
- **IndexedDB Storage**: All data persists locally using IndexedDB
- **Filter/Search**: Filter titles by text search
- **Responsive Design**: Clean, unstyled HTML components

## Tech Stack

- **Framework**: Vue 3 with Composition API
- **Language**: TypeScript
- **Build Tool**: Vite
- **State Management**: Pinia
- **Database**: IndexedDB via `idb` library
- **Drag & Drop**: vue-draggable-plus
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
│   └── EditView.vue           # Edit page for titles and items
├── stores/
│   └── notes.ts               # Pinia store for state management
├── services/
│   └── database.ts            # IndexedDB operations
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
  completedAt?: Date;      // Completion timestamp (optional)
}
```

## Usage

### Home Page
1. **Add Title**: Enter text in the input box and click "Add"
2. **Filter**: Enter text to filter displayed titles
3. **Edit Title**: Click the ✏️ icon to edit a title
4. **View Items**: Click the title or expand (▼/▲) to see TODO items

### Edit Page
1. **Edit Title**: Modify the title text directly
2. **Complete Items**: Click ◻️ to complete, ✅ for completed
3. **Reorder Items**: Drag items using the ⠿ handle
4. **Delete Items**: Click 🗑️ or clear text to remove
5. **Add Items**: Type in the empty TODO field and press Enter
6. **Delete Title**: Click 🗑️ to delete title and all children
7. **Navigate Home**: Click 🏠 to return to home page

## Database

### IndexedDB Configuration
- **Database Name**: `scrum-notes-db`
- **Store**: `todos`
- **Indexes**: `parent-id`, `created-at`

## Icons

| Icon | Meaning |
|------|---------|
| ◻️ | Not completed TODO |
| ✅ | Completed TODO |
| ▼ | Expand details |
| ▲ | Collapse details |
| 🗑️ | Delete |
| ✏️ | Edit |
| 🏠 | Home |
| ⠿ | Draggable handle |

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