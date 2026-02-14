/// <reference types="vitest" />
import { describe, it, expect } from 'vitest';
import { mount, shallowMount } from '@vue/test-utils';
import ChildrenList from './ChildrenList.vue';
import type { TodoItem } from '../../types';

const DraggableStub = {
  name: 'VueDraggableNext',
  props: ['modelValue', 'itemKey', 'handle'],
  emits: ['update:modelValue', 'end'],
  template: `
    <div>
      <div v-for="element in (modelValue || [])" :key="element.id" class="child-item">
        <span class="drag-handle">::</span>
        <button class="complete-btn" :class="{ completed: element.completed }" @click="$emit('toggle', element.id)">{{ element.completed ? '✅' : '◻️' }}</button>
        <input :value="element.text" class="child-text" />
        <button class="delete-btn" @click="$emit('delete', element.id)">✕</button>
      </div>
    </div>
  `
};

const DraggableIconStub = {
  template: '<span class="drag-handle">::</span>'
};

const CompletedIconStub = {
  name: 'CompletedIcon',
  props: ['completed'],
  emits: ['toggle'],
  template: '<button class="complete-btn" :class="{ completed: completed }" @click="$emit(\'toggle\', 1)">{{ completed ? "✅" : "◻️" }}</button>'
};

const DeleteButtonStub = {
  name: 'DeleteButton',
  emits: ['delete'],
  template: '<button class="delete-btn" @click="$emit(\'delete\', 2)">✕</button>'
};

describe('ChildrenList', () => {
  const createMockChildren = (): TodoItem[] => [
    {
      id: 1,
      parentId: 1,
      index: 0,
      completed: false,
      text: 'Child 1',
      createdAt: new Date(),
      completedAt: null,
    },
    {
      id: 2,
      parentId: 1,
      index: 1,
      completed: true,
      text: 'Child 2',
      createdAt: new Date(),
      completedAt: new Date(),
    },
  ];

  it('should render all children items', () => {
    const children = createMockChildren();
    const wrapper = shallowMount(ChildrenList, {
      props: {
        children,
      },
      global: {
        stubs: {
          draggable: DraggableStub,
          VueDraggableNext: DraggableStub,
          DraggableIcon: DraggableIconStub,
          CompletedIcon: CompletedIconStub,
          DeleteButton: DeleteButtonStub
        }
      }
    });

    const childItems = wrapper.findAll('.child-item');
    expect(childItems.length).toBe(children.length);
  });

  it('should display all children text', () => {
    const children = createMockChildren();
    const wrapper = shallowMount(ChildrenList, {
      props: {
        children,
      },
      global: {
        stubs: {
          draggable: DraggableStub,
          VueDraggableNext: DraggableStub,
          DraggableIcon: DraggableIconStub,
          CompletedIcon: CompletedIconStub,
          DeleteButton: DeleteButtonStub
        }
      }
    });

    const inputs = wrapper.findAll('.child-text');
    expect(inputs.length).toBe(children.length);

    for (let i = 0; i < children.length; i++) {
      expect((inputs[i].element as HTMLInputElement).value).toBe(children[i].text);
    }
  });

  it('should show correct completion status for each child', () => {
    const children = createMockChildren();
    const wrapper = shallowMount(ChildrenList, {
      props: {
        children,
      },
      global: {
        stubs: {
          draggable: DraggableStub,
          VueDraggableNext: DraggableStub,
          DraggableIcon: DraggableIconStub,
          CompletedIcon: CompletedIconStub,
          DeleteButton: DeleteButtonStub
        }
      }
    });

    const completeBtns = wrapper.findAll('.complete-btn');
    expect(completeBtns.length).toBe(children.length);

    expect(completeBtns[0].text()).toBe('◻️');
    expect(completeBtns[1].text()).toBe('✅');
  });

  it('should emit toggle event when complete button is clicked', async () => {
    const children = createMockChildren();
    const wrapper = shallowMount(ChildrenList, {
      props: {
        children,
      },
      global: {
        stubs: {
          draggable: DraggableStub,
          VueDraggableNext: DraggableStub,
          DraggableIcon: DraggableIconStub,
          CompletedIcon: CompletedIconStub,
          DeleteButton: DeleteButtonStub
        }
      }
    });

    wrapper.vm.toggleComplete(1);
    expect(wrapper.emitted('toggle')).toBeTruthy();
  });

  it('should emit delete event when text is empty and blurred', async () => {
    const children = createMockChildren();
    const wrapper = shallowMount(ChildrenList, {
      props: {
        children,
      },
      global: {
        stubs: {
          draggable: DraggableStub,
          VueDraggableNext: DraggableStub,
          DraggableIcon: DraggableIconStub,
          CompletedIcon: CompletedIconStub,
          DeleteButton: DeleteButtonStub
        }
      }
    });

    wrapper.vm.handleTextChange({ id: 1, text: '' });
    expect(wrapper.emitted('delete')).toBeTruthy();
  });
});