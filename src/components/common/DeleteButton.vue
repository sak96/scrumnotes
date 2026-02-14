<template>
  <button
    class="delete-button"
    @click="emit('delete')"
    aria-label="Delete"
  >
    🗑️
  </button>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  (e: 'delete'): void;
}>();
</script>

<style>
.delete-button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2em;
  padding: 0;
}
</style>