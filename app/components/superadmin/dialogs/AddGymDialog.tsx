"use client";

import { useState } from "react";
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
import type { AddGymSchemaType } from "@guy-vaserman/shared-my-training-app";

interface AddGymDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (gymData: AddGymSchemaType) => Promise<void>;
}

export default function AddGymDialog({
  isOpen,
  onClose,
  onSave,
}: AddGymDialogProps) {
  const t = useTranslations("Components.GymManager");
  const tCommon = useTranslations("Common");

  const [formData, setFormData] = useState<AddGymSchemaType>({
    english_name: "",
    hebrew_name: "",
    primary_color: "#000000",
    primary_color_foreground: "#ffffff",
    is_active: true,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (
    field: keyof AddGymSchemaType,
    value: string | boolean,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.english_name.trim()) {
      toast({
        title: t("gymCreationFailed"),
        description: t("englishNameRequired"),
        variant: "destructive",
      });
      return;
    }

    if (!formData.hebrew_name.trim()) {
      toast({
        title: t("gymCreationFailed"),
        description: t("hebrewNameRequired"),
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      await onSave(formData);
      setFormData({
        english_name: "",
        hebrew_name: "",
        primary_color: "#000000",
        primary_color_foreground: "#ffffff",
        is_active: true,
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
          <DialogTitle>{t("addGym")}</DialogTitle>
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
            {isLoading ? tCommon("creating") : t("addGym")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
