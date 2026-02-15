<template>
  <router-view></router-view>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useNotesStore } from './stores/notes';

const store = useNotesStore();

onMounted(() => {
  store.loadTodos();
});
</script>

<style>
:root {
  --bg-primary: Canvas;
  --bg-secondary: Field;
  --text-primary: CanvasText;
  --text-secondary: GrayText;
  --border-color: silver;
  --border-light: #e0e0e0;
  --accent-add: limegreen;
  --accent-delete: crimson;
  --bg-sticky-footer: Field;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #1e1e1e;
    --bg-secondary: #2d2d2d;
    --text-primary: #e8e8e8;
    --text-secondary: #a0a0a0;
    --border-color: #5a5a5a;
    --border-light: #404040;
    --accent-add: limegreen;
    --accent-delete: crimson;
    --bg-sticky-footer: #2d2d2d;
  }
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
}

#app {
  min-height: 100vh;
  background: var(--bg-primary);
}

input, button {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border-color: var(--border-color);
}
</style>