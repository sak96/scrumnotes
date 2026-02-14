import { openDB, DBSchema, IDBPDatabase } from 'idb';
import type { TodoItem } from '../types';

interface ScrumNotesDB extends DBSchema {
  todos: {
    key: number;
    value: TodoItem;
    indexes: {
      'parent-id': number;
      'created-at': Date;
    };
  };
}

const DB_NAME = 'scrum-notes-db';
const DB_VERSION = 2;
const STORE_NAME = 'todos';

let dbInstance: IDBPDatabase<ScrumNotesDB> | null = null;

export async function initDB(): Promise<IDBPDatabase<ScrumNotesDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<ScrumNotesDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      store.createIndex('parent-id', 'parentId');
      store.createIndex('created-at', 'createdAt');
    },
  });

  return dbInstance;
}

export async function getAllTodos(): Promise<TodoItem[]> {
  const db = await initDB();
  return db.getAll(STORE_NAME);
}

export async function getTodosByParentId(parentId: number): Promise<TodoItem[]> {
  const db = await initDB();
  return db.getAllFromIndex(STORE_NAME, 'parent-id', parentId);
}

export async function saveTodo(item: TodoItem): Promise<void> {
  const db = await initDB();
  await db.put(STORE_NAME, item);
}

export async function deleteTodo(id: number): Promise<void> {
  const db = await initDB();
  await db.delete(STORE_NAME, id);
}

export async function deleteTodosByParentId(parentId: number): Promise<void> {
  const db = await initDB();
  const items = await db.getAllFromIndex(STORE_NAME, 'parent-id', parentId);
  await Promise.all(items.map(item => db.delete(STORE_NAME, item.id)));
}

export async function getNextId(): Promise<number> {
  const db = await initDB();
  const allTodos = await db.getAll(STORE_NAME);
  if (allTodos.length === 0) return 1;
  return Math.max(...allTodos.map(t => t.id)) + 1;
}

export async function updateTodosOrder(items: TodoItem[]): Promise<void> {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  await Promise.all(
    items.map(async (item, index) => {
      const updated = { ...item, index };
      await tx.store.put(updated);
    })
  );
  await tx.done;
}