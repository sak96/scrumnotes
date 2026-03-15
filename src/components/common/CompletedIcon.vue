<template>
  <button
    class="completed-icon"
    :aria-label="completed ? 'Mark as incomplete' : 'Mark as complete'"
    @click="emit('toggle')"
  >
    {{ completed ? '✅' : '◻️' }}
  </button>
</template>

<script setup lang="ts">
defineProps<{
  completed: boolean;
}>();

const emit = defineEmits<{
  (e: 'toggle'): void;
}>();
</script>

<style>
.completed-icon {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2em;
  padding: 0;
}
</style>