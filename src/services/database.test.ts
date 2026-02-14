/// <reference types="vitest" />
import { describe, it, expect, beforeEach, vi, type MockInstance } from 'vitest';
import type { TodoItem } from '../types';

const mockDB = {
  put: vi.fn().mockResolvedValue(undefined),
  delete: vi.fn().mockResolvedValue(undefined),
  getAll: vi.fn().mockResolvedValue([]),
  getAllFromIndex: vi.fn().mockResolvedValue([]),
  transaction: vi.fn().mockReturnValue({
    store: {
      put: vi.fn().mockResolvedValue(undefined),
    },
    done: vi.fn().mockResolvedValue(undefined),
  }),
};

vi.mock('idb', () => ({
  openDB: vi.fn().mockResolvedValue(mockDB),
}));

describe('Database Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDB.put.mockResolvedValue(undefined);
    mockDB.delete.mockResolvedValue(undefined);
    mockDB.getAll.mockResolvedValue([]);
    mockDB.getAllFromIndex.mockResolvedValue([]);
    mockDB.transaction.mockReturnValue({
      store: {
        put: vi.fn().mockResolvedValue(undefined),
      },
      done: vi.fn().mockResolvedValue(undefined),
    });
  });

  describe('initDB', () => {
    it('should initialize database', async () => {
      const { initDB } = await import('./database');
      await initDB();
      const { openDB } = await import('idb');
      expect((openDB as unknown as MockInstance)).toHaveBeenCalledWith(
        'scrum-notes-db',
        2,
        expect.objectContaining({
          upgrade: expect.any(Function),
        })
      );
    });

    it('should return existing instance on subsequent calls', async () => {
      const { initDB } = await import('./database');
      await initDB();
      const { openDB } = await import('idb');
      (openDB as unknown as MockInstance).mockClear();
      await initDB();
      expect((openDB as unknown as MockInstance)).not.toHaveBeenCalled();
    });
  });

  describe('getAllTodos', () => {
    it('should return all todos', async () => {
      const mockTodos: TodoItem[] = [
        {
          id: 1,
          parentId: 0,
          index: 0,
          completed: false,
          text: 'Test',
          createdAt: new Date(),
          completedAt: null,
        },
      ];
      mockDB.getAll.mockResolvedValue(mockTodos);

      const { getAllTodos } = await import('./database');
      const todos = await getAllTodos();

      expect(todos).toEqual(mockTodos);
      expect(mockDB.getAll).toHaveBeenCalledWith('todos');
    });
  });

  describe('getTodosByParentId', () => {
    it('should return todos by parent ID', async () => {
      const parentId = 1;
      const mockTodos: TodoItem[] = [
        {
          id: 2,
          parentId: 1,
          index: 0,
          completed: false,
          text: 'Child',
          createdAt: new Date(),
          completedAt: null,
        },
      ];
      mockDB.getAllFromIndex.mockResolvedValue(mockTodos);

      const { getTodosByParentId } = await import('./database');
      const todos = await getTodosByParentId(parentId);

      expect(todos).toEqual(mockTodos);
      expect(mockDB.getAllFromIndex).toHaveBeenCalledWith(
        'todos',
        'parent-id',
        parentId
      );
    });
  });

  describe('saveTodo', () => {
    it('should save todo item', async () => {
      const todo: TodoItem = {
        id: 1,
        parentId: 0,
        index: 0,
        completed: false,
        text: 'Test',
        createdAt: new Date(),
        completedAt: null,
      };

      const { saveTodo } = await import('./database');
      await saveTodo(todo);

      expect(mockDB.put).toHaveBeenCalledWith('todos', todo);
    });
  });

  describe('deleteTodo', () => {
    it('should delete todo by ID', async () => {
      const { deleteTodo } = await import('./database');
      await deleteTodo(1);

      expect(mockDB.delete).toHaveBeenCalledWith('todos', 1);
    });
  });

  describe('deleteTodosByParentId', () => {
    it('should delete all children of parent', async () => {
      const parentId = 1;
      const mockTodos: TodoItem[] = [
        {
          id: 2,
          parentId: 1,
          index: 0,
          completed: false,
          text: 'Child',
          createdAt: new Date(),
          completedAt: null,
        },
      ];
      mockDB.getAllFromIndex.mockResolvedValue(mockTodos);

      const { deleteTodosByParentId } = await import('./database');
      await deleteTodosByParentId(parentId);

      expect(mockDB.delete).toHaveBeenCalledWith('todos', 2);
    });
  });

  describe('getNextId', () => {
    it('should return 1 when no todos exist', async () => {
      mockDB.getAll.mockResolvedValue([]);

      const { getNextId } = await import('./database');
      const nextId = await getNextId();

      expect(nextId).toBe(1);
    });

    it('should return max ID + 1 when todos exist', async () => {
      mockDB.getAll.mockResolvedValue([
        { id: 1 },
        { id: 5 },
        { id: 3 },
      ]);

      const { getNextId } = await import('./database');
      const nextId = await getNextId();

      expect(nextId).toBe(6);
    });
  });

  describe('updateTodosOrder', () => {
    it('should update indexes for todos', async () => {
      const items: TodoItem[] = [
        {
          id: 1,
          parentId: 0,
          index: 0,
          completed: false,
          text: 'First',
          createdAt: new Date(),
          completedAt: null,
        },
        {
          id: 2,
          parentId: 0,
          index: 1,
          completed: false,
          text: 'Second',
          createdAt: new Date(),
          completedAt: null,
        },
      ];

      const { updateTodosOrder } = await import('./database');
      await updateTodosOrder(items);

      expect(mockDB.transaction).toHaveBeenCalled();
    });
  });
});