<template>
  <div class="home-view">
    <div class="search-add-section">
      <input
        :value="searchText"
        placeholder="🔍 Filter titles..."
        class="search-input"
        spellcheck="true"
        @input="updateSearch"
      >
      <button
        class="add-button"
        @click="handleAdd"
      >
        ➕
      </button>
      <button
        class="delete-button"
        aria-label="Delete"
        @click="router.push('/delete')"
      >
        🗑️
      </button>
    </div>
    <draggable
      v-model="titlesList"
      handle=".draggable-icon"
      @end="handleReorder"
    >
      <TitleCard
        v-for="title in titlesList"
        :key="title.id"
        :title="title"
        :children="getChildrenByParentId(title.id)"
        @edit="handleEdit"
      />
    </draggable>
    <div
      v-if="filteredTitles.length === 0"
      class="no-titles"
    >
      No titles found
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import {VueDraggableNext as draggable} from 'vue-draggable-next';
import { useNotesStore } from '../stores/notes';
import TitleCard from '../components/home/TitleCard.vue';
import type { TodoTitle, TodoChild } from '../types';

const router = useRouter();
const store = useNotesStore();

const searchText = ref('');
const titlesList = ref<TodoTitle[]>([]);

onMounted(() => {
  store.clearFilter();
  searchText.value = '';
});

watch(() => store.filteredTitles, (newTitles) => {
  titlesList.value = [...newTitles] as TodoTitle[];
}, { immediate: true, deep: true });

const filteredTitles = computed(() => store.filteredTitles as TodoTitle[]);

function getChildrenByParentId(parentId: number): TodoChild[] {
  return store.getChildrenByParentId(parentId) as TodoChild[];
}

function updateSearch(event: Event) {
  const value = (event.target as HTMLInputElement).value;
  searchText.value = value;
  store.setFilter(value);
}

async function handleAdd() {
  const newTitle = await store.addTitle(searchText.value || 'New Title');
  router.push(`/edit/${newTitle.id}`);
}

function handleEdit(id: number) {
  router.push(`/edit/${id}`);
}

async function handleReorder() {
  await store.updateTitlesOrder(titlesList.value);
}
</script>

<style>
.home-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 16px;
}
.search-add-section {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}
.search-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
}
.add-button {
  padding: 8px 16px;
  background: var(--accent-add);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.delete-button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.5em;
  padding: 0 8px;
  color: var(--accent-delete);
}
.no-titles {
  text-align: center;
  color: var(--text-secondary);
  padding: 20px;
}
</style>
