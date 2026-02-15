<template>
  <div class="title-card">
    <details :open="isOpen">
      <summary class="title-summary">
        <span class="expand-icon">{{ isOpen ? '▲' : '▼' }}</span>
        <span class="title-text">{{ title.text }}</span>
        <button
          class="edit-button"
          @click.prevent="emit('edit', title.id)"
          aria-label="Edit"
        >
          ✏️
        </button>
      </summary>
      <div class="children-preview">
        <div
          v-for="child in previewChildren"
          :key="child.id"
          class="child-preview-item"
        >
          <span>{{ child.completed ? '✅' : '◻️' }}</span>
          <span>{{ child.text }}</span>
        </div>
        <div v-if="children.length === 0" class="no-children">
          No items yet
        </div>
      </div>
    </details>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { TodoTitle, TodoChild } from '../../types';

const props = defineProps<{
  title: TodoTitle;
  children: TodoChild[];
  isOpen?: boolean;
}>();

const emit = defineEmits<{
  (e: 'edit', id: number): void;
  (e: 'toggle', id: number): void;
}>();

const previewChildren = computed(() =>
  props.children
);
</script>

<style>
.title-card {
  border: 1px solid var(--border-color);
  margin: 8px 0;
  border-radius: 4px;
  background: var(--bg-secondary);
}
.title-summary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  cursor: pointer;
  list-style: none;
}
.title-summary::-webkit-details-marker {
  display: none;
}
.expand-icon {
  font-size: 0.8em;
}
.title-text {
  flex: 1;
  font-weight: bold;
}
.edit-button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2em;
}
.children-preview {
  padding: 8px 16px;
  border-top: 1px solid var(--border-light);
}
.child-preview-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
}
.more-children {
  color: var(--text-secondary);
  font-style: italic;
  padding: 4px 0;
}
.no-children {
  color: var(--text-secondary);
  font-style: italic;
  padding: 4px 0;
}
</style>
