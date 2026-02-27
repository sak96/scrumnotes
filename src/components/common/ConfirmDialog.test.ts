/// <reference types="vitest" />
import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ConfirmDialog from './ConfirmDialog.vue';

describe('ConfirmDialog', () => {
  it('renders with props', () => {
    const wrapper = mount(ConfirmDialog, {
      props: {
        id: 'test-dialog',
        title: 'Test Title',
        message: 'Test message',
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        modelValue: false,
      },
    });

    expect(wrapper.find('h2').text()).toBe('Test Title');
    expect(wrapper.find('p').text()).toBe('Test message');
    expect(wrapper.find('.confirm-button').text()).toBe('Confirm');
    expect(wrapper.find('.cancel-button').text()).toBe('Cancel');
  });

  it('does not show when modelValue is false', async () => {
    const wrapper = mount(ConfirmDialog, {
      props: {
        id: 'test-dialog',
        message: 'Test message',
        modelValue: false,
      },
      attachTo: document.body,
    });

    await wrapper.vm.$nextTick();
    const dialog = wrapper.find('dialog');
    expect(dialog.element.open).toBe(false);
  });

  it('opens when modelValue becomes true', async () => {
    const wrapper = mount(ConfirmDialog, {
      props: {
        id: 'test-dialog',
        message: 'Test message',
        modelValue: false,
      },
      attachTo: document.body,
    });

    await wrapper.vm.$nextTick();
    const dialog = wrapper.find('dialog');
    const showModalSpy = vi.spyOn(dialog.element, 'showModal').mockImplementation(() => {});

    await wrapper.setProps({ modelValue: true });
    await wrapper.vm.$nextTick();

    expect(showModalSpy).toHaveBeenCalled();
  });

  it('emits confirm on confirm button click', async () => {
    const wrapper = mount(ConfirmDialog, {
      props: {
        id: 'test-dialog',
        message: 'Test message',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        modelValue: true,
      },
      attachTo: document.body,
    });

    await wrapper.vm.$nextTick();

    const confirmButton = wrapper.find('.confirm-button');
    await confirmButton.trigger('click');

    expect(wrapper.emitted('confirm')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false]);
  });

  it('emits cancel on cancel button click', async () => {
    const wrapper = mount(ConfirmDialog, {
      props: {
        id: 'test-dialog',
        message: 'Test message',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        modelValue: true,
      },
      attachTo: document.body,
    });

    await wrapper.vm.$nextTick();

    const cancelButton = wrapper.find('.cancel-button');
    await cancelButton.trigger('click');

    expect(wrapper.emitted('cancel')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false]);
  });

  it('emits cancel on backdrop click', async () => {
    const wrapper = mount(ConfirmDialog, {
      props: {
        id: 'test-dialog',
        message: 'Test message',
        modelValue: true,
      },
      attachTo: document.body,
    });

    await wrapper.vm.$nextTick();

    const dialog = wrapper.find('dialog');
    await dialog.trigger('click');

    expect(wrapper.emitted('cancel')).toBeTruthy();
  });

  it('closes when modelValue becomes false', async () => {
    const wrapper = mount(ConfirmDialog, {
      props: {
        id: 'test-dialog',
        message: 'Test message',
        modelValue: false,
      },
      attachTo: document.body,
    });

    await wrapper.vm.$nextTick();
    const dialog = wrapper.find('dialog');
    const closeSpy = vi.spyOn(dialog.element, 'close').mockImplementation(() => {});

    await wrapper.setProps({ modelValue: true });
    await wrapper.setProps({ modelValue: false });
    await wrapper.vm.$nextTick();

    expect(closeSpy).toHaveBeenCalled();
  });
});