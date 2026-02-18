<template>
  <div class="empty-todo">
    <span>⠿</span>
    <span>◻️</span>
    <input
      :value="text"
      @input="emit('update:text', ($event.target as HTMLInputElement).value)"
      @keyup.enter="handleEnter"
      @blur="handleBlur"
      placeholder="Add a new item..."
      class="empty-input"
      spellcheck="true"
    />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  text: string;
}>();

const emit = defineEmits<{
  (e: 'update:text', value: string): void;
  (e: 'add'): void;
}>();

function handleEnter() {
  if (props.text.trim()) {
    emit('add');
  }
}

function handleBlur() {
  if (props.text.trim()) {
    emit('add');
  }
}
</script>

<style>
.empty-todo {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border: 1px dashed #ccc;
  margin: 4px 0;
  border-radius: 4px;
}
.empty-input {
  flex: 1;
  border: none;
  outline: none;
  padding: 4px 8px;
}
.empty-input::placeholder {
  color: #999;
}
</style>