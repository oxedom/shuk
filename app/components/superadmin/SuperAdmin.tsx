"use client";
import ExerciseMuscleManager from "app/components/ExerciseMuscleManager";
import GymManager from "app/components/superadmin/GymManager";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "app/components/ui/tabs";
import { useTranslations } from "next-intl";
import {
  ApiResponse,
  unwrapApiResponse,
} from "@guy-vaserman/shared-my-training-app";
import {
  ExerciseInstance,
  GymRowData,
} from "@guy-vaserman/shared-my-training-app";
import { MuscleInstance } from "@guy-vaserman/shared-my-training-app";
import { UserInstance } from "@guy-vaserman/shared-my-training-app";
import { ExerciseMuscleTypeInstance } from "@guy-vaserman/shared-my-training-app";
import { use } from "react";
interface SuperAdminProps {
  data: Promise<
    [
      ApiResponse<ExerciseInstance[] | null>,
      ApiResponse<MuscleInstance[] | null>,
      ApiResponse<ExerciseMuscleTypeInstance[] | null>,
      ApiResponse<UserInstance[] | null>,
      ApiResponse<GymRowData[] | null>,
    ]
  >;
}

export default function SuperAdmin({
  data,
}: {
  data: SuperAdminProps["data"];
}) {
  const t = useTranslations("Pages.SuperAdmin");

  if (!data) {
    return null;
  }

  const resolvedData = use(data);

  if (!resolvedData || resolvedData.length !== 5) {
    return null;
  }

  const [exercisesData, musclesData, exerciseMusclesData, usersData, gymsData] =
    [
      unwrapApiResponse(resolvedData[0]),
      unwrapApiResponse(resolvedData[1]),
      unwrapApiResponse(resolvedData[2]),
      unwrapApiResponse(resolvedData[3]),
      unwrapApiResponse(resolvedData[4]),
    ];

  if (
    !exercisesData ||
    !musclesData ||
    !exerciseMusclesData ||
    !usersData ||
    !gymsData
  ) {
    return null;
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-3">{t("title")}</h1>

      <Tabs defaultValue="exercises">
        <TabsList className="grid grid-cols-2 mb-3">
          <TabsTrigger value="exercises">
            {t("tabs.exerciseMuscles")}
          </TabsTrigger>

          <TabsTrigger value="gyms">{t("tabs.gyms")}</TabsTrigger>
        </TabsList>
        <TabsContent value="exercises">
          <ExerciseMuscleManager
            exercises={exercisesData}
            muscles={musclesData}
            fetchedExercisesMuscles={exerciseMusclesData}
          />
        </TabsContent>

        <TabsContent value="gyms">
          <GymManager gyms={gymsData} users={usersData} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
