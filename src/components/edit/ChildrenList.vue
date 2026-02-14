<template>
  <div >
    <draggable
      class="children-list"
      v-model="list"
      handle=".drag-handle"
      @end="handleReorder"
    >
        <div
          v-for="element in list"
          :key="element.id"
          class="child-item"
        >
          <DraggableIcon />
          <CompletedIcon
            :completed="element.completed"
            @toggle="toggleComplete(element.id)"
          />
          <input
            v-model="element.text"
            @blur="handleTextChange(element)"
            class="child-text"
          />
        </div>
    </draggable>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import {VueDraggableNext as draggable} from 'vue-draggable-next';
import DraggableIcon from '../common/DraggableIcon.vue';
import CompletedIcon from '../common/CompletedIcon.vue';
import type { TodoItem } from '../../types';

const props = defineProps<{ children: TodoItem[] }>();
const emit = defineEmits<{
  (e: 'toggle', id: number): void;
  (e: 'update', children: TodoItem[]): void;
  (e: 'delete', id: number): void;
}>();

const list = ref<TodoItem[]>([...(props.children || [])]);

watch(() => props.children, (newVal) => {
  if (newVal) {
    list.value = [...newVal];
  }
}, { deep: true });

function handleReorder() {
  emit('update', [...list.value]);
}

function toggleComplete(id: number) { emit('toggle', id); }

function handleTextChange(element: TodoItem) {
  if (element.text.trim() === '') emit('delete', element.id);
}
</script>

<style scoped>
.children-list {
  margin: 16px 0;
}

.child-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border: 1px solid #eee;
  margin: 4px 0;
  border-radius: 4px;
}

.child-text {
  flex: 1;
  border: 1px solid #ccc;
  padding: 4px 8px;
}
</style>
