"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DataTable } from "./data-table";
import { getColumns } from "./columns";
import { useConfirmDialog } from "app/components/dialogs/ConfirmDialog";
import { toast } from "app/hooks/use-toast";
import { getErrorMessage } from "app/libs/utils";

import AddGymDialog from "./dialogs/AddGymDialog";
import EditGymDialog from "./dialogs/EditGymDialog";
import AssignGymAdminDialog from "./dialogs/AssignGymAdminDialog";
import AddUserDialog from "app/components/dialogs/AddUserDialog";
import {
  addGymAction,
  assignGymAdminAction,
  updateGymAction,
  superAdminAddUserToGymAction,
} from "app/backend/actions";
import type {
  AddGymSchemaType,
  AssignGymAdminSchemaType,
  GymRowData,
  UpdateGymSchemaType,
  AddUserToGymSchemaType,
  UserInstance,
} from "@guy-vaserman/shared-my-training-app";

interface GymManagerProps {
  gyms: GymRowData[];
  users: UserInstance[];
}

export interface GymHandlers {
  onEditGym: (gym: GymRowData) => void;
  onAssignGymAdmin: (gym: GymRowData) => void;
  onDeleteGym: (gym: GymRowData) => void;
  onAddGym: () => void;
  onAddUser: () => void;
}

export default function GymManager({ gyms, users = [] }: GymManagerProps) {
  const t = useTranslations("Components.GymManager");
  const tDeleteConfirm = useTranslations("Components.GymManager.deleteConfirm");
  const tCommon = useTranslations("Common");

  const { confirm: confirmGymDelete, ConfirmDialog: ConfirmDialogGymDelete } =
    useConfirmDialog();
  const router = useRouter();

  const [editGymDialogOpen, setEditGymDialogOpen] = useState(false);
  const [selectedGym, setSelectedGym] = useState<GymRowData | null>(null);
  const [addGymDialogOpen, setAddGymDialogOpen] = useState(false);
  const [assignGymAdminDialogOpen, setAssignGymAdminDialogOpen] =
    useState(false);
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);

  const handlers: GymHandlers = {
    onEditGym: (gym: GymRowData) => {
      setSelectedGym(gym);
      setEditGymDialogOpen(true);
    },

    onAssignGymAdmin: (gym: GymRowData) => {
      setSelectedGym(gym);
      setAssignGymAdminDialogOpen(true);
    },

    onDeleteGym: async (gym: GymRowData) => {
      await confirmGymDelete({
        title: tDeleteConfirm("title"),
        message: tDeleteConfirm("description", {
          gymName: gym.english_name,
        }),
        confirmLabel: tCommon("confirm"),
        cancelLabel: tCommon("cancel"),
        onConfirm: async () => {
          try {
            // TODO: Implement delete gym action
            toast({
              variant: "default",
              title: t("gymDeleted"),
            });
            router.refresh();
          } catch (error) {
            toast({
              variant: "destructive",
              title: getErrorMessage(error),
            });
          }
        },
      });
    },

    onAddGym: () => {
      setAddGymDialogOpen(true);
    },

    onAddUser: () => {
      setAddUserDialogOpen(true);
    },
  };

  const handleAddGym = async (gymData: AddGymSchemaType) => {
    try {
      const result = await addGymAction(gymData);
      if (result.success) {
        toast({
          variant: "default",
          title: t("gymAdded"),
        });
        router.refresh();
      } else {
        toast({
          variant: "destructive",
          title: result.message,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: getErrorMessage(error),
      });
    }
  };

  const handleUpdateGym = async (gymData: UpdateGymSchemaType) => {
    try {
      const result = await updateGymAction(gymData);
      if (result.success) {
        toast({
          variant: "default",
          title: t("gymUpdated"),
        });

        const superAdmin = users.find((user) => user.is_super_admin);
        if (superAdmin) window.location.reload();
        else router.refresh();
      } else {
        toast({
          variant: "destructive",
          title: result.message,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: getErrorMessage(error),
      });
    }
  };

  const handleAssignGymAdmin = async (assignData: AssignGymAdminSchemaType) => {
    try {
      const result = await assignGymAdminAction(assignData);
      if (result.success) {
        toast({
          variant: "default",
          title: t("gymAdminAssigned"),
        });
        router.refresh();
      } else {
        toast({
          variant: "destructive",
          title: result.message,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: getErrorMessage(error),
      });
    }
  };

  const handleAddUser = async (userData: AddUserToGymSchemaType) => {
    try {
      const result = await superAdminAddUserToGymAction(userData);
      if (result.success) {
        toast({
          variant: "default",
          title: t("userAdded"),
        });
        router.refresh();
        setAddUserDialogOpen(false);
      } else {
        toast({
          variant: "destructive",
          title: result.message,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: getErrorMessage(error),
      });
    }
  };

  // Ensure gyms is an array
  const gymList = Array.isArray(gyms) ? gyms : [];

  return (
    <div className="text-white space-y-4 max-w-6xl mx-auto p-6">
      <h2 className="text-4xl font-bold mb-8 text-center">{t("title")}</h2>

      <div className="bg-background rounded-lg border border-border p-4">
        <DataTable getColumns={getColumns} data={gymList} handlers={handlers} />
      </div>

      <ConfirmDialogGymDelete />

      <AddGymDialog
        isOpen={addGymDialogOpen}
        onClose={() => setAddGymDialogOpen(false)}
        onSave={handleAddGym}
      />

      {selectedGym && (
        <EditGymDialog
          isOpen={editGymDialogOpen}
          onClose={() => {
            setEditGymDialogOpen(false);
            setSelectedGym(null);
          }}
          gym={selectedGym}
          onSave={handleUpdateGym}
        />
      )}

      {selectedGym && (
        <AssignGymAdminDialog
          isOpen={assignGymAdminDialogOpen}
          onClose={() => {
            setAssignGymAdminDialogOpen(false);
            setSelectedGym(null);
          }}
          gym={selectedGym}
          users={users}
          onSave={handleAssignGymAdmin}
        />
      )}

      <AddUserDialog
        isOpen={addUserDialogOpen}
        onOpenChange={setAddUserDialogOpen}
        gyms={gyms}
        onSave={handleAddUser}
      />
    </div>
  );
}
