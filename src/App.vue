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