"use client";

import { useState, useEffect } from "react";
import { Button } from "app/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "app/components/ui/dialog";
import { Input } from "app/components/ui/input";
import { Label } from "app/components/ui/label";
import { useTranslations } from "next-intl";
import { toast } from "app/hooks/use-toast";
import type {
  GymRowData,
  UpdateGymSchemaType,
} from "@guy-vaserman/shared-my-training-app";

interface EditGymDialogProps {
  isOpen: boolean;
  onClose: () => void;
  gym: GymRowData | null;
  onSave: (gymData: UpdateGymSchemaType) => Promise<void>;
}

export default function EditGymDialog({
  isOpen,
  onClose,
  gym,
  onSave,
}: EditGymDialogProps) {
  const t = useTranslations("Components.GymManager");
  const tCommon = useTranslations("Common");

  const [formData, setFormData] = useState({
    english_name: "",
    hebrew_name: "",
    primary_color: "#000000",
    primary_color_foreground: "#ffffff",
    is_active: true,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (gym) {
      setFormData({
        english_name: gym.english_name || "",
        hebrew_name: gym.hebrew_name || "",
        primary_color: gym.primary_color || "#000000",
        primary_color_foreground: gym.primary_color_foreground || "#ffffff",
        is_active: gym.is_active !== undefined ? gym.is_active : true,
      });
    }
  }, [gym]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.english_name.trim()) {
      toast({
        title: t("gymUpdateFailed"),
        description: t("englishNameRequired"),
        variant: "destructive",
      });
      return;
    }

    if (!formData.hebrew_name.trim()) {
      toast({
        title: t("gymUpdateFailed"),
        description: t("hebrewNameRequired"),
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      if (!gym) return;

      await onSave({
        gym_id: gym.gym_id,
        ...formData,
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("editGym")}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          <div className="space-y-4">
            <div>
              <Label htmlFor="english_name">{t("englishName")}</Label>
              <Input
                id="english_name"
                value={formData.english_name}
                onChange={(e) =>
                  handleInputChange("english_name", e.target.value)
                }
                disabled={isLoading}
                required
              />
            </div>

            <div>
              <Label htmlFor="hebrew_name">{t("hebrewName")}</Label>
              <Input
                id="hebrew_name"
                value={formData.hebrew_name}
                onChange={(e) =>
                  handleInputChange("hebrew_name", e.target.value)
                }
                disabled={isLoading}
                required
              />
            </div>

            <div>
              <Label htmlFor="primary_color">{t("primaryColor")}</Label>
              <Input
                id="primary_color"
                type="color"
                className="h-16"
                value={formData.primary_color}
                onChange={(e) =>
                  handleInputChange("primary_color", e.target.value)
                }
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="primary_color_foreground">
                {t("foregroundColor")}
              </Label>
              <Input
                id="primary_color_foreground"
                className="h-16"
                type="color"
                value={formData.primary_color_foreground}
                onChange={(e) =>
                  handleInputChange("primary_color_foreground", e.target.value)
                }
                disabled={isLoading}
              />
            </div>
          </div>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {tCommon("cancel")}
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? tCommon("saving") : tCommon("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
