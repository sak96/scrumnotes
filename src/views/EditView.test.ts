/// <reference types="vitest" />
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { mount } from '@vue/test-utils';
import { createRouter, createWebHistory } from 'vue-router';
import * as database from '@/services/database';
import EditView from './EditView.vue';
import { useNotesStore } from '@/stores/notes';
import type { TodoItem } from '@/types';

vi.mock('@/services/database');

describe('EditView', () => {
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
      completed: false,
      text: 'Title 1',
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
      completed: true,
      text: 'Child 2',
      createdAt: new Date(),
      completedAt: new Date(),
    },
  ];

  it('renders title when found', async () => {
    const mockTodos = createMockTodos();
    (database.getAllTodos as vi.Mock).mockResolvedValue(mockTodos);
    await store.loadTodos();

    const wrapper = mount(EditView, {
      props: { id: '1' },
      global: {
        plugins: [router],
        stubs: { RouterLink: true },
      },
    });

    await wrapper.vm.$nextTick();

    const titleInput = wrapper.find('.title-input');
    expect(titleInput.exists()).toBe(true);
    expect(titleInput.attributes('value')).toBe('Title 1');
  });

  it('shows not found when title does not exist', async () => {
    const mockTodos = createMockTodos();
    (database.getAllTodos as vi.Mock).mockResolvedValue(mockTodos);
    await store.loadTodos();

    const wrapper = mount(EditView, {
      props: { id: '999' },
      global: {
        plugins: [router],
        stubs: { RouterLink: true },
      },
    });

    await wrapper.vm.$nextTick();

    const notFound = wrapper.find('.not-found');
    expect(notFound.exists()).toBe(true);
    expect(notFound.text()).toBe('Title not found');
  });

  it('should set showDeleteConfirm to true when delete button is clicked', async () => {
    const mockTodos = createMockTodos();
    (database.getAllTodos as vi.Mock).mockResolvedValue(mockTodos);
    await store.loadTodos();

    const wrapper = mount(EditView, {
      props: { id: '1' },
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

    const wrapper = mount(EditView, {
      props: { id: '1' },
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

  it('should navigate to home when delete is confirmed', async () => {
    const mockTodos = createMockTodos();
    (database.getAllTodos as vi.Mock).mockResolvedValue(mockTodos);
    await store.loadTodos();

    (database.deleteTodo as vi.Mock).mockResolvedValue(undefined);
    (database.deleteTodosByParentId as vi.Mock).mockResolvedValue(undefined);

    const wrapper = mount(EditView, {
      props: { id: '1' },
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

    expect(router.currentRoute.value.path).toBe('/');
  });
});