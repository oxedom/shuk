"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "app/components/ui/dialog";
import { Button } from "app/components/ui/button";
import { Input } from "app/components/ui/input";
import { ScrollArea } from "app/components/ui/scroll-area";
import { Label } from "app/components/ui/label";
import { RadioGroup, RadioGroupItem } from "app/components/ui/radio-group";
import { toast } from "app/hooks/use-toast";
import type { AssignGymAdminSchemaType } from "@guy-vaserman/shared-my-training-app";

import {
  GymInstance,
  UserInstance,
} from "@guy-vaserman/shared-my-training-app";

interface AssignGymAdminDialogProps {
  isOpen: boolean;
  onClose: () => void;
  gym: GymInstance | null;
  users: UserInstance[];
  onSave: (assignData: AssignGymAdminSchemaType) => Promise<void>;
}

const normalizeText = (text: string = ""): string => {
  if (typeof text !== "string") return "";
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

const fuzzyMatch = (text: string, query: string): boolean => {
  const normalizedText = normalizeText(text);
  const normalizedQuery = normalizeText(query);

  if (!normalizedQuery) return true;
  if (!normalizedText) return false;

  const queryChars = [...normalizedQuery];
  let textIndex = 0;
  for (const char of queryChars) {
    textIndex = normalizedText.indexOf(char, textIndex);
    if (textIndex === -1) return false;
    textIndex += 1;
  }
  return true;
};

export default function AssignGymAdminDialog({
  isOpen,
  onClose,
  gym,
  users,
  onSave,
}: AssignGymAdminDialogProps) {
  const t = useTranslations("Components.GymManager");
  const tCommon = useTranslations("Common");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setSelectedUserId(null);
    }
  }, [isOpen]);

  const filteredUsers = useMemo(() => {
    if (!gym) return [];

    const gymUsers = users.filter(
      (user) => user.gym_id === gym.gym_id && !user.is_gym_admin,
    );

    if (!searchQuery) {
      return gymUsers;
    }

    return gymUsers.filter(
      (user) =>
        fuzzyMatch(user.first_name || "", searchQuery) ||
        fuzzyMatch(user.last_name || "", searchQuery) ||
        fuzzyMatch(user.email || "", searchQuery),
    );
  }, [users, gym, searchQuery]);

  const handleSave = async () => {
    if (!selectedUserId || !gym) {
      toast({
        title: t("assignGymAdminFailed"),
        description: t("userSelectionRequired"),
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      await onSave({
        gym_id: gym.gym_id,
        user_id: selectedUserId,
      });
      onClose();
    } catch (error) {
      // Error handling is done in the parent component
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rounded-md max-w-[350px] md:max-w-[600px] lg:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>
            {t("assignGymAdmin")} - {gym?.english_name}
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Input
            type="search"
            placeholder={tCommon("search") + "..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-4"
            disabled={isLoading}
          />
          <ScrollArea className="h-[300px] md:h-[400px] pr-3">
            <RadioGroup
              value={selectedUserId?.toString() || ""}
              onValueChange={(value) => setSelectedUserId(Number(value))}
            >
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <div
                    key={user.user_id}
                    className="flex items-center space-x-2 py-2 px-1 border-b last:border-b-0 hover:bg-muted/50 rounded-md"
                  >
                    <RadioGroupItem
                      value={user.user_id.toString()}
                      id={`user-${user.user_id}`}
                      disabled={isLoading}
                    />
                    <Label
                      htmlFor={`user-${user.user_id}`}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="font-medium">
                        {user.first_name} {user.last_name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {user.email}
                      </div>
                    </Label>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  {gym ? t("noUsersAvailable") : t("noGymSelected")}
                </p>
              )}
            </RadioGroup>
          </ScrollArea>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {tCommon("cancel")}
          </Button>
          <Button
            onClick={handleSave}
            disabled={selectedUserId === null || isLoading}
          >
            {isLoading ? tCommon("assigning") : t("assignGymAdmin")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
