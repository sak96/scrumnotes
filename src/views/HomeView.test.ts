/// <reference types="vitest" />
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { mount } from '@vue/test-utils';
import { createRouter, createWebHistory } from 'vue-router';
import * as database from '../services/database';
import HomeView from './HomeView.vue';
import { useNotesStore } from '../stores/notes';
import type { TodoItem } from '../types';

vi.mock('../services/database');

const DraggableStub = {
  template: '<div><slot></slot></div>',
  props: ['modelValue', 'handle', 'end'],
};

describe('HomeView', () => {
  let router: ReturnType<typeof createRouter>;
  let store: ReturnType<typeof useNotesStore>;

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    store = useNotesStore();
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/edit/:id', component: { template: '<div>Edit</div>' } },
        { path: '/delete', component: { template: '<div>Delete</div>' } },
      ],
    });
  });

  const createMockTodos = (): TodoItem[] => [
    {
      id: 1,
      parentId: 0,
      index: 0,
      completed: false,
      text: 'Title A',
      createdAt: new Date(),
      completedAt: null,
    },
    {
      id: 2,
      parentId: 0,
      index: 1,
      completed: false,
      text: 'Title B',
      createdAt: new Date(),
      completedAt: null,
    },
    {
      id: 3,
      parentId: 1,
      index: 0,
      completed: false,
      text: 'Child 1',
      createdAt: new Date(),
      completedAt: null,
    },
  ];

  it('renders title cards in draggable container', async () => {
    const mockTodos = createMockTodos();
    (database.getAllTodos as vi.Mock).mockResolvedValue(mockTodos);
    await store.loadTodos();

    const wrapper = mount(HomeView, {
      global: {
        plugins: [router],
        stubs: {
          RouterLink: true,
          draggable: DraggableStub,
        },
      },
    });

    await wrapper.vm.$nextTick();

    const titleCards = wrapper.findAllComponents({ name: 'TitleCard' });
    expect(titleCards.length).toBe(2);
  });

  it('filters titles based on search input', async () => {
    const mockTodos = createMockTodos();
    (database.getAllTodos as vi.Mock).mockResolvedValue(mockTodos);
    await store.loadTodos();

    const wrapper = mount(HomeView, {
      global: {
        plugins: [router],
        stubs: {
          RouterLink: true,
          draggable: DraggableStub,
        },
      },
    });

    await wrapper.vm.$nextTick();

    const searchInput = wrapper.find('.search-input');
    await searchInput.setValue('Title A');
    await searchInput.trigger('input');
    await wrapper.vm.$nextTick();

    const titleCards = wrapper.findAllComponents({ name: 'TitleCard' });
    expect(titleCards.length).toBe(1);
  });

  it('shows no titles message when filter has no results', async () => {
    const mockTodos = createMockTodos();
    (database.getAllTodos as vi.Mock).mockResolvedValue(mockTodos);
    await store.loadTodos();

    const wrapper = mount(HomeView, {
      global: {
        plugins: [router],
        stubs: {
          RouterLink: true,
          draggable: DraggableStub,
        },
      },
    });

    await wrapper.vm.$nextTick();

    const searchInput = wrapper.find('.search-input');
    await searchInput.setValue('nonexistent');
    await searchInput.trigger('input');
    await wrapper.vm.$nextTick();

    const noTitles = wrapper.find('.no-titles');
    expect(noTitles.exists()).toBe(true);
    expect(noTitles.text()).toBe('No titles found');
  });

  it('calls store.addTitle when add button is clicked', async () => {
    const mockTodos = createMockTodos();
    (database.getAllTodos as vi.Mock).mockResolvedValue(mockTodos);
    (database.getNextId as vi.Mock).mockResolvedValue(4);
    (database.saveTodo as vi.Mock).mockResolvedValue(undefined);
    await store.loadTodos();

    const wrapper = mount(HomeView, {
      global: {
        plugins: [router],
        stubs: {
          RouterLink: true,
          draggable: DraggableStub,
        },
      },
    });

    await wrapper.vm.$nextTick();

    const addButton = wrapper.find('.add-button');
    await addButton.trigger('click');
    await wrapper.vm.$nextTick();

    expect(database.saveTodo).toHaveBeenCalled();
  });

  it('has draggable component with drag handle', async () => {
    const mockTodos = createMockTodos();
    (database.getAllTodos as vi.Mock).mockResolvedValue(mockTodos);
    (database.updateTodosOrder as vi.Mock).mockResolvedValue(undefined);
    await store.loadTodos();

    const wrapper = mount(HomeView, {
      global: {
        plugins: [router],
        stubs: {
          RouterLink: true,
          draggable: DraggableStub,
        },
      },
    });

    await wrapper.vm.$nextTick();

    const draggableIcon = wrapper.find('.draggable-icon');
    expect(draggableIcon.exists()).toBe(true);
  });

  it('navigates to delete page when delete button is clicked', async () => {
    const mockTodos = createMockTodos();
    (database.getAllTodos as vi.Mock).mockResolvedValue(mockTodos);
    await store.loadTodos();

    const wrapper = mount(HomeView, {
      global: {
        plugins: [router],
        stubs: {
          RouterLink: true,
          draggable: DraggableStub,
        },
      },
    });

    await wrapper.vm.$nextTick();

    const deleteButton = wrapper.find('.delete-button');
    await deleteButton.trigger('click');
    await router.isReady();

    expect(router.currentRoute.value.path).toBe('/delete');
  });
});