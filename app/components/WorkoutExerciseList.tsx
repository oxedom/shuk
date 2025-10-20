"use client";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  DndContext,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowDown,
  ArrowUp,
  GripVertical,
  MessageCircle,
  Trash2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { REPETITIONS, WEIGHT_SCORE } from "app/shared";
import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ScrollArea } from "./ui/scroll-area";
import { Textarea } from "./ui/textarea";
import { useConfirmDialog } from "./dialogs/ConfirmDialog";
import { useLocaleInfo } from "app/hooks/use-locale-info";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Toggle } from "./ui/toggle";
import { Cog } from "lucide-react";
import {
  ExerciseInstance,
  WorkoutExercise,
} from "packages/shared-my-training-app/src";

interface WorkoutExerciseListProps {
  workoutId: string;
  exercises: WorkoutExercise[];
  gridClass?: string;

  onRemoveExercise: (workoutId: string, exerciseId: number) => void;
  onReorderExercise: (
    workoutId: string,
    exerciseId: number,
    newPosition: number,
  ) => void;
  onUpdateExercise: (
    workoutId: string,
    exerciseId: number,
    property: keyof any,
    value: number | string | "rpe" | "rir" | boolean,
  ) => void;
}

function SortableExerciseItem({
  exercise,
  index,
}: {
  exercise: ExerciseInstance;
  index: number;
  gridClass?: string;
  workoutId: string;
  showCommentMap: Record<number, boolean>;
  setShowCommentMap: React.Dispatch<
    React.SetStateAction<Record<number, boolean>>
  >;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: exercise.exercise_id });
  const { isHebrew, dir } = useLocaleInfo();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between p-3 rounded-md border hover:bg-accent/50 transition-colors ${isDragging ? "opacity-50" : ""}`}
    >
      <div
        className="font-medium flex items-center gap-2 w-full"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-3 w-3 cursor-grab active:cursor-grabbing" />
        <div dir={dir} className="text-sm text-muted-foreground flex gap-2">
          <p>{isHebrew ? exercise.hebrew_name : exercise.english_name}. </p>
          <p>{index + 1}</p>
        </div>
      </div>
    </div>
  );
}

// Tracking options for radio buttons
const trackingOptions = [
  { value: "none", translationKey: "trackNone" },
  { value: "rpe", translationKey: "trackRpeScore" },
  { value: "rir", translationKey: "trackRirScore" },
] as const;

export default function WorkoutExerciseList({
  workoutId,
  exercises,
  gridClass,
  onRemoveExercise,
  onReorderExercise,
  onUpdateExercise,
}: WorkoutExerciseListProps) {
  const [showCommentMap, setShowCommentMap] = useState<Record<number, boolean>>(
    {},
  );

  const [showTrackingOptions, setShowTrackingOptions] = useState(false);

  const [isReorderMode, setIsReorderMode] = useState(false);
  const t = useTranslations("Components.WorkoutExerciseList");
  const tCommon = useTranslations("Common");

  const { isHebrew, dir } = useLocaleInfo();

  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required before drag starts
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200, // 200ms delay before touch drag starts
        tolerance: 5, // 5px movement tolerance
      },
    }),
  );

  const { confirm, ConfirmDialog } = useConfirmDialog();

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const newIndex = exercises.findIndex((ex) => ex.exercise_id === over.id);

      // Call onReorderExercise with the new position
      onReorderExercise(workoutId, active.id as number, newIndex + 1);
    }
  };

  const handleRemoveAll = async () => {
    const confirmed = await confirm({
      title: t("removeAll"),
      message: t("removeAllConfirm"),
      confirmLabel: tCommon("remove"),
      cancelLabel: tCommon("cancel"),
      onConfirm: () => {},
    });

    if (confirmed) {
      exercises.forEach((exercise) => {
        onRemoveExercise(workoutId, exercise.exercise_id);
      });
    }
  };

  const handleSetsChange = (exerciseId: number, newSets: number) => {
    if (newSets >= 1 && newSets <= 10) {
      onUpdateExercise(workoutId, exerciseId, "sets", newSets);
    }
  };
  const handleCommentChange = (exerciseId: number, newComment: string) => {
    onUpdateExercise(workoutId, exerciseId, "comment", newComment);
  };

  const getTrackingValue = (exercise: WorkoutExercise): string => {
    if (exercise.track_rpe_score) return "rpe";
    if (exercise.track_rir_score) return "rir";
    return "none";
  };

  const handleTrackingChange = (exerciseId: number, value: string) => {
    // Update both properties based on the selected value

    onUpdateExercise(workoutId, exerciseId, "track_rpe_score", value === "rpe");
    onUpdateExercise(workoutId, exerciseId, "track_rir_score", value === "rir");
  };

  const handleSetAllTracking = (value: string) => {
    exercises.forEach((exercise) => {
      handleTrackingChange(exercise.exercise_id, value);
    });
  };

  //Todo :Needs to use Enums
  const handleKgChange = (exerciseId: number, newKg: number) => {
    if (newKg >= WEIGHT_SCORE.min && newKg <= WEIGHT_SCORE.max) {
      onUpdateExercise(workoutId, exerciseId, "kg", newKg);
    }
  };
  const handleRepsChange = (exerciseId: number, newReps: string) => {
    const repsPattern = /^(\d+)$|^(\d+)-(\d+)$/;
    if (newReps === "" || repsPattern.test(newReps)) {
      if (newReps !== "") {
        const match = newReps.match(repsPattern);
        if (match) {
          if (match[1]) {
            const num = Number.parseInt(match[1]);
            if (num <= 0) return;
          } else if (match[2] && match[3]) {
            const start = Number.parseInt(match[2]);
            const end = Number.parseInt(match[3]);
            if (start <= 0 || end <= 0 || start >= end) return;
          }
        }
      }
      onUpdateExercise(workoutId, exerciseId, "reps", newReps);
    }
  };
  return (
    <Card
      dir={dir}
      className={`w-full border-secondary-foreground/30 ${gridClass ? gridClass : ""}`}
    >
      <CardHeader>
        <div
          className={`grid  ${showTrackingOptions ? "grid-rows-2" : "grid-rows-1"} gap-y-1`}
        >
          <div className="grid grid-cols-4 gap-2 justify-end">
            <Button
              disabled={exercises.length === 0}
              onClick={handleRemoveAll}
              size="sm"
              className="border-secondary-foreground/30 border hover:border-destructive"
              variant="outline"
            >
              {t("removeAllButton")}
            </Button>

            <Button
              disabled={exercises.length === 0}
              onClick={() => setIsReorderMode((prev) => !prev)}
              size="sm"
              className="border-secondary-foreground/30 border"
              variant={isReorderMode ? "default" : "outline"}
            >
              {t("reorderButton")}
            </Button>

            <Toggle
              variant="outline"
              pressed={showTrackingOptions}
              onPressedChange={setShowTrackingOptions}
              className="flex flex-col items-center gap-1 h-auto py-2"
            >
              <Label className="text-xs">
                <Cog className="h-4 w-4" />
              </Label>
            </Toggle>
          </div>
          {showTrackingOptions && (
            <div className="grid grid-cols-4">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleSetAllTracking("rpe")}
                className="text-xs"
              >
                {t("setAllRpe")}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleSetAllTracking("rir")}
                className="text-xs"
              >
                {t("setAllRir")}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleSetAllTracking("none")}
                className="text-xs"
              >
                {t("setAllNone")}
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="">
        {exercises.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            {t("noExercisesAdded")}
          </div>
        ) : (
          <ScrollArea className="lg:h-[440px] pr-4">
            {isReorderMode ? (
              <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                <SortableContext
                  items={exercises.map((e) => e.exercise_id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {exercises.map((exercise, index) => (
                      <SortableExerciseItem
                        key={exercise.exercise_id}
                        exercise={exercise}
                        index={index}
                        workoutId={workoutId}
                        showCommentMap={showCommentMap}
                        setShowCommentMap={setShowCommentMap}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            ) : (
              <div className="space-y-2">
                {exercises.map((exercise, index: number) => (
                  <div
                    id={`exercise-${exercise.exercise_id}`}
                    key={exercise.exercise_id}
                    className="justify-between p-2 rounded-md border border-secondary-foreground/20 hover:bg-accent/50 transition-colors"
                  >
                    <div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-2 ">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                onRemoveExercise(
                                  workoutId,
                                  exercise.exercise_id,
                                )
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex items-center gap-2 ">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                onReorderExercise(
                                  workoutId,
                                  exercise.exercise_id,
                                  exercise.position - 1,
                                )
                              }
                            >
                              <ArrowUp className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex items-center gap-2 ">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                onReorderExercise(
                                  workoutId,
                                  exercise.exercise_id,
                                  exercise.position + 1,
                                )
                              }
                            >
                              <ArrowDown className="h-4 w-4" />
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            title={t("toggleComment")}
                            className={`h-6 w-6  ${
                              showCommentMap[exercise.exercise_id]
                                ? "opacity-100"
                                : "opacity-60"
                            }`}
                            onClick={() =>
                              setShowCommentMap((prev) => ({
                                ...prev,
                                [exercise.exercise_id]:
                                  !prev[exercise.exercise_id],
                              }))
                            }
                          >
                            <MessageCircle className="h-3 w-3" />
                          </Button>
                        </div>
                        <div dir={dir} className="font-medium">
                          <span className="text-sm text-muted-foreground">
                            {index + 1}.{" "}
                          </span>
                          <span className="text-sm">
                            {isHebrew
                              ? exercise.hebrew_name
                              : exercise.english_name}
                          </span>
                        </div>
                      </div>

                      <div
                        dir={dir}
                        className={`grid ${showTrackingOptions ? "grid-rows-2" : "grid-rows-1"} gap-x-4`}
                      >
                        <div className="flex gap-2 ">
                          <div>
                            <Label htmlFor={`sets-${exercise.exercise_id}`}>
                              {t("sets")}
                            </Label>
                            <Input
                              id={`sets-${exercise.exercise_id}`}
                              type="number"
                              value={exercise.sets}
                              placeholder={t("sets")}
                              onChange={(e) =>
                                handleSetsChange(
                                  exercise.exercise_id,
                                  Number.parseInt(e.target.value),
                                )
                              }
                              className="mt-1 w-20 border-secondary-foreground/30 border "
                              min={REPETITIONS.min}
                              max={REPETITIONS.max}
                            />
                          </div>

                          <div>
                            <Label htmlFor={`kg-${exercise.exercise_id}`}>
                              {t("kg")}
                            </Label>
                            <Input
                              id={`kg-${exercise.exercise_id}`}
                              type="number"
                              value={exercise.kg}
                              placeholder={t("kg")}
                              onChange={(e) =>
                                handleKgChange(
                                  exercise.exercise_id,
                                  Number.parseFloat(e.target.value),
                                )
                              }
                              className="mt-1 w-20 border-secondary-foreground/30 border"
                              min={WEIGHT_SCORE.min}
                              max={WEIGHT_SCORE.max}
                              step={1}
                            />
                          </div>

                          <div>
                            <Label htmlFor={`reps-${exercise.exercise_id}`}>
                              {tCommon("reps")}
                            </Label>
                            <Input
                              id={`reps-${exercise.exercise_id}`}
                              type="number"
                              value={exercise.reps || ""}
                              onChange={(e) =>
                                handleRepsChange(
                                  exercise.exercise_id,
                                  e.target.value,
                                )
                              }
                              className="mt-1 w-24 border-secondary-foreground/30 border"
                              placeholder={tCommon("reps")}
                            />
                          </div>
                        </div>

                        {showTrackingOptions && (
                          <div className="col-span-2 flex items-center gap-2">
                            <Label className="text-sm font-medium">
                              {t("trackingType")}
                            </Label>
                            {/* Todo: Investiage this getTrackingValue */}
                            <RadioGroup
                              value={getTrackingValue(exercise)}
                              onValueChange={(value) =>
                                handleTrackingChange(
                                  exercise.exercise_id,
                                  value,
                                )
                              }
                              className="flex"
                            >
                              {trackingOptions.map(
                                ({ value, translationKey }) => (
                                  <div
                                    key={value}
                                    className="flex items-center gap-2"
                                  >
                                    <RadioGroupItem
                                      value={value}
                                      id={`${value}-${exercise.exercise_id}`}
                                    />
                                    <Label
                                      htmlFor={`${value}-${exercise.exercise_id}`}
                                    >
                                      {t(translationKey)}
                                    </Label>
                                  </div>
                                ),
                              )}
                            </RadioGroup>
                          </div>
                        )}
                      </div>

                      {showCommentMap[exercise.exercise_id] && (
                        <div dir={dir} className="mt-2">
                          <Label htmlFor={`comment-${exercise.exercise_id}`}>
                            {t("comment")}
                          </Label>
                          <Textarea
                            id={`comment-${exercise.exercise_id}`}
                            value={exercise.comment || ""}
                            onChange={(e) =>
                              handleCommentChange(
                                exercise.exercise_id,
                                e.target.value,
                              )
                            }
                            dir={dir}
                            className="mt-1 border-secondary-foreground/30 border font-thin"
                            placeholder={t("addCommentHere")}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        )}
        <ConfirmDialog />
      </CardContent>
    </Card>
  );
}
