import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { TodoItem, TodoTitle, TodoChild, FilterOptions } from '../types';
import * as database from '../services/database';
import { PARENT_ID_TITLE } from '../types';

export const useNotesStore = defineStore('notes', () => {
  const todos = ref<TodoItem[]>([]);
  const filterOptions = ref<FilterOptions>({ searchText: '' });

  const titles = computed(() =>
    todos.value
      .filter(t => t.parentId === PARENT_ID_TITLE)
      .sort((a, b) => a.index - b.index)
  );

  const filteredTitles = computed(() => {
    const searchText = filterOptions.value.searchText.toLowerCase();
    return titles.value.filter(t =>
      t.text.toLowerCase().includes(searchText)
    );
  });

  function getChildrenByParentId(parentId: number): TodoItem[] {
    return todos.value
      .filter(t => t.parentId === parentId)
      .sort((a, b) => a.index - b.index);
  }

  async function loadTodos() {
    todos.value = await database.getAllTodos();
  }

  async function addTitle(text: string): Promise<TodoTitle> {
    const id = await database.getNextId();
    const newItem: TodoItem = {
      id,
      parentId: 0,
      index: titles.value.length,
      completed: false,
      text,
      createdAt: new Date(),
      completedAt: null,
    };
    await database.saveTodo(newItem);
    todos.value.push(newItem);
    return newItem as TodoTitle;
  }

  async function addChild(parentId: number, text: string): Promise<TodoChild> {
    const id = await database.getNextId();
    const children = getChildrenByParentId(parentId);
    const newItem: TodoItem = {
      id,
      parentId,
      index: children.length,
      completed: false,
      text,
      createdAt: new Date(),
      completedAt: null,
    };
    await database.saveTodo(newItem);
    todos.value.push(newItem);
    return newItem as TodoChild;
  }

  async function updateTodo(item: TodoItem) {
    await database.saveTodo(item);
    const index = todos.value.findIndex(t => t.id === item.id);
    if (index !== -1) todos.value[index] = item;
  }

  async function deleteTodoAndChildren(id: number) {
    const item = todos.value.find(t => t.id === id);
    if (!item) return;

    const children = todos.value.filter(t => t.parentId === id);
    await database.deleteTodosByParentId(id);
    await database.deleteTodo(id);

    todos.value = todos.value.filter(
      t => t.id !== id && t.parentId !== id
    );
  }

  async function deleteTodosByIds(ids: number[]) {
    const idsToDelete = new Set(ids);

    const itemsToDelete = todos.value.filter(t => idsToDelete.has(t.id));
    const allChildIds = new Set<number>();

    for (const item of itemsToDelete) {
      const children = todos.value.filter(t => t.parentId === item.id);
      children.forEach(c => allChildIds.add(c.id));
    }

    const finalIdsToDelete = new Set([...idsToDelete, ...allChildIds]);

    for (const id of idsToDelete) {
      await database.deleteTodosByParentId(id);
      await database.deleteTodo(id);
    }

    todos.value = todos.value.filter(
      t => !finalIdsToDelete.has(t.id)
    );
  }

  async function toggleCompletion(id: number) {
    const item = todos.value.find(t => t.id === id);
    if (!item) return;

    const updated = { ...item };
    updated.completed = !item.completed;
    updated.completedAt = updated.completed ? new Date() : null;
    await database.saveTodo(updated);

    const index = todos.value.findIndex(t => t.id === id);
    if (index !== -1) todos.value[index] = updated;
  }

  async function updateChildrenOrder(parentId: number, items: TodoItem[]) {
    const updatedItems = items.map((item, index) => ({
      ...item,
      index,
      parentId,
    }));
    await database.updateTodosOrder(updatedItems);

    todos.value = todos.value.map(t => {
      const updated = updatedItems.find(u => u.id === t.id);
      return updated || t;
    });
  }

  function setFilter(searchText: string) {
    filterOptions.value.searchText = searchText;
  }

  function clearFilter() {
    filterOptions.value.searchText = '';
  }

  return {
    todos,
    filterOptions,
    titles,
    filteredTitles,
    getChildrenByParentId,
    loadTodos,
    addTitle,
    addChild,
    updateTodo,
    deleteTodoAndChildren,
    deleteTodosByIds,
    toggleCompletion,
    updateChildrenOrder,
    setFilter,
    clearFilter,
  };
});