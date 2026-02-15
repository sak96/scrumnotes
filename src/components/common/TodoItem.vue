<template>
  <div class="todo-item">
    <DraggableIcon />
    <CompletedIcon
      :completed="completed"
      @toggle="emit('toggle')"
    />
    <span v-if="editable" class="todo-text">
      <input
        :value="text"
        @input="emit('update:text', ($event.target as HTMLInputElement).value)"
        @blur="handleBlur"
        @keyup.enter="($event.target as HTMLInputElement).blur()"
      />
    </span>
    <span v-else class="todo-text">{{ text }}</span>
    <DeleteButton
      v-if="showDelete"
      @delete="emit('delete')"
    />
  </div>
</template>

<script setup lang="ts">
import DraggableIcon from './DraggableIcon.vue';
import CompletedIcon from './CompletedIcon.vue';
import DeleteButton from './DeleteButton.vue';

defineProps<{
  completed: boolean;
  text: string;
  editable?: boolean;
  showDelete?: boolean;
}>();

const emit = defineEmits<{
  (e: 'toggle'): void;
  (e: 'update:text', value: string): void;
  (e: 'delete'): void;
}>();

function handleBlur(event: FocusEvent) {
  const value = (event.target as HTMLInputElement).value;
  if (value.trim() === '') {
    emit('delete');
  }
}
</script>

<style>
.todo-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px;
}
.todo-text input {
  border: 1px solid var(--border-color);
  padding: 2px 4px;
}
</style>