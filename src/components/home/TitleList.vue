<template>
  <div class="title-list">
    <TitleCard
      v-for="title in titles"
      :key="title.id"
      :title="title"
      :children="getChildrenByParentId(title.id)"
      @edit="emit('edit', $event)"
    />
    <div v-if="titles.length === 0" class="no-titles">
      No titles found
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TodoTitle, TodoChild } from '../../types';
import TitleCard from './TitleCard.vue';

defineProps<{
  titles: TodoTitle[];
  getChildrenByParentId: (parentId: number) => TodoChild[];
}>();

const emit = defineEmits<{
  (e: 'edit', id: number): void;
}>();
</script>

<style>
.title-list {
  margin-top: 16px;
}
.no-titles {
  text-align: center;
  color: #666;
  padding: 20px;
}
</style>