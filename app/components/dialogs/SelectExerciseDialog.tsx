"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "app/components/ui/dialog";
import { Button } from "app/components/ui/button";
import { Input } from "app/components/ui/input";
import { ScrollArea } from "app/components/ui/scroll-area";
import { Label } from "app/components/ui/label";
import { RadioGroup, RadioGroupItem } from "app/components/ui/radio-group";
import type { ExerciseInstance } from "@guy-vaserman/shared-my-training-app"; // Adjust path if necessary

interface SelectExerciseDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  exercises: ExerciseInstance[];
  onConfirm: (selectedExerciseId: number) => void;
  title?: string;
  initialSelectedExerciseId?: number | null;
}

// Helper functions for fuzzy search (adapted from ExerciseCardViewer.tsx)
const normalizeText = (text: string = ""): string => {
  if (typeof text !== "string") return "";
  return text
    .toLowerCase()
    .normalize("NFD") // Normalize diacritics (e.g., accented characters)
    .replace(/[\u0300-\u036f]/g, ""); // Remove diacritic marks
};

const fuzzyMatch = (text: string, query: string): boolean => {
  const normalizedText = normalizeText(text);
  const normalizedQuery = normalizeText(query);

  if (!normalizedQuery) return true; // If query is empty, show all
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

export default function SelectExerciseDialog({
  isOpen,
  onOpenChange,
  exercises,
  onConfirm,
  title,
  initialSelectedExerciseId = null,
}: SelectExerciseDialogProps) {
  const t = useTranslations("Dialogs.SelectExercise"); // For general dialog text
  const tCommon = useTranslations("Common"); // For shared terms like 'Search'

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExerciseId, setSelectedExerciseId] = useState<number | null>(
    initialSelectedExerciseId,
  );

  useEffect(() => {
    setSelectedExerciseId(initialSelectedExerciseId);
  }, [initialSelectedExerciseId, isOpen]);

  useEffect(() => {
    // Reset search query when dialog opens/closes if needed, or based on isOpen
    if (!isOpen) {
      setSearchQuery("");
    }
  }, [isOpen]);

  const filteredExercises = useMemo(() => {
    if (!searchQuery) {
      return exercises;
    }
    return exercises.filter(
      (exercise) =>
        fuzzyMatch(exercise.english_name, searchQuery) ||
        fuzzyMatch(exercise.hebrew_name || "", searchQuery),
    );
  }, [exercises, searchQuery]);

  const handleConfirm = () => {
    if (selectedExerciseId !== null) {
      onConfirm(selectedExerciseId);
      onOpenChange(false); // Close dialog on confirm
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-md max-w-[350px] md:max-w-[600px] lg:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>{title || t("title")}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Input
            type="search"
            placeholder={tCommon("search") + "..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-4"
          />
          <ScrollArea className="h-[300px] md:h-[400px] pr-3">
            <RadioGroup
              value={selectedExerciseId?.toString() || ""}
              onValueChange={(value) => setSelectedExerciseId(Number(value))}
            >
              {filteredExercises.length > 0 ? (
                filteredExercises.map((exercise) => (
                  <div
                    key={exercise.exercise_id}
                    className="flex items-center space-x-2 py-2 px-1 border-b last:border-b-0 hover:bg-muted/50 rounded-md"
                  >
                    <RadioGroupItem
                      value={exercise.exercise_id.toString()}
                      id={`ex-${exercise.exercise_id}`}
                    />
                    <Label
                      htmlFor={`ex-${exercise.exercise_id}`}
                      className="flex-1 cursor-pointer"
                    >
                      <div>{exercise.english_name}</div>
                      {exercise.hebrew_name && (
                        <div className="text-sm text-muted-foreground">
                          {exercise.hebrew_name}
                        </div>
                      )}
                    </Label>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  {t("noResults")}
                </p>
              )}
            </RadioGroup>
          </ScrollArea>
        </div>
        <DialogFooter>
          <div className="flex flex-col gap-2">
            <Button
              onClick={handleConfirm}
              disabled={selectedExerciseId === null}
            >
              {tCommon("confirm")}
            </Button>
            <DialogClose asChild>
              <Button variant="outline">{tCommon("cancel")}</Button>
            </DialogClose>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
