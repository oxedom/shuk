"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "app/components/ui/dialog";
import { useTranslations } from "next-intl";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "app/components/ui/table";
import { useLocaleInfo } from "app/hooks/use-locale-info";
import { cn } from "app/libs/utils";
import type { WorkoutActivityInstance } from "@guy-vaserman/shared-my-training-app";

interface ExerciseHistoryDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  exerciseHistory: WorkoutActivityInstance[] | null;
  activeExerciseName?: string; // Optional: To display the name of the exercise
}

interface GroupedHistoryEntry {
  workoutInstanceId: number;
  date: string;
  sets: WorkoutActivityInstance[];
}

const groupHistoryByWorkoutInstance = (
  history: WorkoutActivityInstance[] | null | undefined,
): GroupedHistoryEntry[] => {
  if (!history || history.length === 0) {
    return [];
  }

  const grouped: { [key: number]: WorkoutActivityInstance[] } = history.reduce(
    (acc, entry) => {
      const key = entry.workout_instance_id;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(entry);
      return acc;
    },
    {} as { [key: number]: WorkoutActivityInstance[] },
  );

  return (
    Object.entries(grouped)
      .map(([workoutInstanceId, sets]) => ({
        workoutInstanceId: Number(workoutInstanceId),
        // Assuming sets are chronologically ordered, use the first entry's date for the session date
        date:
          sets.length > 0
            ? `${new Date(sets[0].createdAt ?? "").toLocaleDateString()}`
            : "Unknown Date",
        sets: sets.sort((a, b) => a.set_number - b.set_number), // Ensure sets are ordered by set_number
      }))
      // Sort sessions by date, most recent first
      .sort(
        (a, b) =>
          new Date(b.sets[0]?.createdAt ?? "").getTime() -
          new Date(a.sets[0]?.createdAt ?? "").getTime(),
      )
  );
};

export default function ExerciseHistoryDialog({
  isOpen,
  onOpenChange,
  exerciseHistory,
  activeExerciseName,
}: ExerciseHistoryDialogProps) {
  const t = useTranslations("Components.ExerciseHistoryDialog"); // Assuming translations are in this namespace
  const tCommon = useTranslations("Common");
  const groupedExerciseHistory = groupHistoryByWorkoutInstance(exerciseHistory);
  const { dir, isRtl } = useLocaleInfo();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        dir={dir}
        className={cn(
          "max-w-[350px] rounded-lg lg:max-w-[500px]",
          isRtl ? "text-right" : "text-left",
        )}
      >
        <DialogHeader>
          <DialogTitle>
            <p className="text-lg border-b  pb-2">
              {t("exerciseHistoryTitle", {
                exerciseName: activeExerciseName ?? "",
              })}
            </p>
          </DialogTitle>
        </DialogHeader>

        <div className="py-2 max-h-[50vh] overflow-y-auto">
          {groupedExerciseHistory.length > 0 ? (
            groupedExerciseHistory.map((session) => (
              <div key={session.workoutInstanceId} className="mb-6">
                <h4 className="text-md font-semibold mb-2">
                  {t("workoutOnDate", { date: session.date })}
                </h4>
                <Table dir={dir}>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("set")}</TableHead>
                      <TableHead>{tCommon("repetitions")}</TableHead>
                      <TableHead>{tCommon("weight")}</TableHead>
                      {/* Add other relevant columns if needed, like RPE, RIR, Time */}
                      <TableHead>{tCommon("rpe")}</TableHead>
                      <TableHead>{tCommon("rir")}</TableHead>
                      {/* <TableHead>{t('time')}</TableHead> */}
                    </TableRow>
                  </TableHeader>
                  <TableBody dir={dir}>
                    {session.sets.map((entry) => (
                      <TableRow key={entry.activity_id}>
                        <TableCell>{entry.set_number}</TableCell>
                        <TableCell>{entry.repetitions || "-"}</TableCell>
                        <TableCell>{entry.weight_score || "-"}</TableCell>
                        <TableCell>{entry.rpe_score || "-"}</TableCell>
                        <TableCell>{entry.rir_score || "-"}</TableCell>
                        {/* Render other cells if columns were added above */}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground">
              {t("noHistoryFound")}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Helper function to get translations, assuming you might need them
// If you have a common place for this, adjust accordingly.
// For server components:
// import {getTranslations} from 'next-intl/server';
// For client components:
// import {useTranslations} from 'next-intl';
