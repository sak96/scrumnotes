<template>
  <div class="edit-view" v-if="title">
    <div class="header">
      <button
        class="home-button"
        @click="router.push('/')"
        aria-label="Home"
      >
        🏠
      </button>
      <input
        :value="title.text"
        @input="updateTitle"
        class="title-input"
      />
      <button
        class="delete-button"
        @click="handleDelete"
        aria-label="Delete"
      >
        🗑️
      </button>
    </div>
    <ChildrenList
      :children="sortedChildren"
      @toggle="handleToggle"
      @update="handleChildrenUpdate"
      @delete="handleChildDelete"
    />
    <EmptyTodo
      :text="newItemText"
      @update:text="newItemText = $event"
      @add="handleAddChild"
    />
  </div>
  <div v-else class="not-found">
    Title not found
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useNotesStore } from '../stores/notes';
import ChildrenList from '../components/edit/ChildrenList.vue';
import EmptyTodo from '../components/edit/EmptyTodo.vue';

const props = defineProps<{
  id: string;
}>();

const router = useRouter();
const store = useNotesStore();

const newItemText = ref('');

const title = computed(() =>
  store.todos.find(t => t.id === Number(props.id))
);

const children = computed(() =>
  store.getChildrenByParentId(Number(props.id))
);

const sortedChildren = computed(() =>
  children.value.sort((a, b) => a.index - b.index)
);

onMounted(() => {
  if (!title.value && store.todos.length > 0) {
    router.push('/');
  }
});

watch(() => store.todos, () => {
  if (!title.value && store.todos.length > 0) {
    router.push('/');
  }
}, { deep: true });

async function updateTitle(event: Event) {
  const value = (event.target as HTMLInputElement).value;
  if (title.value) {
    const updated = { ...title.value, text: value };
    await store.updateTodo(updated);
  }
}

async function handleToggle(id: number) {
  await store.toggleCompletion(id);
}

async function handleChildrenUpdate(updatedChildren: any[]) {
  await store.updateChildrenOrder(Number(props.id), updatedChildren);
}

async function handleChildDelete(id: number) {
  await store.deleteTodoAndChildren(id);
}

async function handleAddChild() {
  if (newItemText.value.trim()) {
    await store.addChild(Number(props.id), newItemText.value.trim());
    newItemText.value = '';
  }
}

async function handleDelete() {
  await store.deleteTodoAndChildren(Number(props.id));
  router.push('/');
}
</script>

<style>
.edit-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 16px;
}
.header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}
.home-button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.5em;
}
.title-input {
  flex: 1;
  padding: 8px 12px;
  font-size: 1.2em;
  font-weight: bold;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.delete-button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.5em;
}
.not-found {
  text-align: center;
  padding: 40px;
  color: #666;
}
</style>
