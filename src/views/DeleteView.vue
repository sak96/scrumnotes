<template>
  <div class="delete-view">
    <div class="header">
      <button
        class="home-button"
        @click="router.push('/')"
        aria-label="Home"
      >
        🏠
      </button>
      <h1>Delete Items</h1>
    </div>

    <div class="delete-list">
      <div
        v-for="title in titles"
        :key="title.id"
        class="delete-item"
      >
        <details open>
          <summary>
            <input
              type="checkbox"
              :checked="isTitleChecked(title.id)"
              @change="toggleTitle(title.id)"
              :disabled="isTitleDisabled(title.id)"
              class="delete-checkbox"
            />
            <span>{{ title.text }}</span>
          </summary>
          <div class="children-section">
            <div
              v-for="child in getCompletedChildrenByParentId(title.id)"
              :key="child.id"
              class="child-item"
            >
              <input
                type="checkbox"
                :checked="isChildChecked(child.id)"
                @change="toggleChild(child.id)"
                class="delete-checkbox"
              />
              <span>{{ child.completed ? '✅' : '◻️' }}</span>
              <span>{{ child.text }}</span>
            </div>
          </div>
        </details>
      </div>
    </div>

    <div v-if="titles.length === 0" class="no-items">
      No items to delete
    </div>

    <div class="sticky-footer">
      <button
        class="delete-button"
        @click="handleDelete"
        :disabled="checkedIds.length === 0"
      >
        🗑️ Delete ({{ checkedIds.length }})
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useNotesStore } from '../stores/notes';
import type { TodoTitle, TodoChild, TodoItem } from '../types';

const router = useRouter();
const store = useNotesStore();

const checkedTitleIds = ref<Set<number>>(new Set());
const checkedChildIds = ref<Set<number>>(new Set());

onMounted(() => {
  store.clearFilter();
  titles.value.forEach(title => {
    const completedChildren = getCompletedChildrenByParentId(title.id);
    completedChildren.forEach(child => checkedChildIds.value.add(child.id));
    if (isAllChildrenCompleted(title.id) && completedChildren.length > 0) {
      checkedTitleIds.value.add(title.id);
    }
  });
});

const titles = computed(() => store.titles as TodoTitle[]);

function getChildrenByParentId(parentId: number): TodoChild[] {
  return store.getChildrenByParentId(parentId) as TodoChild[];
}

function getCompletedChildrenByParentId(parentId: number): TodoChild[] {
  return store.getChildrenByParentId(parentId).filter(child => child.completed) as TodoChild[];
}

function isAllChildrenCompleted(parentId: number): boolean {
  const children = getChildrenByParentId(parentId);
  if (children.length === 0) return true;
  return children.every(child => child.completed);
}

function isTitleChecked(titleId: number): boolean {
  return checkedTitleIds.value.has(titleId);
}

function isTitleDisabled(titleId: number): boolean {
  const children = getChildrenByParentId(titleId);
  if (children.length === 0) return false;
  if (!isAllChildrenCompleted(titleId)) return true;
  const completedChildren = getCompletedChildrenByParentId(titleId);
  return !completedChildren.every(child => checkedChildIds.value.has(child.id));
}

function isChildChecked(childId: number): boolean {
  return checkedChildIds.value.has(childId);
}

function toggleTitle(titleId: number) {
  if (isTitleChecked(titleId)) {
    checkedTitleIds.value.delete(titleId);
    const children = getChildrenByParentId(titleId);
    children.forEach(child => checkedChildIds.value.delete(child.id));
  } else {
    checkedTitleIds.value.add(titleId);
    const children = getChildrenByParentId(titleId);
    children.forEach(child => checkedChildIds.value.add(child.id));
  }
}

function toggleChild(childId: number) {
  if (isChildChecked(childId)) {
    checkedChildIds.value.delete(childId);
    const parentId = (store.todos as TodoItem[]).find(t => t.id === childId)?.parentId;
    if (parentId && checkedTitleIds.value.has(parentId)) {
      const completedChildren = getCompletedChildrenByParentId(parentId);
      if (!completedChildren.every(child => checkedChildIds.value.has(child.id))) {
        checkedTitleIds.value.delete(parentId);
      }
    }
  } else {
    checkedChildIds.value.add(childId);
    const parentId = (store.todos as TodoItem[]).find(t => t.id === childId)?.parentId;
    if (parentId && !checkedTitleIds.value.has(parentId)) {
      const completedChildren = getCompletedChildrenByParentId(parentId);
      if (completedChildren.every(child => checkedChildIds.value.has(child.id))) {
        checkedTitleIds.value.add(parentId);
      }
    }
  }
}

const checkedIds = computed(() => {
  const ids: number[] = [];
  checkedTitleIds.value.forEach(id => ids.push(id));
  checkedChildIds.value.forEach(id => ids.push(id));
  return ids;
});

async function handleDelete() {
  if (checkedIds.value.length > 0) {
    await store.deleteTodosByIds(checkedIds.value);
    checkedTitleIds.value = new Set();
    checkedChildIds.value = new Set();
  }
}
</script>

<style>
.delete-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 16px;
  padding-bottom: 80px;
}
.header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}
.home-button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.5em;
}
h1 {
  font-size: 1.5em;
  margin: 0;
}
.delete-item {
  border: 1px solid var(--border-color);
  margin: 8px 0;
  border-radius: 4px;
  background: var(--bg-secondary);
}
.delete-item > details {
  padding: 8px;
}
.delete-item > details > summary {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  list-style: none;
}
.delete-item > details > summary::-webkit-details-marker {
  display: none;
}
.delete-checkbox {
  width: 20px;
  height: 20px;
}
.children-section {
  margin-left: 32px;
  padding: 8px 0;
}
.child-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
}
.no-items {
  text-align: center;
  color: var(--text-secondary);
  padding: 40px;
}
.sticky-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--bg-sticky-footer);
  padding: 16px;
  border-top: 1px solid var(--border-color);
  text-align: center;
}
.delete-button {
  padding: 12px 24px;
  background: var(--accent-delete);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1.1em;
}
.delete-button:disabled {
  background: var(--border-color);
  cursor: not-allowed;
}
</style>