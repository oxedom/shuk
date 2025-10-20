"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useLocaleInfo } from "app/hooks/use-locale-info";
import { useTranslations } from "next-intl";
import { toast } from "app/hooks/use-toast";

interface AddExerciseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddExercise: (exercise: AddExerciseFormData) => Promise<void>;
}

interface AddExerciseFormData {
  english_name: string;
  hebrew_name: string;
  type: ExerciseCategory;
}

type ExerciseCategory = "TIME_WEIGHT" | "WEIGHT" | "TIME";

export default function AddExerciseDialog({
  isOpen,
  onClose,
  onAddExercise,
}: AddExerciseDialogProps) {
  const t = useTranslations("Components.AddExerciseDialog");

  const tCommon = useTranslations("Common");
  const { dir } = useLocaleInfo();
  const [formData, setFormData] = useState<AddExerciseFormData>({
    english_name: "",
    hebrew_name: "",
    type: "WEIGHT",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (value: string) => {
    setFormData((prev) => ({ ...prev, type: value as ExerciseCategory }));
  };

  const handleAddExercise = async () => {
    if (!formData.english_name.trim()) {
      toast({
        title: t("exerciseCreationFailed"),
        description: t("englishNameRequired"),
        variant: "destructive",
      });
      return;
    }

    if (!formData.hebrew_name.trim()) {
      toast({
        title: t("exerciseCreationFailed"),
        description: t("hebrewNameRequired"),
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      await onAddExercise(formData);
      setFormData({ english_name: "", hebrew_name: "", type: "WEIGHT" });
      onClose();
    } catch (error) {
      // Error handling is done in the parent component
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose} modal={false}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
        </DialogHeader>
        <form>
          <div className="space-y-4">
            <div>
              <Label htmlFor="english_name">{tCommon("englishName")}</Label>
              <Input
                id="english_name"
                value={formData.english_name}
                onChange={(e) =>
                  setFormData({ ...formData, english_name: e.target.value })
                }
                disabled={isLoading}
                required
              />
            </div>
            <div>
              <Label htmlFor="hebrew_name">{tCommon("hebrewName")}</Label>
              <Input
                id="hebrew_name"
                value={formData.hebrew_name}
                onChange={(e) =>
                  setFormData({ ...formData, hebrew_name: e.target.value })
                }
                disabled={isLoading}
                required
              />
            </div>
            <div>
              <Label htmlFor="type">{tCommon("type")}</Label>
              <Select
                dir={dir}
                value={formData.type}
                onValueChange={handleChange}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WEIGHT">{t("typeWeight")}</SelectItem>
                  <SelectItem value="TIME_WEIGHT">
                    {t("typeTimeWeight")}
                  </SelectItem>
                  <SelectItem value="TIME">{t("typeTime")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {tCommon("cancel")}
          </Button>
          <Button onClick={handleAddExercise} disabled={isLoading}>
            {isLoading ? tCommon("creating") : tCommon("addExercise")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
