"use client";

import { Button } from "app/components/ui/button";
import { CardTitle } from "app/components/ui/card";
import { useLocaleInfo } from "app/hooks/use-locale-info";
import { useTranslations } from "next-intl";

interface WorkoutHeaderProps {
  name: string;
  onEditName: () => void;
  onAssign: () => void;
  assignButtonDisabled?: boolean;
  onUpdateProgram?: () => void;
  loadedProgramData?: {
    user_id: number | null;
    program_plan_id: number | null;
  };
  traineeName?: string;
  isUpdating?: boolean;
}

export default function WorkoutHeader({
  name,
  onEditName,
  onAssign,
  assignButtonDisabled,
  onUpdateProgram,
  loadedProgramData,
  traineeName,
  isUpdating = false,
}: WorkoutHeaderProps) {
  const t = useTranslations("Components.ProgramBuilder");
  const tCommon = useTranslations("Common");
  const { dir } = useLocaleInfo();
  return (
    <div dir={dir} className="flex  items-center gap-2">
      <div dir={dir} className="flex gap-2">
        <Button
          variant="outline"
          className="bg-white rounded-2xl  text-black"
          disabled={assignButtonDisabled}
          onClick={onAssign}
        >
          {t("assignToTrainee")}
        </Button>

        <Button
          onClick={onUpdateProgram}
          disabled={
            isUpdating ||
            loadedProgramData?.user_id === null ||
            loadedProgramData?.program_plan_id === null
          }
          variant="outline"
          className="bg-white rounded-2xl text-black"
        >
          {t("updateProgramForTrainee", { traineeName: traineeName || "" })}
        </Button>
      </div>
      <p className="font-bold">
        <span
          className="cursor-pointer hover:text-primary"
          onClick={onEditName}
        >
          {name}
        </span>
      </p>
    </div>
  );
}
