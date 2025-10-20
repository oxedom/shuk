"use client";

import { Button } from "app/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "app/components/ui/dialog";
import { useTranslations } from "next-intl";

interface FinishWorkoutDialogProps {
  title: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading: boolean;
  completed: number;
  total: number;
}
export default function FinishWorkoutDialog({
  title,
  isOpen,
  onOpenChange,
  onConfirm,
  isLoading,
  completed,
  total,
}: FinishWorkoutDialogProps) {
  const t = useTranslations("Components.FinishWorkoutDialog");

  const completedAllExercises = completed === total;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] max-w-md">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl">
            {t("finishWorkout", { title })}
          </DialogTitle>
          <DialogDescription className="text-base">
            {t("finishWorkoutConfirmation")}

            {!completedAllExercises && (
              <span className="block">
                {" "}
                {t("notAllExercisesCompleted", { completed, total })}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("continueWorkout")}
          </Button>
          <Button onClick={onConfirm} disabled={isLoading}>
            {t("confirmFinish")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
