<template>
  <div class="home-view">
    <div class="search-add-section">
      <input
        :value="searchText"
        @input="updateSearch"
        placeholder="🔍 Filter titles..."
        class="search-input"
        spellcheck="true"
      />
      <button
        class="add-button"
        @click="handleAdd"
      >
        ➕
      </button>
      <button
        class="delete-button"
        @click="router.push('/delete')"
        aria-label="Delete"
      >
        🗑️
      </button>
    </div>
    <TitleCard
      v-for="title in filteredTitles"
      :key="title.id"
      :title="title"
      :children="getChildrenByParentId(title.id)"
      @edit="handleEdit"
    />
    <div v-if="filteredTitles.length === 0" class="no-titles">
      No titles found
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useNotesStore } from '../stores/notes';
import TitleCard from '../components/home/TitleCard.vue';
import type { TodoTitle, TodoChild } from '../types';

const router = useRouter();
const store = useNotesStore();

const searchText = ref('');

onMounted(() => {
  store.clearFilter();
  searchText.value = '';
});

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
