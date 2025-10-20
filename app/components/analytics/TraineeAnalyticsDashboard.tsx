"use client";

import { use } from "react";
import { useTranslations } from "next-intl";
import PerformanceSummaryCard from "./charts/PerformanceSummaryCard";
import WeightChart from "./charts/WeightChart";
import PersonalRecordsChart from "./charts/PersonalRecordsChart";
import FrequencyChart from "./charts/FrequencyChart";
import { ScrollArea } from "../ui/scroll-area";
import { useLocaleInfo } from "app/hooks/use-locale-info";
import {
  ApiResponse,
  PerformanceSummaryData,
  WorkoutSessionData,
  ExercisePersonalRecord,
  FrequencyAnalysisData,
  MuscleGroupVolumeData,
} from "@guy-vaserman/shared-my-training-app";
import { unwrapApiResponse } from "@guy-vaserman/shared-my-training-app";

interface TraineeAnalyticsDashboard {
  data: Promise<
    [
      ApiResponse<PerformanceSummaryData | null>,
      ApiResponse<WorkoutSessionData[] | null>,
      ApiResponse<ExercisePersonalRecord[] | null>,
      ApiResponse<MuscleGroupVolumeData[] | null>,
      ApiResponse<FrequencyAnalysisData | null>,
    ]
  >;
  userId: number;
}

export default function TraineeAnalyticsDashboard({
  data,
  userId,
}: TraineeAnalyticsDashboard) {
  const [
    performanceSummaryResponse,
    workoutSessionsResponse,
    personalRecordsResponse,
    muscleGroupResponse,
    frequencyResponse,
  ] = use(data);

  const performanceSummary = unwrapApiResponse(performanceSummaryResponse);
  const workoutSessions = unwrapApiResponse(workoutSessionsResponse);
  const personalRecords = unwrapApiResponse(personalRecordsResponse);
  const muscleGroup = unwrapApiResponse(muscleGroupResponse);
  const frequency = unwrapApiResponse(frequencyResponse);

  if (
    !performanceSummary ||
    !workoutSessions ||
    !personalRecords ||
    !frequency
  ) {
    return <div>Error loading analytics data</div>;
  }

  const { dir } = useLocaleInfo();
  // Extract data from API responses

  return (
    <div dir={dir} className="flex flex-col gap-2 lg:block">
      {performanceSummary && (
        <PerformanceSummaryCard
          data={performanceSummary}
          className="bg-card border rounded-lg p-4 lg:p-6"
        />
      )}
      {/* TODO: Instead of displaying one line for all the workouts weights display multiple lines for each progra plan workout,
          there will be few differnet colors and there should be a mini info at the bottom of the chart to indicate which workout is which */}

      {workoutSessions.length > 0 && (
        <WeightChart
          sessions={workoutSessions}
          className="bg-card border rounded-lg p-4 lg:p-6"
        />
      )}

      {/* Todo investigate in allowing coaches to see a user data, having search*/}

      {personalRecords.length > 0 && (
        <PersonalRecordsChart
          userId={userId}
          records={personalRecords}
          className="bg-card border rounded-lg p-4 lg:p-6"
        />
      )}

      {/* TODO: Improve calander UI, replace the bar graph */}

      {frequency && workoutSessions.length > 0 && (
        <FrequencyChart
          frequencyData={frequency}
          sessions={workoutSessions}
          className="bg-card border rounded-lg p-4 lg:p-6"
        />
      )}

      {/* <pre className="">{JSON.stringify(muscleGroup, null, 4)}</pre> */}
      {/* {muscleGroup && (
          <MuscleGroupChart
            muscleGroupData={muscleGroup}
            className="bg-card border rounded-lg p-4 lg:p-6"
          />
        )} */}

      {/* TODO Add another chart htat will display the muscle points */}
    </div>
  );
}
