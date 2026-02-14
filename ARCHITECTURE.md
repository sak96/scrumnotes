# Architecture Documentation

## Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Component Hierarchy](#component-hierarchy)
- [Data Flow](#data-flow)
- [State Management (Pinia)](#state-management-pinia)
- [Database Layer (IndexedDB)](#database-layer-indexeddb)
- [Routing](#routing)
- [Component Details](#component-details)
- [Views](#views)
- [Key Features Implementation](#key-features-implementation)
- [Error Handling](#error-handling)
- [Performance Considerations](#performance-considerations)
- [Security Considerations](#security-considerations)
- [Testing Strategy](#testing-strategy)

## Overview

Scrum Notes is a Vue 3 single-page application (SPA) that manages scrum notes using IndexedDB for local persistence. The application follows a component-based architecture with clear separation of concerns.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Browser Client                         │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                   Vue Application                    │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │    │
│  │  │   Views     │  │   Stores    │  │   Router    │  │    │
│  │  │  - HomeView │  │  - notes    │  │  - Routes   │  │    │
│  │  │  - EditView │  │             │  │             │  │    │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  │    │
│  │         │                │                │         │    │
│  │  ┌──────┴────────────────┴────────────────┴──────┐  │    │
│  │  │              Components                         │  │    │
│  │  │  ┌──────────┐ ┌──────────┐ ┌──────────┐       │  │    │
│  │  │  │  Common  │ │   Home   │ │   Edit   │       │  │    │
│  │  │  └──────────┘ └──────────┘ └──────────┘       │  │    │
│  │  └────────────────────────────────────────────────┘  │    │
│  └─────────────────────────────────────────────────────┘    │
│                          │                                  │
│  ┌───────────────────────┴───────────────────────────────┐ │
│  │                  IndexedDB (idb)                        │ │
│  │  ┌─────────────────────────────────────────────────┐   │ │
│  │  │  Database: scrum-notes-db                        │   │ │
│  │  │  Store: todos                                    │   │ │
│  │  │  Indexes: parent-id, created-at                  │   │ │
│  │  └─────────────────────────────────────────────────┘   │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
              ┌───────────────────────┐
              │   Vue Router v4       │
              │   (Hash-Based)        │
              │   - createWebHashHistory │
              └───────────────────────┘
```

## Component Hierarchy

```
App.vue
├── HomeView
│   ├── TitleList
│   │   └── TitleCard (v-for)
│   │       ├── <details>/<summary>
│   │       └── Children Preview
│   └── Search/Add Section
│       └── Search Input, Add Button, Delete Button (🗑️)
├── EditView
│   ├── Header
│   │   ├── Home Button (🏠)
│   │   ├── Title Input
│   │   └── Delete Button (🗑️)
│   ├── ChildrenList
│   │   └── VueDraggable (vue-draggable-next)
│   │       └── Child Item (v-for)
│   │           ├── DraggableIcon (⠿)
│   │           ├── Complete Button (◻️/✅)
│   │           ├── Text Input
│   │           └── Delete Button (🗑️)
│   └── EmptyTodo
│       ├── DraggableIcon (⠿)
│       ├── Incomplete Icon (◻️)
│       └── New Item Input
└── DeleteView
    ├── Header
    │   ├── Home Button (🏠)
    │   └── Title: Delete Items
    ├── Delete List
    │   └── Delete Item (v-for)
    │       ├── <details>/<summary>
    │       │   ├── Checkbox
    │       │   └── Title Text
    │       └── Children Section
    │           └── Child Item (v-for)
    │               ├── Checkbox
    │               ├── Completion Icon (◻️/✅)
    │               └── Child Text
    └── Sticky Footer
        └── Delete Button (🗑️)
```

## Data Flow

### Read Operations

```
User Action → Component → Store (Pinia) → Database (IndexedDB) → Store → Component → UI
```

### Write Operations

```
User Action → Component → Store (Pinia) → Database (IndexedDB) → Store (update) → UI
```

## State Management (Pinia)

### Store: `notes`

#### State
- `todos`: Array of all TodoItem objects
- `filterOptions`: Object containing search text

#### Getters
- `titles`: Filtered titles (parentId = 0), sorted by index
- `filteredTitles`: Titles filtered by search text
- `getChildrenByParentId(parentId)`: Function returning children for a parent

#### Actions
- `loadTodos()`: Load all todos from IndexedDB
- `addTitle(text)`: Create new title item
- `addChild(parentId, text)`: Create new child item
- `updateTodo(item)`: Update existing todo
- `deleteTodoAndChildren(id)`: Delete todo and all descendants
- `deleteTodosByIds(ids)`: Delete multiple items and their children
- `toggleCompletion(id)`: Toggle completion status
- `updateChildrenOrder(parentId, items)`: Reorder children items
- `setFilter(searchText)`: Update filter options

## Database Layer (IndexedDB)

### Schema

#### Database: `scrum-notes-db`
- **Version**: 1

#### Object Store: `todos`
- **KeyPath**: `id`
- **Indexes**:
  - `parent-id`: Index on parentId field
  - `created-at`: Index on createdAt field

#### Data Structure
```typescript
interface TodoItem {
  id: number;              // Primary key
  parentId: number;        // 0 for titles, parent ID for children
  index: number;           // Display order
  completed: boolean;      // Completion status
  text: string;            // Item text content
  createdAt: Date;         // Creation timestamp
  completedAt?: Date | null; // Completion timestamp (nullable)
}
```

### Operations

| Operation | Function | Description |
|-----------|----------|-------------|
| Initialize | `initDB()` | Open/create IndexedDB |
| Read All | `getAllTodos()` | Retrieve all todos |
| Read by Parent | `getTodosByParentId(id)` | Get children of parent |
| Create/Update | `saveTodo(item)` | Persist todo item |
| Delete | `deleteTodo(id)` | Remove single todo |
| Delete Children | `deleteTodosByParentId(id)` | Remove all children |
| Get Next ID | `getNextId()` | Generate next available ID |
| Reorder | `updateTodosOrder(items)` | Batch update indexes |

## Routing

### Routes

| Path | Name | Component | Description |
|------|------|-----------|-------------|
| `/` | home | HomeView | Main page with title list |
| `/edit/:id` | edit | EditView | Edit page for specific title |
| `/delete` | delete | DeleteView | Delete page for multiple items |

### Routing Implementation

- **History Mode**: Hash-based routing using `createWebHashHistory` from Vue Router
- **URL Format**: `/#/`, `/#/edit/1`, `/#/delete`
- **No Server Configuration Required**: Hash routing works without special server-side configuration
- **Import Meta Base URL**: Uses `import.meta.env.BASE_URL` for base path configuration

### Navigation Flow

```
Home Page → Click Add → Create Title → Redirect to Edit Page
Home Page → Click Edit → Navigate to Edit Page
Home Page → Click Delete → Navigate to Delete Page
Delete Page → Click Home → Navigate to Home Page
Delete Page → Click Delete → Delete Selected & Navigate Home
Edit Page → Click Home → Navigate to Home Page
Edit Page → Click Delete → Delete & Navigate Home
```

## Component Details

### Common Components (`/src/components/common/`)

#### TodoItem.vue
- **Props**: completed, text, editable, showDelete
- **Events**: toggle, update:text, delete
- **Responsibility**: Reusable todo item display

#### DraggableIcon.vue
- **Props**: None
- **Content**: Static ⠿ emoji
- **Responsibility**: Visual drag handle

#### CompletedIcon.vue
- **Props**: completed (boolean)
- **Events**: toggle
- **Responsibility**: Toggle completion status with emoji

#### DeleteButton.vue
- **Events**: delete
- **Responsibility**: Delete action trigger

### Home Components (`/src/components/home/`)

#### TitleCard.vue
- **Props**: title, children, isOpen
- **Events**: edit, toggle
- **Responsibility**: Collapsible title card with preview

#### TitleList.vue
- **Props**: titles, getChildrenByParentId
- **Events**: edit
- **Responsibility**: Filtered list of title cards

### Edit Components (`/src/components/edit/`)

#### ChildrenList.vue
- **Props**: children
- **Events**: toggle, update, delete
- **Responsibility**: Draggable list of child items

#### EmptyTodo.vue
- **Props**: text
- **Events**: update:text, add
- **Responsibility**: Input for new todo items

### Delete Components (`/src/components/delete/`)

DeleteView uses native HTML elements without dedicated sub-components. The view implements all delete functionality inline.

## Views

### HomeView (`/src/views/HomeView.vue`)

**Responsibilities**:
- Search/filter titles
- Add new titles
- Display filtered title list
- Route to edit page

**State**:
- searchText: Local state for input

### EditView (`/src/views/EditView.vue`)

**Responsibilities**:
- Edit title text
- Manage children (complete, delete, reorder)
- Add new children
- Delete title and children
- Navigate to home

**State**:
- newItemText: Local state for new TODO input
- title: Computed from store based on route ID
- sortedChildren: Computed sorted children list

### DeleteView (`/src/views/DeleteView.vue`)

**Responsibilities**:
- Multi-select interface for deleting titles and children
- Display all titles with their children in collapsible sections
- Manage checkbox selection state for titles and children
- Validate title deletion eligibility (all children must be completed)
- Batch delete selected items with confirmation
- Navigate back to home page

**State**:
- `checkedTitleIds`: Set of selected title IDs
- `checkedChildIds`: Set of selected child IDs
- `titles`: Computed list of all title items from store

**Computed Properties**:
- `checkedIds`: Array combining selected title and child IDs for deletion

**Key Logic**:
- **Title Checkbox Enable/Disable**: Title checkbox is disabled unless all children are completed AND all completed children are selected
- **Auto-select on Mount**: Automatically selects all completed children on view load
- **Title Selection Sync**: Selecting a title automatically selects/deselects all its children
- **Child Selection Validation**: Unchecking a child unchecks its parent title if all completed children were selected

**Behavior**:
- Shows "No items to delete" when no items exist
- Delete button shows count of selected items
- Delete button disabled when no items selected
- Red delete button in sticky footer for prominent action

## Key Features Implementation

### Drag-and-Drop

Uses `vue-draggable-next` for drag-and-drop functionality:

```vue
<VueDraggable
  v-model="sortedItems"
  item-key="id"
  handle=".drag-handle"
  @end="handleReorder"
>
  <template #item="{ element }">
    <!-- Item content -->
  </template>
</VueDraggable>
```

### Collapsible Details

Uses native HTML `<details>` and `<summary>` elements:

```vue
<details :open="isOpen">
  <summary>
    <span class="expand-icon">{{ isOpen ? '▲' : '▼' }}</span>
    <span class="title-text">{{ title.text }}</span>
  </summary>
  <div class="content">...</div>
</details>
```

### Auto-delete Empty Items

Items with empty text are automatically deleted on blur:

```typescript
function handleBlur(event: FocusEvent) {
  const value = (event.target as HTMLInputElement).value;
  if (value.trim() === '') {
    emit('delete');
  }
}
```

## Error Handling

### Database Errors
- All database operations are wrapped in try-catch
- Errors logged to console for debugging
- No UI error states (minimal approach)

### Missing Data
- EditView shows "Title not found" when title doesn't exist
- Automatically redirects to home if title missing

## Performance Considerations

### IndexedDB
- Database operations are async and non-blocking
- Pinia store caches data locally after initial load
- Reorder operations batch update indexes

### Vue Reactivity
- Large lists use computed properties for filtering
- Deep watchers on store.todos for navigation safety
- v-for with :key for efficient list updates

## Security Considerations

- All data stored locally in IndexedDB
- No external network requests
- No user authentication required
- Input sanitization via v-model

## Testing Strategy

### Unit Tests
- Pinia store actions and getters (`src/stores/notes.test.ts`)
- Database service functions (`src/services/database.test.ts`)
- Utility functions

### Component Tests
- HomeView: Search, add, navigation
- EditView: Title edit, child management (`src/components/edit/ChildrenList.test.ts`)
- DeleteView: Multi-select delete logic (`src/views/DeleteView.test.ts`)
- Common components: Props and events

### Integration Tests
- Database CRUD operations
- Store-database synchronization
- Router-component integration

### Test Configuration
- **Framework**: Vitest
- **Test Utils**: Vue Test Utils
- **Environment**: Happy DOM (browser simulation)
- **Coverage**: Enabled via `--coverage` flag
- **UI Mode**: Available via `npm run test:ui`