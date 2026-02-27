/// <reference types="vitest" />
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { mount } from '@vue/test-utils';
import { createRouter, createWebHistory } from 'vue-router';
import * as database from '@/services/database';
import DeleteView from './DeleteView.vue';
import { useNotesStore } from '@/stores/notes';
import type { TodoItem } from '@/types';

vi.mock('@/services/database');

describe('DeleteView', () => {
  let router: ReturnType<typeof createRouter>;
  let store: ReturnType<typeof useNotesStore>;

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    store = useNotesStore();
    router = createRouter({
      history: createWebHistory(),
      routes: [{ path: '/', component: { template: '<div>Home</div>' } }],
    });
  });

  const createMockTodos = (): TodoItem[] => [
    {
      id: 1,
      parentId: 0,
      index: 0,
      completed: true,
      text: 'Title 1',
      createdAt: new Date(),
      completedAt: new Date(),
    },
    {
      id: 2,
      parentId: 1,
      index: 0,
      completed: true,
      text: 'Child 1 - Completed',
      createdAt: new Date(),
      completedAt: new Date(),
    },
    {
      id: 3,
      parentId: 1,
      index: 1,
      completed: true,
      text: 'Child 2 - Completed',
      createdAt: new Date(),
      completedAt: new Date(),
    },
    {
      id: 4,
      parentId: 0,
      index: 1,
      completed: true,
      text: 'Title 2',
      createdAt: new Date(),
      completedAt: new Date(),
    },
    {
      id: 5,
      parentId: 4,
      index: 0,
      completed: false,
      text: 'Child 3 - Incomplete',
      createdAt: new Date(),
      completedAt: null,
    },
    {
      id: 6,
      parentId: 0,
      index: 2,
      completed: false,
      text: 'Title 3 (No Children)',
      createdAt: new Date(),
      completedAt: null,
    },
    {
      id: 7,
      parentId: 0,
      index: 3,
      completed: true,
      text: 'Title 4',
      createdAt: new Date(),
      completedAt: new Date(),
    },
    {
      id: 8,
      parentId: 7,
      index: 0,
      completed: true,
      text: 'Child 4 - Completed',
      createdAt: new Date(),
      completedAt: new Date(),
    },
    {
      id: 9,
      parentId: 7,
      index: 1,
      completed: false,
      text: 'Child 5 - Incomplete',
      createdAt: new Date(),
      completedAt: null,
    },
  ];

  describe('pre-selection on mount', () => {
    it('should pre-select all completed children', async () => {
      const mockTodos = createMockTodos();
      (database.getAllTodos as vi.Mock).mockResolvedValue(mockTodos);
      await store.loadTodos();

      const wrapper = mount(DeleteView, {
        global: {
          plugins: [router],
          stubs: { RouterLink: true },
        },
      });

      await wrapper.vm.$nextTick();

      const completedChildren = wrapper.findAll('.child-item');
      expect(completedChildren.length).toBe(3);

      const childCheckboxes = completedChildren.map(c => c.find('input[type="checkbox"]'));
      expect((childCheckboxes[0].element as HTMLInputElement).checked).toBe(true);
      expect((childCheckboxes[1].element as HTMLInputElement).checked).toBe(true);
      expect((childCheckboxes[2].element as HTMLInputElement).checked).toBe(true);
    });

    it('should pre-select titles where all children are completed', async () => {
      const mockTodos = createMockTodos();
      (database.getAllTodos as vi.Mock).mockResolvedValue(mockTodos);
      await store.loadTodos();

      const wrapper = mount(DeleteView, {
        global: {
          plugins: [router],
          stubs: { RouterLink: true },
        },
      });

      await wrapper.vm.$nextTick();

      const titleCheckboxes = wrapper.findAll('.delete-item > details > summary > .delete-checkbox');
      expect(titleCheckboxes.length).toBe(4);

      expect((titleCheckboxes[0].element as HTMLInputElement).checked).toBe(true);
      expect((titleCheckboxes[1].element as HTMLInputElement).checked).toBe(false);
      expect((titleCheckboxes[2].element as HTMLInputElement).checked).toBe(false);
      expect((titleCheckboxes[3].element as HTMLInputElement).checked).toBe(false);
    });

    it('should NOT pre-select title with incomplete children', async () => {
      const mockTodos = createMockTodos();
      (database.getAllTodos as vi.Mock).mockResolvedValue(mockTodos);
      await store.loadTodos();

      const wrapper = mount(DeleteView, {
        global: {
          plugins: [router],
          stubs: { RouterLink: true },
        },
      });

      await wrapper.vm.$nextTick();

      const summaryElements = wrapper.findAll('.delete-item > details > summary');
      const title4Checkbox = summaryElements[3].find('input[type="checkbox"]');
      expect((title4Checkbox.element as HTMLInputElement).checked).toBe(false);
    });

    it('should NOT pre-select title with no children', async () => {
      const mockTodos = createMockTodos();
      (database.getAllTodos as vi.Mock).mockResolvedValue(mockTodos);
      await store.loadTodos();

      const wrapper = mount(DeleteView, {
        global: {
          plugins: [router],
          stubs: { RouterLink: true },
        },
      });

      await wrapper.vm.$nextTick();

      const summaryElements = wrapper.findAll('.delete-item > details > summary');
      const title3Checkbox = summaryElements[2].find('input[type="checkbox"]');
      expect((title3Checkbox.element as HTMLInputElement).checked).toBe(false);
    });
  });

  describe('hiding non-completed children', () => {
    it('should only show completed children in the list', async () => {
      const mockTodos = createMockTodos();
      (database.getAllTodos as vi.Mock).mockResolvedValue(mockTodos);
      await store.loadTodos();

      const wrapper = mount(DeleteView, {
        global: {
          plugins: [router],
          stubs: { RouterLink: true },
        },
      });

      await wrapper.vm.$nextTick();

      const childItems = wrapper.findAll('.child-item');
      expect(childItems.length).toBe(3);

      const childSpans = childItems[0].findAll('span');
      expect(childSpans[0].text()).toBe('✅');
      expect(childSpans[1].text()).toBe('Child 1 - Completed');

      const childSpans2 = childItems[1].findAll('span');
      expect(childSpans2[0].text()).toBe('✅');
      expect(childSpans2[1].text()).toBe('Child 2 - Completed');

      const childSpans3 = childItems[2].findAll('span');
      expect(childSpans3[0].text()).toBe('✅');
      expect(childSpans3[1].text()).toBe('Child 4 - Completed');
    });

    it('should show title with empty children section when no completed children', async () => {
      const mockTodos: TodoItem[] = [
        {
          id: 1,
          parentId: 0,
          index: 0,
          completed: false,
          text: 'Title with incomplete children',
          createdAt: new Date(),
          completedAt: null,
        },
        {
          id: 2,
          parentId: 1,
          index: 0,
          completed: false,
          text: 'Incomplete Child',
          createdAt: new Date(),
          completedAt: null,
        },
      ];
      (database.getAllTodos as vi.Mock).mockResolvedValue(mockTodos);
      await store.loadTodos();

      const wrapper = mount(DeleteView, {
        global: {
          plugins: [router],
          stubs: { RouterLink: true },
        },
      });

      await wrapper.vm.$nextTick();

      const deleteItems = wrapper.findAll('.delete-item');
      expect(deleteItems.length).toBe(1);

      const childItems = wrapper.findAll('.child-item');
      expect(childItems.length).toBe(0);

      const childrenSection = wrapper.find('.children-section');
      expect(childrenSection.exists()).toBe(true);
      expect(childrenSection.text()).toBe('');
    });
  });

  describe('title checkbox', () => {
    it('should be disabled when not all children are completed', async () => {
      const mockTodos: TodoItem[] = [
        {
          id: 1,
          parentId: 0,
          index: 0,
          completed: true,
          text: 'Title',
          createdAt: new Date(),
          completedAt: new Date(),
        },
        {
          id: 2,
          parentId: 1,
          index: 0,
          completed: true,
          text: 'Child 1 - Completed',
          createdAt: new Date(),
          completedAt: new Date(),
        },
        {
          id: 3,
          parentId: 1,
          index: 1,
          completed: false,
          text: 'Child 2 - Incomplete',
          createdAt: new Date(),
          completedAt: null,
        },
      ];
      (database.getAllTodos as vi.Mock).mockResolvedValue(mockTodos);
      await store.loadTodos();

      const wrapper = mount(DeleteView, {
        global: {
          plugins: [router],
          stubs: { RouterLink: true },
        },
      });

      await wrapper.vm.$nextTick();

      const summaryElements = wrapper.findAll('.delete-item > details > summary');
      const titleCheckbox = summaryElements[0].find('input[type="checkbox"]');
      expect(titleCheckbox.attributes('disabled')).toBeDefined();
      expect((titleCheckbox.element as HTMLInputElement).checked).toBe(false);
    });

    it('should be disabled when all children completed but not all selected', async () => {
      const mockTodos: TodoItem[] = [
        {
          id: 1,
          parentId: 0,
          index: 0,
          completed: true,
          text: 'Title',
          createdAt: new Date(),
          completedAt: new Date(),
        },
        {
          id: 2,
          parentId: 1,
          index: 0,
          completed: true,
          text: 'Child 1 - Completed',
          createdAt: new Date(),
          completedAt: new Date(),
        },
        {
          id: 3,
          parentId: 1,
          index: 1,
          completed: true,
          text: 'Child 2 - Completed',
          createdAt: new Date(),
          completedAt: new Date(),
        },
      ];
      (database.getAllTodos as vi.Mock).mockResolvedValue(mockTodos);
      await store.loadTodos();

      const wrapper = mount(DeleteView, {
        global: {
          plugins: [router],
          stubs: { RouterLink: true },
        },
      });

      await wrapper.vm.$nextTick();

      const summaryElements = wrapper.findAll('.delete-item > details > summary');
      const titleCheckbox = summaryElements[0].find('input[type="checkbox"]');
      expect((titleCheckbox.element as HTMLInputElement).checked).toBe(true);

      const childCheckboxes = wrapper.findAll('.child-item input[type="checkbox"]');
      await childCheckboxes[1].setValue(false);
      await wrapper.vm.$nextTick();

      expect((titleCheckbox.element as HTMLInputElement).checked).toBe(false);
      expect(titleCheckbox.attributes('disabled')).toBeDefined();
    });

    it('should be enabled when all children completed and all selected', async () => {
      const mockTodos: TodoItem[] = [
        {
          id: 1,
          parentId: 0,
          index: 0,
          completed: true,
          text: 'Title',
          createdAt: new Date(),
          completedAt: new Date(),
        },
        {
          id: 2,
          parentId: 1,
          index: 0,
          completed: true,
          text: 'Child 1 - Completed',
          createdAt: new Date(),
          completedAt: new Date(),
        },
        {
          id: 3,
          parentId: 1,
          index: 1,
          completed: true,
          text: 'Child 2 - Completed',
          createdAt: new Date(),
          completedAt: new Date(),
        },
      ];
      (database.getAllTodos as vi.Mock).mockResolvedValue(mockTodos);
      await store.loadTodos();

      const wrapper = mount(DeleteView, {
        global: {
          plugins: [router],
          stubs: { RouterLink: true },
        },
      });

      await wrapper.vm.$nextTick();

      const summaryElements = wrapper.findAll('.delete-item > details > summary');
      const titleCheckbox = summaryElements[0].find('input[type="checkbox"]');
      expect((titleCheckbox.element as HTMLInputElement).checked).toBe(true);
      expect(titleCheckbox.attributes('disabled')).toBeUndefined();
    });

    it('should be enabled when title has no children', async () => {
      const mockTodos: TodoItem[] = [
        {
          id: 1,
          parentId: 0,
          index: 0,
          completed: false,
          text: 'Title with no children',
          createdAt: new Date(),
          completedAt: null,
        },
      ];
      (database.getAllTodos as vi.Mock).mockResolvedValue(mockTodos);
      await store.loadTodos();

      const wrapper = mount(DeleteView, {
        global: {
          plugins: [router],
          stubs: { RouterLink: true },
        },
      });

      await wrapper.vm.$nextTick();

      const summaryElements = wrapper.findAll('.delete-item > details > summary');
      const titleCheckbox = summaryElements[0].find('input[type="checkbox"]');
      expect((titleCheckbox.element as HTMLInputElement).checked).toBe(false);
      expect(titleCheckbox.attributes('disabled')).toBeUndefined();
    });

    it('should toggle children selection when title is toggled', async () => {
      const mockTodos: TodoItem[] = [
        {
          id: 1,
          parentId: 0,
          index: 0,
          completed: true,
          text: 'Title',
          createdAt: new Date(),
          completedAt: new Date(),
        },
        {
          id: 2,
          parentId: 1,
          index: 0,
          completed: true,
          text: 'Child 1',
          createdAt: new Date(),
          completedAt: new Date(),
        },
        {
          id: 3,
          parentId: 1,
          index: 1,
          completed: true,
          text: 'Child 2',
          createdAt: new Date(),
          completedAt: new Date(),
        },
      ];
      (database.getAllTodos as vi.Mock).mockResolvedValue(mockTodos);
      await store.loadTodos();

      const wrapper = mount(DeleteView, {
        global: {
          plugins: [router],
          stubs: { RouterLink: true },
        },
      });

      await wrapper.vm.$nextTick();

      const titleCheckbox = wrapper.find('.delete-item > details > summary > .delete-checkbox');
      expect((titleCheckbox.element as HTMLInputElement).checked).toBe(true);

      await titleCheckbox.trigger('click');

      expect((titleCheckbox.element as HTMLInputElement).checked).toBe(false);
    });

    it('should enable title when child is toggled back on', async () => {
      const mockTodos: TodoItem[] = [
        {
          id: 1,
          parentId: 0,
          index: 0,
          completed: true,
          text: 'Title',
          createdAt: new Date(),
          completedAt: new Date(),
        },
        {
          id: 2,
          parentId: 1,
          index: 0,
          completed: true,
          text: 'Child 1',
          createdAt: new Date(),
          completedAt: new Date(),
        },
        {
          id: 3,
          parentId: 1,
          index: 1,
          completed: true,
          text: 'Child 2',
          createdAt: new Date(),
          completedAt: new Date(),
        },
      ];
      (database.getAllTodos as vi.Mock).mockResolvedValue(mockTodos);
      await store.loadTodos();

      const wrapper = mount(DeleteView, {
        global: {
          plugins: [router],
          stubs: { RouterLink: true },
        },
      });

      await wrapper.vm.$nextTick();

      const summaryElements = wrapper.findAll('.delete-item > details > summary');
      const titleCheckbox = summaryElements[0].find('input[type="checkbox"]');
      expect((titleCheckbox.element as HTMLInputElement).checked).toBe(true);

      const childCheckboxes = wrapper.findAll('.child-item input[type="checkbox"]');
      await childCheckboxes[1].setValue(false);
      await wrapper.vm.$nextTick();

      expect((titleCheckbox.element as HTMLInputElement).checked).toBe(false);
      expect(titleCheckbox.attributes('disabled')).toBeDefined();

      await childCheckboxes[1].setValue(true);
      await wrapper.vm.$nextTick();

      expect((titleCheckbox.element as HTMLInputElement).checked).toBe(true);
      expect(titleCheckbox.attributes('disabled')).toBeUndefined();
    });

    it('should disable title when multiple children are deselected', async () => {
      const mockTodos: TodoItem[] = [
        {
          id: 1,
          parentId: 0,
          index: 0,
          completed: true,
          text: 'Title',
          createdAt: new Date(),
          completedAt: new Date(),
        },
        {
          id: 2,
          parentId: 1,
          index: 0,
          completed: true,
          text: 'Child 1',
          createdAt: new Date(),
          completedAt: new Date(),
        },
        {
          id: 3,
          parentId: 1,
          index: 1,
          completed: true,
          text: 'Child 2',
          createdAt: new Date(),
          completedAt: new Date(),
        },
        {
          id: 4,
          parentId: 1,
          index: 2,
          completed: true,
          text: 'Child 3',
          createdAt: new Date(),
          completedAt: new Date(),
        },
      ];
      (database.getAllTodos as vi.Mock).mockResolvedValue(mockTodos);
      await store.loadTodos();

      const wrapper = mount(DeleteView, {
        global: {
          plugins: [router],
          stubs: { RouterLink: true },
        },
      });

      await wrapper.vm.$nextTick();

      const summaryElements = wrapper.findAll('.delete-item > details > summary');
      const titleCheckbox = summaryElements[0].find('input[type="checkbox"]');
      expect((titleCheckbox.element as HTMLInputElement).checked).toBe(true);

      const childCheckboxes = wrapper.findAll('.child-item input[type="checkbox"]');
      await childCheckboxes[0].setValue(false);
      await childCheckboxes[1].setValue(false);
      await wrapper.vm.$nextTick();

      expect((titleCheckbox.element as HTMLInputElement).checked).toBe(false);
      expect(titleCheckbox.attributes('disabled')).toBeDefined();
    });

    it('should enable title when all children are selected manually', async () => {
      const mockTodos: TodoItem[] = [
        {
          id: 1,
          parentId: 0,
          index: 0,
          completed: true,
          text: 'Title',
          createdAt: new Date(),
          completedAt: new Date(),
        },
        {
          id: 2,
          parentId: 1,
          index: 0,
          completed: true,
          text: 'Child 1',
          createdAt: new Date(),
          completedAt: new Date(),
        },
        {
          id: 3,
          parentId: 1,
          index: 1,
          completed: true,
          text: 'Child 2',
          createdAt: new Date(),
          completedAt: new Date(),
        },
      ];
      (database.getAllTodos as vi.Mock).mockResolvedValue(mockTodos);
      await store.loadTodos();

      const wrapper = mount(DeleteView, {
        global: {
          plugins: [router],
          stubs: { RouterLink: true },
        },
      });

      await wrapper.vm.$nextTick();

      const summaryElements = wrapper.findAll('.delete-item > details > summary');
      const titleCheckbox = summaryElements[0].find('input[type="checkbox"]');

      const childCheckboxes = wrapper.findAll('.child-item input[type="checkbox"]');
      await childCheckboxes[1].setValue(false);
      await wrapper.vm.$nextTick();

      expect((titleCheckbox.element as HTMLInputElement).checked).toBe(false);
      expect(titleCheckbox.attributes('disabled')).toBeDefined();

      await childCheckboxes[1].setValue(true);
      await wrapper.vm.$nextTick();

      expect((titleCheckbox.element as HTMLInputElement).checked).toBe(true);
      expect(titleCheckbox.attributes('disabled')).toBeUndefined();
    });

    it('should disable title with single child when child is deselected', async () => {
      const mockTodos: TodoItem[] = [
        {
          id: 1,
          parentId: 0,
          index: 0,
          completed: true,
          text: 'Title',
          createdAt: new Date(),
          completedAt: new Date(),
        },
        {
          id: 2,
          parentId: 1,
          index: 0,
          completed: true,
          text: 'Only Child',
          createdAt: new Date(),
          completedAt: new Date(),
        },
      ];
      (database.getAllTodos as vi.Mock).mockResolvedValue(mockTodos);
      await store.loadTodos();

      const wrapper = mount(DeleteView, {
        global: {
          plugins: [router],
          stubs: { RouterLink: true },
        },
      });

      await wrapper.vm.$nextTick();

      const summaryElements = wrapper.findAll('.delete-item > details > summary');
      const titleCheckbox = summaryElements[0].find('input[type="checkbox"]');
      expect((titleCheckbox.element as HTMLInputElement).checked).toBe(true);

      const childCheckboxes = wrapper.findAll('.child-item input[type="checkbox"]');
      await childCheckboxes[0].setValue(false);
      await wrapper.vm.$nextTick();

      expect((titleCheckbox.element as HTMLInputElement).checked).toBe(false);
      expect(titleCheckbox.attributes('disabled')).toBeDefined();
    });

    it('should only affect the correct title when deselecting children', async () => {
      const mockTodos: TodoItem[] = [
        {
          id: 1,
          parentId: 0,
          index: 0,
          completed: true,
          text: 'Title 1',
          createdAt: new Date(),
          completedAt: new Date(),
        },
        {
          id: 2,
          parentId: 1,
          index: 0,
          completed: true,
          text: 'Child 1-1',
          createdAt: new Date(),
          completedAt: new Date(),
        },
        {
          id: 3,
          parentId: 1,
          index: 1,
          completed: true,
          text: 'Child 1-2',
          createdAt: new Date(),
          completedAt: new Date(),
        },
        {
          id: 4,
          parentId: 0,
          index: 1,
          completed: true,
          text: 'Title 2',
          createdAt: new Date(),
          completedAt: new Date(),
        },
        {
          id: 5,
          parentId: 4,
          index: 0,
          completed: true,
          text: 'Child 2-1',
          createdAt: new Date(),
          completedAt: new Date(),
        },
        {
          id: 6,
          parentId: 4,
          index: 1,
          completed: true,
          text: 'Child 2-2',
          createdAt: new Date(),
          completedAt: new Date(),
        },
      ];
      (database.getAllTodos as vi.Mock).mockResolvedValue(mockTodos);
      await store.loadTodos();

      const wrapper = mount(DeleteView, {
        global: {
          plugins: [router],
          stubs: { RouterLink: true },
        },
      });

      await wrapper.vm.$nextTick();

      const summaryElements = wrapper.findAll('.delete-item > details > summary');
      const title1Checkbox = summaryElements[0].find('input[type="checkbox"]');
      const title2Checkbox = summaryElements[1].find('input[type="checkbox"]');
      expect((title1Checkbox.element as HTMLInputElement).checked).toBe(true);
      expect((title2Checkbox.element as HTMLInputElement).checked).toBe(true);

      const childItems = wrapper.findAll('.child-item');
      const child1Checkbox = childItems[1].find('input[type="checkbox"]');
      await child1Checkbox.setValue(false);
      await wrapper.vm.$nextTick();

      expect((title1Checkbox.element as HTMLInputElement).checked).toBe(false);
      expect(title1Checkbox.attributes('disabled')).toBeDefined();
      expect((title2Checkbox.element as HTMLInputElement).checked).toBe(true);
      expect(title2Checkbox.attributes('disabled')).toBeUndefined();
    });
  });

  describe('delete button', () => {
    it('should show correct count of selected items', async () => {
      const mockTodos = createMockTodos();
      (database.getAllTodos as vi.Mock).mockResolvedValue(mockTodos);
      await store.loadTodos();

      (database.deleteTodo as vi.Mock).mockResolvedValue(undefined);
      (database.deleteTodosByParentId as vi.Mock).mockResolvedValue(undefined);

      const wrapper = mount(DeleteView, {
        global: {
          plugins: [router],
          stubs: { RouterLink: true },
        },
      });

      await wrapper.vm.$nextTick();

      const deleteButton = wrapper.find('.delete-button');
      expect(deleteButton.text()).toContain('Delete (4)');
    });

    it('should set showDeleteConfirm to true when delete button is clicked', async () => {
      const mockTodos = createMockTodos();
      (database.getAllTodos as vi.Mock).mockResolvedValue(mockTodos);
      await store.loadTodos();

      const wrapper = mount(DeleteView, {
        global: {
          plugins: [router],
          stubs: { RouterLink: true },
        },
      });

      await wrapper.vm.$nextTick();

      expect(wrapper.vm.showDeleteConfirm).toBe(false);

      const deleteButton = wrapper.find('.delete-button');
      await deleteButton.trigger('click');
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.showDeleteConfirm).toBe(true);
    });

    it('should show confirmation dialog when delete button is clicked', async () => {
      const mockTodos = createMockTodos();
      (database.getAllTodos as vi.Mock).mockResolvedValue(mockTodos);
      await store.loadTodos();

      const wrapper = mount(DeleteView, {
        global: {
          plugins: [router],
          stubs: { RouterLink: true },
        },
      });

      await wrapper.vm.$nextTick();

      const deleteButton = wrapper.find('.delete-button');
      await deleteButton.trigger('click');
      await wrapper.vm.$nextTick();

      const dialog = wrapper.find('dialog');
      expect(dialog.exists()).toBe(true);
    });

    it('should delete items when confirmed in dialog', async () => {
      const mockTodos = createMockTodos();
      (database.getAllTodos as vi.Mock).mockResolvedValue(mockTodos);
      await store.loadTodos();

      (database.deleteTodo as vi.Mock).mockResolvedValue(undefined);
      (database.deleteTodosByParentId as vi.Mock).mockResolvedValue(undefined);

      const wrapper = mount(DeleteView, {
        global: {
          plugins: [router],
          stubs: { RouterLink: true },
        },
      });

      await wrapper.vm.$nextTick();

      const deleteButton = wrapper.find('.delete-button');
      await deleteButton.trigger('click');
      await wrapper.vm.$nextTick();

      const confirmButton = wrapper.find('.confirm-button');
      await confirmButton.trigger('click');
      await wrapper.vm.$nextTick();

      expect(database.deleteTodosByParentId).toHaveBeenCalled();
    });

    it('should not delete items when cancelled in dialog', async () => {
      const mockTodos = createMockTodos();
      (database.getAllTodos as vi.Mock).mockResolvedValue(mockTodos);
      await store.loadTodos();

      const wrapper = mount(DeleteView, {
        global: {
          plugins: [router],
          stubs: { RouterLink: true },
        },
      });

      await wrapper.vm.$nextTick();

      const deleteButton = wrapper.find('.delete-button');
      await deleteButton.trigger('click');
      await wrapper.vm.$nextTick();

      const cancelButton = wrapper.find('.cancel-button');
      await cancelButton.trigger('click');
      await wrapper.vm.$nextTick();

      expect(database.deleteTodosByParentId).not.toHaveBeenCalled();
    });
  });
});