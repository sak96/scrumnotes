<template>
  <span class="draggable-icon">⠿</span>
</template>

<script setup lang="ts">
</script>

<style>
.draggable-icon {
  cursor: grab;
  user-select: none;
}
.draggable-icon:active {
  cursor: grabbing;
}
</style>
