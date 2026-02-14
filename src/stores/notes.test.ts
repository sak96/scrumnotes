/// <reference types="vitest" />
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import * as database from '@/services/database';
import { useNotesStore } from '@/stores/notes';
import type { TodoItem } from '@/types';

vi.mock('@/services/database');

describe('useNotesStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe('loadTodos', () => {
    it('should load todos from database', async () => {
      const mockTodos: TodoItem[] = [
        {
          id: 1,
          parentId: 0,
          index: 0,
          completed: false,
          text: 'Test Title',
          createdAt: new Date(),
          completedAt: null,
        },
      ];
      (database.getAllTodos as vi.Mock).mockResolvedValue(mockTodos);

      const store = useNotesStore();
      await store.loadTodos();

      expect(store.todos).toEqual(mockTodos);
      expect(database.getAllTodos).toHaveBeenCalled();
    });
  });

  describe('addTitle', () => {
    it('should add a new title', async () => {
      (database.getNextId as vi.Mock).mockResolvedValue(1);
      (database.saveTodo as vi.Mock).mockResolvedValue(undefined);
      (database.getAllTodos as vi.Mock).mockResolvedValue([]);

      const store = useNotesStore();
      await store.loadTodos();

      const newTitle = await store.addTitle('New Title');

      expect(newTitle.text).toBe('New Title');
      expect(newTitle.parentId).toBe(0);
      expect(newTitle.completed).toBe(false);
      expect(database.saveTodo).toHaveBeenCalled();
    });
  });

  describe('addChild', () => {
    it('should add a new child to parent', async () => {
      const parentId = 1;
      (database.getNextId as vi.Mock).mockResolvedValue(2);
      (database.saveTodo as vi.Mock).mockResolvedValue(undefined);
      (database.getAllTodos as vi.Mock).mockResolvedValue([
        {
          id: 1,
          parentId: 0,
          index: 0,
          completed: false,
          text: 'Parent',
          createdAt: new Date(),
          completedAt: null,
        },
      ]);

      const store = useNotesStore();
      await store.loadTodos();

      const newChild = await store.addChild(parentId, 'Child Item');

      expect(newChild.text).toBe('Child Item');
      expect(newChild.parentId).toBe(parentId);
      expect(newChild.completed).toBe(false);
    });
  });

  describe('toggleCompletion', () => {
    it('should toggle completion status', async () => {
      const mockTodo: TodoItem = {
        id: 1,
        parentId: 0,
        index: 0,
        completed: false,
        text: 'Test',
        createdAt: new Date(),
        completedAt: null,
      };
      (database.getAllTodos as vi.Mock).mockResolvedValue([mockTodo]);
      (database.saveTodo as vi.Mock).mockResolvedValue(undefined);

      const store = useNotesStore();
      await store.loadTodos();

      await store.toggleCompletion(1);

      expect(database.saveTodo).toHaveBeenCalled();
      const savedCall = (database.saveTodo as vi.Mock).mock.calls[0][0];
      expect(savedCall.completed).toBe(true);
      expect(savedCall.completedAt).toBeInstanceOf(Date);
    });
  });

  describe('deleteTodoAndChildren', () => {
    it('should delete todo and its children', async () => {
      const mockTodos: TodoItem[] = [
        {
          id: 1,
          parentId: 0,
          index: 0,
          completed: false,
          text: 'Parent',
          createdAt: new Date(),
          completedAt: null,
        },
        {
          id: 2,
          parentId: 1,
          index: 0,
          completed: false,
          text: 'Child 1',
          createdAt: new Date(),
          completedAt: null,
        },
        {
          id: 3,
          parentId: 1,
          index: 1,
          completed: false,
          text: 'Child 2',
          createdAt: new Date(),
          completedAt: null,
        },
      ];
      (database.getAllTodos as vi.Mock).mockResolvedValue(mockTodos);
      (database.deleteTodosByParentId as vi.Mock).mockResolvedValue(undefined);
      (database.deleteTodo as vi.Mock).mockResolvedValue(undefined);

      const store = useNotesStore();
      await store.loadTodos();

      await store.deleteTodoAndChildren(1);

      expect(database.deleteTodosByParentId).toHaveBeenCalledWith(1);
      expect(database.deleteTodo).toHaveBeenCalledWith(1);
      expect(store.todos.length).toBe(0);
    });
  });

  describe('filteredTitles', () => {
    it('should filter titles by search text', async () => {
      const mockTodos: TodoItem[] = [
        {
          id: 1,
          parentId: 0,
          index: 0,
          completed: false,
          text: 'First Title',
          createdAt: new Date(),
          completedAt: null,
        },
        {
          id: 2,
          parentId: 0,
          index: 1,
          completed: false,
          text: 'Second Title',
          createdAt: new Date(),
          completedAt: null,
        },
        {
          id: 3,
          parentId: 0,
          index: 2,
          completed: false,
          text: 'Another Title',
          createdAt: new Date(),
          completedAt: null,
        },
      ];
      (database.getAllTodos as vi.Mock).mockResolvedValue(mockTodos);

      const store = useNotesStore();
      await store.loadTodos();

      store.setFilter('first');
      expect(store.filteredTitles.length).toBe(1);
      expect(store.filteredTitles[0].text).toBe('First Title');

      store.setFilter('');
      expect(store.filteredTitles.length).toBe(3);
    });
  });

  describe('getChildrenByParentId', () => {
    it('should return children for parent', async () => {
      const mockTodos: TodoItem[] = [
        {
          id: 1,
          parentId: 0,
          index: 0,
          completed: false,
          text: 'Parent',
          createdAt: new Date(),
          completedAt: null,
        },
        {
          id: 2,
          parentId: 1,
          index: 0,
          completed: false,
          text: 'Child 1',
          createdAt: new Date(),
          completedAt: null,
        },
        {
          id: 3,
          parentId: 1,
          index: 1,
          completed: false,
          text: 'Child 2',
          createdAt: new Date(),
          completedAt: null,
        },
      ];
      (database.getAllTodos as vi.Mock).mockResolvedValue(mockTodos);

      const store = useNotesStore();
      await store.loadTodos();

      const children = store.getChildrenByParentId(1);
      expect(children.length).toBe(2);
      expect(children[0].text).toBe('Child 1');
      expect(children[1].text).toBe('Child 2');
    });
  });
});