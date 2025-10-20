"use client";
import { createUser, softDeleteUser, updateUser } from "app/backend/actions";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import {
  softDeleteUserSchema,
  addUserToGymSchema,
  AddUserToGymSchemaType,
  unwrapApiResponse,
  updateUserSchema,
} from "@guy-vaserman/shared-my-training-app";
import type {
  ApiResponse,
  UserInstance,
  UpdateUserSchemaType,
} from "@guy-vaserman/shared-my-training-app";
import { use, useState } from "react";
import { DataTable } from "./data-table";
import { getColumns } from "./columns";
import { useConfirmDialog } from "app/components/dialogs/ConfirmDialog";
import EditUserDialog from "app/components/dialogs/UpdateUserDialog";
import AddUserDialog from "app/components/dialogs/AddUserDialog";
import { toast } from "app/hooks/use-toast";
import { getErrorMessage } from "app/libs/utils";
import GymSignupLink from "./GymSignupLink";
import { Session } from "next-auth";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "app/components/ui/tabs";
import { useLocaleInfo } from "app/hooks/use-locale-info";

interface ResolvedPropsData {
  usersData: ApiResponse<UserInstance[] | null>;
  currentUser: ApiResponse<Session["user"] | null>;
}

interface PromisedPropsData {
  data: Promise<
    [ResolvedPropsData["usersData"], ResolvedPropsData["currentUser"]]
  >;
}

export default function GymAdminManager({ data }: PromisedPropsData) {
  const t = useTranslations("Components.GymAdminManager");
  const tDeleteConfirm = useTranslations(
    "Components.GymAdminManager.deleteConfirm",
  );

  const tCommon = useTranslations("Common");
  const { ConfirmDialog: ConfirmDialogUserStatus } = useConfirmDialog();
  const { confirm: confirmUserDelete, ConfirmDialog: ConfirmDialogUserDelete } =
    useConfirmDialog();
  const router = useRouter();
  const [editUserDialogOpen, setEditUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserInstance | null>(null);
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);

  const handleUpdateUserSave = async (data: UpdateUserSchemaType) => {
    try {
      updateUserSchema.parse(data);
      const response = await updateUser({ ...data });
      if (response.success) {
        router.refresh();
        toast({
          variant: "default",
          title: t("userUpdated"),
        });
        return { success: true, message: t("userUpdated") };
      } else {
        toast({
          variant: "destructive",
          title: response.message,
        });
        return { success: false, message: response.message };
      }
    } catch (e) {
      const errorMessage = getErrorMessage(e);
      toast({
        variant: "destructive",
        title: errorMessage,
      });
      return { success: false, message: errorMessage };
    }
  };

  const handleAddUser = async (data: AddUserToGymSchemaType) => {
    try {
      addUserToGymSchema.parse(data);

      const response = await createUser(data);
      if (response.success) {
        router.refresh();
        setAddUserDialogOpen(false);
        toast({
          variant: "default",
          title: t("userCreated"),
        });
      } else {
        toast({
          variant: "destructive",
          title: response.message,
        });
      }
    } catch (e) {
      toast({
        variant: "destructive",
        title: getErrorMessage(e),
      });
    }
  };

  const handlers = {
    onEditUser: (user: UserInstance) => {
      setSelectedUser(user);
      setEditUserDialogOpen(true);
    },
    onDeleteUser: async (user: UserInstance) => {
      await confirmUserDelete({
        title: tDeleteConfirm("title"),
        message: tDeleteConfirm("description", {
          userName: user.first_name + " " + user.last_name,
        }),
        confirmLabel: tCommon("confirm"),
        cancelLabel: tCommon("cancel"),
        onConfirm: async () => {
          try {
            softDeleteUserSchema.parse(user.user_id);
            const response = await softDeleteUser(user.user_id);
            if (response.success) {
              router.refresh();
              toast({
                variant: "default",
                title: t("userDeleted"),
              });
            } else {
              toast({
                variant: "destructive",
                title: response.message,
              });
            }
          } catch (error) {
            toast({
              variant: "default",
              title: getErrorMessage(error),
            });
          }
        },
      });

      //Open a dialog with the confrim button to make sure
    },

    onAddUser: () => {
      setAddUserDialogOpen(true);
    },
  };

  const [usersDataResponse, currentUserResponse] = use(data);
  const usersData = unwrapApiResponse(usersDataResponse);
  const currentUser = unwrapApiResponse(currentUserResponse);
  const { dir } = useLocaleInfo();

  if (!currentUser) return null;

  // Ensure usersData is an array
  const users = Array.isArray(usersData) ? usersData : [];

  return (
    <div className="text-white space-y-4 max-w-6xl mx-auto p-6">
      <h2 className="text-4xl font-bold mb-8 text-center">{t("title")}</h2>
      <Tabs dir={dir} defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">{t("users")}</TabsTrigger>
          <TabsTrigger value="signupLinks">{t("signupLinks")}</TabsTrigger>
        </TabsList>
        <TabsContent value="users">
          <div className="bg-card rounded-lg border border-border p-4">
            <DataTable
              getColumns={getColumns}
              data={users}
              handlers={handlers}
            />
          </div>
        </TabsContent>
        <TabsContent value="signupLinks">
          <div className="bg-card rounded-lg border border-border p-4">
            <GymSignupLink gymId={currentUser.gym_id} />
          </div>
        </TabsContent>
      </Tabs>

      <ConfirmDialogUserStatus />
      <ConfirmDialogUserDelete />
      <AddUserDialog
        isOpen={addUserDialogOpen}
        onOpenChange={setAddUserDialogOpen}
        onSave={handleAddUser}
      />
      {selectedUser && (
        <EditUserDialog
          isOpen={editUserDialogOpen}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedUser(null);
            }
            setEditUserDialogOpen(open);
          }}
          user={selectedUser}
          onSave={handleUpdateUserSave}
          onSuccess={() => {
            setEditUserDialogOpen(false);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
}
