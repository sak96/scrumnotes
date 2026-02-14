export interface TodoItem {
  id: number;
  parentId: number;
  index: number;
  completed: boolean;
  text: string;
  createdAt: Date;
  completedAt?: Date | null;
}

export interface TodoTitle extends TodoItem {
  parentId: 0;
}

export interface TodoChild extends TodoItem {
  parentId: number;
}

export type Todo = TodoTitle | TodoChild;

export interface FilterOptions {
  searchText: string;
}

export const PARENT_ID_TITLE = 0 as const;
export type ParentIdTitle = typeof PARENT_ID_TITLE;