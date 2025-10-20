"use client";

import { useTranslations } from "next-intl";
import { Button } from "app/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "app/components/ui/dialog";
import { useState, useCallback } from "react";

export interface ConfirmDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onCancel?: () => void;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

export default function ConfirmDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  onCancel,
  title = "Confirm",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
}: ConfirmDialogProps) {
  const t = useTranslations("Common");
  const tCommon = useTranslations("Common");

  const handleConfirm = useCallback(() => {
    onConfirm();
    onOpenChange(false);
  }, [onConfirm, onOpenChange]);

  const handleCancel = useCallback(() => {
    if (onCancel) onCancel();
    onOpenChange(false);
  }, [onCancel, onOpenChange]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[350px] rounded-lg sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <DialogDescription>{message}</DialogDescription>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleCancel}>
            {cancelLabel}
          </Button>
          <Button onClick={handleConfirm}>{confirmLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Hook to manage the confirm dialog state
export function useConfirmDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [dialogConfig, setDialogConfig] = useState<
    Omit<ConfirmDialogProps, "isOpen" | "onOpenChange">
  >({
    onConfirm: () => {},
    message: "",
  });

  const confirm = useCallback(
    (props: Omit<ConfirmDialogProps, "isOpen" | "onOpenChange">) => {
      return new Promise<boolean>((resolve) => {
        setDialogConfig({
          ...props,
          onConfirm: () => {
            props.onConfirm?.();
            resolve(true);
          },
          onCancel: () => {
            props.onCancel?.();
            resolve(false);
          },
        });
        setIsOpen(true);
      });
    },
    [],
  );

  const ConfirmDialogComponent = useCallback(
    () => (
      <ConfirmDialog
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        {...dialogConfig}
      />
    ),
    [isOpen, dialogConfig],
  );

  return { confirm, ConfirmDialog: ConfirmDialogComponent };
}
