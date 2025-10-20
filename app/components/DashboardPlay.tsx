"use client";
import { toast } from "app/hooks/use-toast";
import { createWorkoutInstanceForCurrentUser } from "app/backend/actions";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { Button } from "./ui/button";
import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "app/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "app/components/ui/avatar";
import { Play, Dumbbell } from "lucide-react";
import { useLocaleInfo } from "app/hooks/use-locale-info";
import { ScrollArea } from "app/components/ui/scroll-area";

import { DashboardProgressBar } from "app/components/dashboardPlay/DashboardProgressBar";

import useGlobalStore from "app/store/globalStore";
import {
  ActiveProgramPlanProgramPlanWorkout,
  ApiResponse,
  InProgressWorkoutInstanceProgramPlanWorkoutProgramPlanInstance,
  ProgramPlanWorkoutInstance,
  UserInstance,
} from "@guy-vaserman/shared-my-training-app";

import { unwrapApiResponse } from "@guy-vaserman/shared-my-training-app";

interface DashboardPlayProps {
  data: Promise<
    [
      ApiResponse<ActiveProgramPlanProgramPlanWorkout | null>,
      ApiResponse<
        InProgressWorkoutInstanceProgramPlanWorkoutProgramPlanInstance[] | null
      >,
      ApiResponse<UserInstance | null>,
    ]
  >;
}

export function DashboardPlay({ data }: DashboardPlayProps) {
  const [activeProgramPlanData, activeWorkoutInstancesData, userData] =
    use(data);

  const activeProgramPlan = unwrapApiResponse(activeProgramPlanData);
  const activeWorkoutInstances = unwrapApiResponse(activeWorkoutInstancesData);
  const user = unwrapApiResponse(userData);

  const [isLoading, setIsLoading] = useState<number | null>(null);

  const router = useRouter();
  const t = useTranslations("Components.DashboardPlay");

  const { dir } = useLocaleInfo();
  const { handleLinkClick } = useGlobalStore();

  const handlePlayClick = async (workout: ProgramPlanWorkoutInstance) => {
    setIsLoading(workout.program_plan_workout_id);

    try {
      const res = await createWorkoutInstanceForCurrentUser(
        workout.program_plan_workout_id,
      );
      if (res.success) {
        router.push(`/workout/${res.data?.workoutInstanceId}`);
      } else {
        toast({
          variant: "destructive",
          title: "Failed to add exercise",
          description: res.message,
        });
      }
      return res;
    } catch (err: unknown) {
      toast({
        variant: "destructive",
        title: "Failed to add exercise",
        description:
          err instanceof Error ? err.message : "An unknown error occurred",
      });
    } finally {
      setIsLoading(null);
    }
  };

  function getInProgressWorkouts(
    activeProgramPlan: ActiveProgramPlanProgramPlanWorkout | null,
    activeWorkoutInstances:
      | InProgressWorkoutInstanceProgramPlanWorkoutProgramPlanInstance[]
      | null,
  ): ProgramPlanWorkoutInstance[] {
    if (!activeWorkoutInstances || !activeProgramPlan) return [];

    return activeProgramPlan.program_plan_workouts.filter((workout) => {
      return activeWorkoutInstances.find(
        (inst) =>
          inst.program_plan_workout_id === workout.program_plan_workout_id,
      );
    });
  }

  function getAvailableWorkouts(
    activeProgramPlan: ActiveProgramPlanProgramPlanWorkout | null,
    activeWorkoutInstances:
      | InProgressWorkoutInstanceProgramPlanWorkoutProgramPlanInstance[]
      | null,
  ): ProgramPlanWorkoutInstance[] {
    if (!activeProgramPlan || !activeWorkoutInstances) return [];

    const availableWorkouts = activeProgramPlan.program_plan_workouts.filter(
      (workout) => {
        return !activeWorkoutInstances.find(
          (inst) =>
            inst.program_plan_workout_id === workout.program_plan_workout_id,
        );
      },
    );

    return availableWorkouts;
  }

  const inProgressWorkouts = getInProgressWorkouts(
    activeProgramPlan,
    activeWorkoutInstances,
  );

  const availableWorkouts = getAvailableWorkouts(
    activeProgramPlan,
    activeWorkoutInstances,
  );

  return (
    <div className="w-full lg:max-w-5xl mx-auto space-y-4">
      {/* Personalized Welcome Message */}
      {user && (
        <Card dir={dir} className="w-full">
          <CardContent className="p-6">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-20 w-20">
                {/* Todo use real api */}
                <AvatarImage alt={user.first_name} />
                <AvatarFallback className="text-2xl">
                  {user.first_name?.[0]}
                  {user.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  {t("welcomeBack", { firstName: user.first_name })}
                </h1>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeProgramPlan && (
        <>
          <Card dir={dir} className="w-full">
            <CardContent className="p-6 flex items-center flex-col justify-between gap-6">
              <h2 className="text-2xl font-bold ">
                {activeProgramPlan.english_name}
              </h2>
              {activeProgramPlan.countData && (
                <DashboardProgressBar
                  completed={activeProgramPlan.countData.completedWorkouts}
                  total={activeProgramPlan.countData.estimatedWorkouts}
                />
              )}
            </CardContent>
          </Card>

          {/* Choose Your Workout Section */}
          <ScrollArea
            dir={dir}
            className="h-full md:h-[calc(100vh-35vh)] lg:h-[calc(100vh-48vh)] lg:pe-3"
          >
            <Card dir={dir} className="w-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-title">
                  <Dumbbell className="h-5 w-5" />
                  {t("chooseYourWorkout")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activeProgramPlan.program_plan_workouts &&
                activeProgramPlan.program_plan_workouts.length > 0 ? (
                  <div className="">
                    {/* Active Workouts Section */}
                    {(() => {
                      if (inProgressWorkouts.length > 0) {
                        return (
                          <div>
                            <h3 className="text-lg font-semibold mb-4">
                              {t("activeWorkouts")}
                            </h3>
                            <div className="grid grid-cols-1 lg:grid-cols-4  gap-4">
                              {inProgressWorkouts.map((workout) => {
                                const activeWorkoutInstance =
                                  activeWorkoutInstances?.find(
                                    (inst) =>
                                      inst.program_plan_workout_id ===
                                      workout.program_plan_workout_id,
                                  );
                                const originalIndex =
                                  activeProgramPlan.program_plan_workouts.findIndex(
                                    (w) =>
                                      w.program_plan_workout_id ===
                                      workout.program_plan_workout_id,
                                  );

                                return (
                                  <Card
                                    key={workout.program_plan_workout_id}
                                    className="flex flex-col hover:border-primary h-full "
                                  >
                                    <CardHeader className="flex-grow">
                                      <CardTitle className="text-lg lg:min-h-[4rem] flex items-center">
                                        {t("workout")}{" "}
                                        {String.fromCharCode(
                                          65 + originalIndex,
                                        )}
                                        : {workout.english_name}
                                      </CardTitle>
                                    </CardHeader>
                                    <CardContent className="mt-auto">
                                      <Button
                                        asChild
                                        className="w-full font-title"
                                      >
                                        <Link
                                          onClick={() =>
                                            handleLinkClick(
                                              `/workout/${activeWorkoutInstance?.workout_instance_id}`,
                                            )
                                          }
                                          href={`/workout/${activeWorkoutInstance?.workout_instance_id}`}
                                        >
                                          <Play className="h-4 w-4 mr-2" />
                                          {t("continue")}
                                        </Link>
                                      </Button>
                                    </CardContent>
                                  </Card>
                                );
                              })}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}

                    {availableWorkouts.length ? (
                      <div
                        className="mt-4
                    "
                      >
                        <h3 className="text-lg font-semibold mb-4">
                          {t("availableWorkouts")}
                        </h3>

                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                          {availableWorkouts.map((workout) => {
                            const loading =
                              isLoading === workout.program_plan_workout_id;
                            const originalIndex =
                              activeProgramPlan.program_plan_workouts.findIndex(
                                (w) =>
                                  w.program_plan_workout_id ===
                                  workout.program_plan_workout_id,
                              );

                            return (
                              <Card
                                key={workout.program_plan_workout_id}
                                className="flex flex-col  hover:border-primary border h-full"
                              >
                                <CardHeader className="flex-grow">
                                  <CardTitle className="text-lg lg:min-h-[4rem] flex items-center font-title">
                                    {t("workout")}{" "}
                                    {String.fromCharCode(65 + originalIndex)}:{" "}
                                    {workout.english_name}
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="mt-auto">
                                  <Button
                                    className="text-pretty w-full font-title"
                                    onClick={() => handlePlayClick(workout)}
                                    disabled={loading}
                                  >
                                    <Play className="h-4 w-4 mr-2" />
                                    {loading ? t("ctaStarting") : t("ctaPlay")}
                                  </Button>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div>
                        {" "}
                        <h3 className="text-lg font-semibold mb-4">
                          {t("availableWorkouts")}
                        </h3>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Dumbbell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      {t("noWorkoutPlans")}
                    </h3>
                  </div>
                )}
              </CardContent>
            </Card>

            {activeProgramPlan.previouslyCompletedWorkouts &&
              activeProgramPlan.previouslyCompletedWorkouts.length > 0 && (
                <Card dir={dir} className="w-full mt-4 mb-2 ">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-title">
                      <Dumbbell className="h-5 w-5" />
                      {t("workoutHistory")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea dir={dir} className="h-[120px]">
                      <div className="flex flex-col lg:flex-row gap-4 items-center">
                        {activeProgramPlan.previouslyCompletedWorkouts.map(
                          (workout) => {
                            return (
                              <Card
                                key={workout.workout_instance_id}
                                className="flex flex-col hover:border-primary h-full w-full lg:w-1/4"
                              >
                                <CardHeader className="flex-grow">
                                  <CardTitle className="text-lg flex items-center font-title">
                                    {t("workout")} {workout.english_name}
                                  </CardTitle>
                                </CardHeader>
                                <CardContent className="mt-auto">
                                  <p className="text-sm text-muted-foreground">
                                    {(() => {
                                      try {
                                        const date = new Date(workout.end_time);
                                        return isNaN(date.getTime())
                                          ? "Invalid date"
                                          : date.toLocaleDateString();
                                      } catch {
                                        return "Invalid date";
                                      }
                                    })()}
                                  </p>
                                </CardContent>
                              </Card>
                            );
                          },
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}
          </ScrollArea>
        </>
      )}
    </div>
  );
}

export default DashboardPlay;
