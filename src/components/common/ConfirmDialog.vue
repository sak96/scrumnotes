<template>
  <dialog
    ref="dialogRef"
    :id="id"
    class="confirm-dialog"
    @click="handleBackdropClick"
  >
    <div class="dialog-content" @click.stop>
      <h2 v-if="title">{{ title }}</h2>
      <p>{{ message }}</p>
      <div class="dialog-actions">
        <button class="cancel-button" @click="handleCancel">
          {{ cancelText }}
        </button>
        <button class="confirm-button" @click="handleConfirm">
          {{ confirmText }}
        </button>
      </div>
    </div>
  </dialog>
</template>

<script setup lang="ts">
import { watch, ref } from 'vue';

const props = defineProps<{
  id: string;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'confirm'): void;
  (e: 'cancel'): void;
}>();

const dialogRef = ref<HTMLDialogElement | null>(null);

watch(() => props.modelValue, (newVal) => {
  if (!dialogRef.value) return;
  if (newVal) {
    dialogRef.value.showModal();
  } else {
    dialogRef.value.close();
  }
});

function handleBackdropClick(e: MouseEvent) {
  if (e.target === dialogRef.value) {
    emit('update:modelValue', false);
    emit('cancel');
  }
}

function handleCancel() {
  if (dialogRef.value) dialogRef.value.close();
  emit('update:modelValue', false);
  emit('cancel');
}

function handleConfirm() {
  if (dialogRef.value) dialogRef.value.close();
  emit('update:modelValue', false);
  emit('confirm');
}
</script>

<style>
.confirm-dialog {
  padding: 0;
  border: none;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  max-width: 400px;
  width: 90%;
}

.confirm-dialog::backdrop {
  background: rgba(0, 0, 0, 0.5);
}

.confirm-dialog[popover] {
  margin: auto;
}

.dialog-content {
  padding: 24px;
  text-align: center;
}

.dialog-content h2 {
  margin: 0 0 16px;
  font-size: 1.25em;
}

.dialog-content p {
  margin: 0 0 24px;
  color: var(--text-secondary);
}

.dialog-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.cancel-button,
.confirm-button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1em;
}

.cancel-button {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.confirm-button {
  background: var(--accent-delete);
  color: white;
}

.cancel-button:hover {
  background: var(--border-color);
}

.confirm-button:hover {
  opacity: 0.9;
}
</style>