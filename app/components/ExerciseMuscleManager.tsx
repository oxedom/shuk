"use client";
import type {
  ExerciseMuscleTypeInstance,
  ExerciseInstance as ExerciseType,
} from "@guy-vaserman/shared-my-training-app";
import {
  addExercise,
  assignMusclesToExercise,
  deleteExerciseById,
} from "app/backend/actions";
import AddExerciseDialog from "app/components/dialogs/AddExerciseDialog";
import { Button } from "app/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "app/components/ui/card";
import { Input } from "app/components/ui/input";
import { Label } from "app/components/ui/label";
import { RadioGroup, RadioGroupItem } from "app/components/ui/radio-group";
import { ScrollArea } from "app/components/ui/scroll-area";
import { toast } from "app/hooks/use-toast";
import { X } from "lucide-react";
import { useState } from "react";

import { useRouter } from "next/navigation";
import { AddExerciseParams } from "@guy-vaserman/shared-my-training-app";
import {
  MuscleInvolvementEnum,
  MuscleInstance,
} from "@guy-vaserman/shared-my-training-app";

interface ExerciseMuscleManagerProps {
  exercises: ExerciseType[];
  muscles: MuscleInstance[];
  fetchedExercisesMuscles: ExerciseMuscleTypeInstance[];
}

export default function ExerciseMuscleManager({
  exercises,
  muscles,
  fetchedExercisesMuscles,
}: ExerciseMuscleManagerProps) {
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedExercise, setSelectedExercise] = useState<ExerciseType | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  // Track local changes to muscle assignments
  // null means the muscle should be removed from assignments (was previously assigned but now cleared)
  // undefined means no local changes (use DB value if exists)
  // MuscleType means override or add new assignment
  const [localMuscleAssignments, setLocalMuscleAssignments] = useState<
    Record<number, MuscleInvolvementEnum | null>
  >({});

  const [isAddExerciseDialogOpen, setIsAddExerciseDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const filteredExercises = exercises.filter(
    (exercise) =>
      exercise.english_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (exercise.hebrew_name &&
        exercise.hebrew_name.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const handleDelete = async () => {
    if (!selectedExercise) return;

    setIsDeleting(true);
    const response = await deleteExerciseById(selectedExercise.exercise_id);
    if (response.success) {
      // toast({
      //   title: "Exercise deleted successfully",
      // });
      router.refresh();
    } else {
      toast({
        variant: "destructive",
        title: "Failed to delete exercise",
        description: response.message,
      });
    }
    setSelectedExercise(null);
    setIsDeleting(false);
  };

  const handleExerciseSelect = (exercise: ExerciseType) => {
    setSelectedExercise(exercise);
    setLocalMuscleAssignments({}); // Reset local unsaved assignments when selecting new exercise
  };

  const handleAddExercise = async (exercise: AddExerciseParams) => {
    try {
      const response = await addExercise(exercise);
      if (response.success) {
        // toast({
        //   title: "Exercise added successfully",
        // });
        setIsAddExerciseDialogOpen(false);
        router.refresh();
      } else if (response.success === false) {
        toast({
          variant: "destructive",
          title: "Failed to add exercise",
          description: response.message,
        });
      }
    } catch (error) {
      console.error("Error adding exercise:", error);
      toast({
        variant: "destructive",
        title: "Failed to add exercise",
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  };

  const handleMuscleTypeChange = (
    muscleId: number,
    type: MuscleInvolvementEnum,
  ) => {
    setLocalMuscleAssignments((prev) => ({
      ...prev,
      [muscleId]: type,
    }));
  };

  const handleClearMuscle = (muscleId: number) => {
    setLocalMuscleAssignments((prev) => ({
      ...prev,
      [muscleId]: null,
    }));
  };

  const computeMuscleAssignments = (
    exercise: ExerciseType | null,
    fetchedMusclesAssignments: ExerciseMuscleTypeInstance[],
    localMusclesAssignments: Record<number, MuscleInvolvementEnum | null>,
  ): Record<number, MuscleInvolvementEnum> => {
    if (!exercise) return {};

    const baseMuscleAssignments = fetchedMusclesAssignments
      .filter((em) => em.exercise_id === exercise.exercise_id)
      .reduce(
        (acc, assignment) => ({
          ...acc,
          [assignment.muscle_id]: assignment.type,
        }),
        {},
      );

    // Apply local changes (including deletions)
    Object.entries(localMusclesAssignments).forEach(
      ([muscleId, type]: [string, MuscleInvolvementEnum | null]) => {
        const numericId = Number(muscleId);

        if (type === null) {
          //@ts-ignore
          delete baseMuscleAssignments[numericId];
        } else {
          //@ts-ignore
          baseMuscleAssignments[numericId] = type;
        }
      },
    );

    return baseMuscleAssignments;
  };

  const muscleAssignments = computeMuscleAssignments(
    selectedExercise,
    fetchedExercisesMuscles,
    localMuscleAssignments,
  );

  const validateAssignments = () => {
    const hasAnyMuscles = Object.keys(muscleAssignments).length > 0;
    const hasPrimaryMuscle = Object.values(muscleAssignments).some(
      (type) => type === MuscleInvolvementEnum.PRIMARY,
    );
    if (hasAnyMuscles && !hasPrimaryMuscle) {
      toast({
        title: "Validation Error",
        description: "At least one PRIMARY muscle must be assigned",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!selectedExercise) return;

    if (!validateAssignments()) {
      return;
    }

    try {
      setIsSaving(true);
      const response = await assignMusclesToExercise(
        selectedExercise.exercise_id,
        muscleAssignments,
      );
      if (response.success) {
        // toast({
        //   title: "Muscle assignments updated successfully",
        // });
        router.refresh();
      } else {
        toast({
          title: "Failed to update muscle assignments",
          variant: "destructive",
          description: response.message,
        });
      }
    } catch (error) {
      toast({
        title: "Failed to update muscle assignments",
        variant: "destructive",
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <AddExerciseDialog
        isOpen={isAddExerciseDialogOpen}
        onClose={() => setIsAddExerciseDialogOpen(false)}
        onAddExercise={handleAddExercise}
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Exercises</CardTitle>

            <Input
              placeholder="Search exercises..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mt-2"
            />
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-2">
                {filteredExercises.map((exercise) => (
                  <div
                    key={exercise.exercise_id}
                    className={`p-3 rounded-md cursor-pointer hover:bg-muted transition-colors ${selectedExercise?.exercise_id === exercise.exercise_id ? "bg-muted border-b-2 " : ""}`}
                    onClick={() => handleExerciseSelect(exercise)}
                  >
                    <div className="font-medium">{exercise.english_name}</div>
                    {exercise.hebrew_name && (
                      <div className="text-sm text-muted-foreground">
                        {exercise.hebrew_name}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground mt-1">
                      Type: {exercise.type}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="flex justify-end mt-2 text-muted-foreground">
              <Button
                size="sm"
                onClick={() => setIsAddExerciseDialogOpen(true)}
              >
                Add Exercise
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex justify-between">
              <CardTitle>
                {selectedExercise
                  ? `Manage Muscles: ${selectedExercise.english_name}`
                  : "Select an exercise"}
              </CardTitle>
              <div className="flex justify-end">
                <Button
                  disabled={isDeleting || !selectedExercise}
                  onClick={handleDelete}
                  variant="destructive"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {selectedExercise ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  <ScrollArea className="h-[600px] pr-4">
                    {muscles.map((muscle) => (
                      <div
                        key={muscle.muscle_id}
                        className="flex items-center space-x-4 p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="font-medium">
                            {muscle.english_name}
                          </div>
                          {muscle.hebrew_name && (
                            <div className="text-sm text-muted-foreground">
                              {muscle.hebrew_name}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-4">
                          <RadioGroup
                            value={muscleAssignments[muscle.muscle_id] || ""}
                            onValueChange={(value: string) =>
                              handleMuscleTypeChange(
                                muscle.muscle_id,
                                value as MuscleInvolvementEnum,
                              )
                            }
                            className="flex space-x-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem
                                value={MuscleInvolvementEnum.PRIMARY}
                                id={`primary-${muscle.muscle_id}`}
                              />
                              <Label htmlFor={`primary-${muscle.muscle_id}`}>
                                Primary
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem
                                value={MuscleInvolvementEnum.SECONDARY}
                                id={`secondary-${muscle.muscle_id}`}
                              />
                              <Label htmlFor={`secondary-${muscle.muscle_id}`}>
                                Secondary
                              </Label>
                            </div>
                          </RadioGroup>

                          <Button
                            variant="ghost"
                            disabled={!muscleAssignments[muscle.muscle_id]}
                            size="icon"
                            onClick={() => handleClearMuscle(muscle.muscle_id)}
                            className="h-8 w-8"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </ScrollArea>
                </div>
                <Button
                  disabled={isSaving}
                  onClick={handleSave}
                  className="w-full"
                >
                  {isSaving ? "Saving..." : "Save Muscle Assignments"}
                </Button>
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                Select an exercise to manage its muscle associations
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
