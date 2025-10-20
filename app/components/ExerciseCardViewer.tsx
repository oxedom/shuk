"use client";
import type { ExerciseInstance } from "@guy-vaserman/shared-my-training-app";
import type { MuscleInstance } from "@guy-vaserman/shared-my-training-app";
import { Button } from "app/components/ui/button";
import { Card, CardContent, CardHeader } from "app/components/ui/card";
import { Input } from "app/components/ui/input";
import { ScrollArea } from "app/components/ui/scroll-area";

import { MultiSelect } from "app/components/ui/multi-select";
import type { MultiSelectOption } from "app/components/ui/multi-select";
import { useLocaleInfo } from "app/hooks/use-locale-info";
import { cn } from "app/libs/utils";
import { Plus, Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import {
  MuscleInvolvementEnum,
  ExerciseWithMuscles,
} from "@guy-vaserman/shared-my-training-app";

interface ExerciseCardViewerProps {
  activeWorkoutId: string;
  onAddExercise: (workoutId: string, exercise: ExerciseWithMuscles) => void;
  exercises: ExerciseWithMuscles[];
  muscles: MuscleInstance[];
  gridClass?: string;
  addedExercises: ExerciseWithMuscles[];
}

export default function ExerciseCardViewer({
  activeWorkoutId,
  onAddExercise,
  gridClass,
  exercises,
  muscles,
  addedExercises,
}: ExerciseCardViewerProps) {
  const [filteredExercises, setFilteredExercises] = useState<
    ExerciseWithMuscles[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMuscleIds, setSelectedMuscleIds] = useState<string[]>([]);
  const t = useTranslations("Components.ExerciseCardViewer");

  const { dir, isHebrew } = useLocaleInfo();

  // Create muscle options for MultiSelect
  const muscleOptions: MultiSelectOption[] = muscles.map((muscle) => ({
    value: muscle.muscle_id.toString(),
    label: isHebrew ? muscle.hebrew_name : muscle.english_name,
  }));

  const normalizeText = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/-/g, " ") // Replace hyphens with spaces
      .replace(/\s+/g, " ") // Normalize multiple spaces
      .trim();
  };

  const fuzzyMatch = (text: string, query: string): boolean => {
    text = normalizeText(text);
    query = normalizeText(query);

    // Split query into characters for fuzzy matching
    const queryChars = [...query];
    let textIndex = 0;

    // Check if all query characters appear in sequence in the text
    for (const char of queryChars) {
      textIndex = text.indexOf(char, textIndex);
      if (textIndex === -1) return false;
      textIndex += 1;
    }
    return true;
  };

  useEffect(() => {
    let availableExercises = exercises.filter(
      (exercise) =>
        !addedExercises.some(
          (added) => added.exercise_id === exercise.exercise_id,
        ),
    );

    // Filter by muscles if any selected (empty array means show all)
    if (selectedMuscleIds.length > 0) {
      const selectedMuscleNumbers = selectedMuscleIds.map((id) => Number(id));
      availableExercises = availableExercises.filter((exercise) => {
        if (!exercise.muscles || exercise.muscles.length === 0) return false;
        return selectedMuscleNumbers.every((muscleId) =>
          exercise.muscles!.some((muscle) => muscle.muscle_id === muscleId),
        );
      });
    }

    // Apply search filter
    if (searchQuery.trim() === "") {
      setFilteredExercises(availableExercises);
    } else {
      const filtered = availableExercises.filter((exercise) => {
        const matchEnglish = fuzzyMatch(exercise.english_name, searchQuery);
        const matchHebrew =
          isHebrew &&
          exercise.hebrew_name &&
          fuzzyMatch(exercise.hebrew_name, searchQuery);
        return matchEnglish || matchHebrew;
      });
      setFilteredExercises(filtered);
    }
  }, [searchQuery, exercises, addedExercises, selectedMuscleIds, isHebrew]);
  const handleAddExercise = (exercise: ExerciseWithMuscles) => {
    onAddExercise(activeWorkoutId, exercise);
  };

  const handleMuscleFilterChange = (values: string[]) => {
    setSelectedMuscleIds(values);
  };

  const isFilterActive = !!searchQuery || selectedMuscleIds.length > 0;

  const clearAllFilters = () => {
    setSelectedMuscleIds([]);
    setSearchQuery("");
  };

  const clearSearch = () => {
    setSearchQuery("");
  };
  return (
    <Card
      dir={dir}
      className={`w-full border-secondary-foreground/30 ${gridClass ? gridClass : ""}`}
    >
      <CardHeader>
        <div className="space-y-2">
          <div className="relative flex items-center">
            <Search
              className={cn(
                "ml-2 absolute start-2 h-4 w-4 text-muted-foreground",
              )}
            />
            <Input
              dir={dir}
              placeholder={t("searchExercises")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn("pl-8 pr-8 border-secondary-foreground/30 border")}
            />
            {searchQuery && searchQuery.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className={cn(
                  "absolute end-1 h-6 w-6 p-0 text-muted-foreground hover:text-foreground",
                )}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Muscle filter using MultiSelect */}
          {muscles.length > 0 && (
            <div className="space-y-2">
              <MultiSelect
                options={muscleOptions}
                onValueChange={handleMuscleFilterChange}
                defaultValue={selectedMuscleIds}
                placeholder={t("filterByMuscle")}
                variant="secondary"
                maxCount={3}
                responsive={true}
                searchable={true}
                className="border-secondary-foreground/30"
                animationConfig={{
                  duration: 0.2,
                }}
              />

              {/* Clear filters button */}
              {isFilterActive && (
                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3 mr-1" />
                    {t("clearAllFilters")}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[440px] pr-4 ">
          <div dir={dir} className="space-y-2">
            {filteredExercises.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                {t("noExercisesFound")}
                {searchQuery}
              </div>
            ) : (
              filteredExercises.map((exercise) => (
                <div
                  key={exercise.exercise_id}
                  className={`flex items-center justify-between p-2 border rounded-xl border-secondary-foreground/20 hover:bg-foreground/10 transition-colors px-4`}
                >
                  {" "}
                  <div dir={dir} className="flex-1">
                    <div className="font-medium">
                      {isHebrew ? exercise.hebrew_name : exercise.english_name}
                    </div>
                    {selectedMuscleIds.length > 0 &&
                      exercise.muscles &&
                      exercise.muscles.length > 0 && (
                        <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                          <div dir={dir} className="flex flex-wrap gap-1">
                            {exercise.muscles
                              .filter(
                                (muscle) =>
                                  muscle.exercise_muscles_type.type ===
                                  MuscleInvolvementEnum.PRIMARY,
                              )
                              .map((muscle) => (
                                <span
                                  key={muscle.muscle_id}
                                  className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-xs font-medium"
                                >
                                  {isHebrew
                                    ? muscle.hebrew_name
                                    : muscle.english_name}
                                </span>
                              ))}
                            {exercise.muscles
                              .filter(
                                (muscle) =>
                                  muscle.exercise_muscles_type.type ===
                                  MuscleInvolvementEnum.SECONDARY,
                              )
                              .map((muscle) => (
                                <span
                                  key={muscle.muscle_id}
                                  className="bg-muted text-muted-foreground px-1.5 py-0.5 rounded text-xs"
                                >
                                  {isHebrew
                                    ? muscle.hebrew_name
                                    : muscle.english_name}
                                </span>
                              ))}
                          </div>
                        </div>
                      )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleAddExercise(exercise)}
                  >
                    <Plus size={20} />
                  </Button>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
