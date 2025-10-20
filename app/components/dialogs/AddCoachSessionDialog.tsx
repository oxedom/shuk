"use client";
import {
  getProgramPlanWorkouts,
  getTraineesOptions,
} from "app/backend/actions";
import { Button } from "app/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "app/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "app/components/ui/dialog";
import { Badge } from "app/components/ui/badge";
import { cn } from "app/libs/utils";
import {
  Check,
  User,
  Dumbbell,
  ChevronRight,
  AlertCircle,
  Loader2,
  ChevronLeft,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { ScrollArea } from "../ui/scroll-area";
import { useLocaleInfo } from "app/hooks/use-locale-info";
import { Separator } from "../ui/separator";

interface TraineeOption {
  user_id: number;
  first_name: string;
  last_name: string;
  is_me?: boolean;
}

interface WorkoutOption {
  program_plan_workout_id: number;
  english_name: string;
  hebrew_name?: string;
}

interface AddCoachSessionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (workout: WorkoutOption) => void;
  isLoading?: boolean;
}

export default function AddCoachSessionDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  isLoading,
}: AddCoachSessionDialogProps) {
  const t = useTranslations("Components.ProgramBuilder");
  const tCommon = useTranslations("Common");
  const [trainees, setTrainees] = useState<TraineeOption[]>([]);
  const [workouts, setWorkouts] = useState<WorkoutOption[]>([]);
  const [selectedTrainee, setSelectedTrainee] = useState<TraineeOption | null>(
    null,
  );
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutOption | null>(
    null,
  );
  const [loadingTrainees, setLoadingTrainees] = useState(false);
  const [loadingPrograms, setLoadingPrograms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { dir, isRtl } = useLocaleInfo();

  const currentStep = !selectedTrainee ? 1 : 2;

  useEffect(() => {
    if (isOpen) {
      setSelectedTrainee(null);
      setSelectedWorkout(null);
      setWorkouts([]);
      setError(null);
      setLoadingTrainees(true);
      (async () => {
        try {
          const result = await getTraineesOptions();
          if (result.success) setTrainees(result.data ?? []);
          else setError(result.message || "Failed to fetch trainees");
        } catch (err) {
          setError("Failed to fetch trainees");
        } finally {
          setLoadingTrainees(false);
        }
      })();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedTrainee) {
      setLoadingPrograms(true);
      setWorkouts([]);
      setSelectedWorkout(null);
      setError(null);
      (async () => {
        try {
          const result = await getProgramPlanWorkouts(selectedTrainee.user_id);
          if (result.success) setWorkouts(result.data ?? []);
          else setError(result.message || "Failed to fetch workouts");
        } catch (err) {
          setError("Failed to fetch workouts");
        } finally {
          setLoadingPrograms(false);
        }
      })();
    }
  }, [selectedTrainee]);

  const handleConfirm = () => {
    if (selectedTrainee && selectedWorkout) {
      onConfirm(selectedWorkout);
      onOpenChange(false);
    }
  };

  const handleWorkoutSelect = (workout: WorkoutOption) => {
    setSelectedWorkout(workout);
  };

  const TraineeSkeleton = () => (
    <div className="space-y-2">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center space-x-3 p-3">
          <div className="w-4 h-4 bg-muted rounded animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );

  const WorkoutSkeleton = () => (
    <div className="grid gap-3 p-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />
      ))}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="pb-6">
          <DialogTitle className="text-2xl font-semibold">
            {t("addCoachSessionTitle", { default: "Start New Session" })}
          </DialogTitle>
          <DialogDescription className="text-base">
            {t("selectTraineeAndWorkout", {
              default:
                "Choose a trainee and workout to begin a new training session.",
            })}
          </DialogDescription>

          {/* Step Indicator */}
          <div className="flex items-center justify-center pt-4">
            <div className="flex items-center gap-x-4">
              <div className="flex items-center gap-x-1">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all",
                    currentStep >= 1
                      ? "bg-primary  text-primary-foreground"
                      : "border-muted-foreground text-muted-foreground",
                  )}
                >
                  <User className="w-4 h-4" />
                </div>
                <span
                  className={cn(
                    "text-sm font-medium transition-colors",
                    currentStep >= 1
                      ? "text-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {t("selectTrainee", { default: "Select Trainee" })}
                </span>
              </div>

              {isRtl ? (
                <ChevronLeft
                  className={cn(
                    "w-4 h-4 transition-colors",
                    currentStep >= 2 ? "text-primary" : "text-muted-foreground",
                  )}
                />
              ) : (
                <ChevronRight
                  className={cn(
                    "w-4 h-4 transition-colors",
                    currentStep >= 2 ? "text-primary" : "text-muted-foreground",
                  )}
                />
              )}

              <div className="flex items-center gap-x-1">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all",
                    currentStep >= 2
                      ? "bg-primary  text-primary-foreground"
                      : "border-muted-foreground text-muted-foreground",
                  )}
                >
                  <Dumbbell className="w-4 h-4" />
                </div>
                <span
                  className={cn(
                    "text-sm font-medium transition-colors",
                    currentStep >= 2
                      ? "text-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {t("selectWorkout", { default: "Select Workout" })}
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Error Display */}
        {error && (
          <div className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            {/* Trainee Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <User className="w-5 h-5" />
                  {t("trainee", { default: "Trainee" })}
                </h3>
                {selectedTrainee && (
                  <Badge variant="secondary" className="text-xs">
                    {t("selected", { default: "Selected" })}
                  </Badge>
                )}
              </div>

              <div className="border rounded-lg overflow-hidden h-80">
                {loadingTrainees ? (
                  <TraineeSkeleton />
                ) : (
                  <Command className="h-full">
                    <CommandInput
                      placeholder={t("searchTraineesPlaceholder", {
                        default: "Search trainees...",
                      })}
                      className="border-0"
                    />
                    <CommandList className="max-h-none">
                      <CommandEmpty className="py-8">
                        <div className="text-center space-y-2">
                          <User className="w-8 h-8 mx-auto text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            {t("noTraineesFound", {
                              default: "No trainees found.",
                            })}
                          </p>
                        </div>
                      </CommandEmpty>
                      <CommandGroup>
                        {trainees.map((trainee) => (
                          <CommandItem
                            key={trainee.user_id}
                            value={`${trainee.first_name} ${trainee.last_name}`.toLowerCase()}
                            onSelect={() => setSelectedTrainee(trainee)}
                            className={cn(
                              "cursor-pointer p-3 transition-all hover:bg-accent/60",
                              selectedTrainee?.user_id === trainee.user_id &&
                                "bg-primary/10 border-l-4 ",
                            )}
                          >
                            <div className="flex items-center w-full">
                              <Check
                                className={cn(
                                  "mr-3 h-4 w-4 transition-opacity",
                                  selectedTrainee?.user_id === trainee.user_id
                                    ? "opacity-100 text-primary"
                                    : "opacity-0",
                                )}
                              />
                              <div className="flex gap-x-2 items-center">
                                <p className="font-medium">
                                  {trainee.first_name} {trainee.last_name}
                                </p>
                                {trainee.is_me && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs mt-1"
                                  >
                                    {t("you", { default: "You" })}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                )}
              </div>
            </div>

            {/* Workout Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Dumbbell className="w-5 h-5" />
                  {t("workout", { default: "Workout" })}
                </h3>
                {selectedWorkout && (
                  <Badge variant="secondary" className="text-xs">
                    {t("selected", { default: "Selected" })}
                  </Badge>
                )}
              </div>

              <div className="border rounded-lg h-80 overflow-hidden">
                {!selectedTrainee ? (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-3 p-6">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                      <User className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium text-muted-foreground">
                        {t("selectTraineeFirst", {
                          default: "Select a trainee first",
                        })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t("selectTraineeToViewWorkouts", {
                          default:
                            "Choose a trainee to view their available workouts",
                        })}
                      </p>
                    </div>
                  </div>
                ) : loadingPrograms ? (
                  <WorkoutSkeleton />
                ) : workouts.length > 0 ? (
                  <ScrollArea dir={dir} className="h-full">
                    <div className="p-4 space-y-3">
                      {workouts.map((workout) => (
                        <Button
                          key={workout.program_plan_workout_id}
                          variant="default"
                          className={cn(
                            "w-full  border duration-300  justify-start h-auto p-4 transition-all",
                            "hover:shadow-md",
                            selectedWorkout?.program_plan_workout_id ===
                              workout.program_plan_workout_id
                              ? "bg-primary"
                              : "bg-transparent",
                            selectedWorkout?.program_plan_workout_id ===
                              workout.program_plan_workout_id
                              ? "bg-primary"
                              : "bg-transparent",
                          )}
                          onClick={() => handleWorkoutSelect(workout)}
                          disabled={isLoading}
                        >
                          <div className="flex items-center w-full gap-x-2">
                            <Dumbbell className="w-4 h-4 mr-3 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="font-medium">
                                {workout.english_name}
                              </p>
                            </div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-3 p-6">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                      <Dumbbell className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium text-muted-foreground">
                        {t("noWorkoutsFound", { default: "No workouts found" })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t("noWorkoutsAvailable", {
                          default: "This trainee has no available workouts",
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        <DialogFooter className="gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="px-6"
          >
            {tCommon("cancel")}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedTrainee || !selectedWorkout || isLoading}
            className="px-6 min-w-32"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t("starting", { default: "Starting..." })}
              </>
            ) : (
              <>
                <Dumbbell className="w-4 h-4 mr-2" />
                {t("startSession", { default: "Start Session" })}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
