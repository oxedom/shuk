import { UserInstance } from "@guy-vaserman/shared-my-training-app";
export interface ColumnHandlers {
  onEditUser: (user: UserInstance) => void;
  onDeleteUser: (user: UserInstance) => void;
  onAddUser: () => void;
}
