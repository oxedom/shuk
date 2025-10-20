"use client";

import { Button } from "app/components/ui/button";
import { useTranslations } from "next-intl";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { MoreHorizontal, Plus } from "lucide-react";

interface ProgramActionsProps {
  onLoadExistingProgram: () => void;
  onAddExerciseClick: () => void;
}

export default function ProgramActions({
  onLoadExistingProgram,
  onAddExerciseClick,
}: ProgramActionsProps) {
  const t = useTranslations("Components.ProgramBuilder");
  const tCommon = useTranslations("Common");

  return (
    <div className="flex gap-2 my-1 items-center justify-center">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="icon" className="rounded-lg">
            <MoreHorizontal />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="mx-2 lg:mx-0 w-30 rounded-xl border-secondary-foreground/10">
          <Button
            variant="ghost"
            onClick={onAddExerciseClick}
            className="flex items-center gap-x-2"
          >
            <Plus className="h-4 w-4" />
            <div>{tCommon("addExercise")}</div>
          </Button>
        </PopoverContent>
      </Popover>
      <Button onClick={onLoadExistingProgram} variant="outline">
        {t("loadExistingProgram")}
      </Button>
    </div>
  );
}
