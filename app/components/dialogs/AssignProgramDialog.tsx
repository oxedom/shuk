"use client";
import type { TraineeOption } from "@guy-vaserman/shared-my-training-app";
import { Switch } from "app/components/ui/switch";
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
import { Input } from "app/components/ui/input";
import { Label } from "app/components/ui/label";
import { cn, concatTraineeName } from "app/libs/utils";
import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

interface TraineeSelectionProps {
  trainees: TraineeOption[];
  selectedUserId: string | null;
  onSelectionChange: (id: string | null) => void;
  disabled?: boolean;
}

function TraineeSelection({
  trainees,
  selectedUserId,
  onSelectionChange,
  disabled,
}: TraineeSelectionProps) {
  const t = useTranslations("Components.ProgramBuilder");
  const tCommon = useTranslations("Common");
  return (
    <Command className="rounded-lg border shadow-md">
      <CommandInput placeholder={t("searchTraineesPlaceholder")} />
      <CommandList className="h-48">
        <CommandEmpty>{t("noTraineesFound")}</CommandEmpty>
        <CommandGroup>
          {trainees.map((trainee: TraineeOption) => (
            <CommandItem
              key={trainee.user_id}
              value={concatTraineeName(trainee).toLowerCase()}
              onSelect={() => onSelectionChange(trainee.user_id.toString())}
              className="cursor-pointer"
              disabled={disabled}
            >
              <Check
                className={cn(
                  "mr-2 h-4 w-4",
                  selectedUserId === trainee.user_id.toString()
                    ? "opacity-100"
                    : "opacity-0",
                )}
              />
              {concatTraineeName(trainee)}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

interface AssignProgramDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  trainees: TraineeOption[];
  onAssign: ({
    userId,
    estimatedWorkouts,
    makeMain,
  }: {
    userId: number;
    estimatedWorkouts: number | null;
    makeMain: boolean;
  }) => Promise<void>;
  isAssigning: boolean;
}

export function AssignProgramDialog({
  isOpen,
  onOpenChange,
  trainees,
  onAssign,
  isAssigning,
}: AssignProgramDialogProps) {
  const t = useTranslations("Components.ProgramBuilder");
  const tCommon = useTranslations("Common");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [estimatedWorkouts, setEstimatedWorkouts] = useState<number | null>(
    null,
  );
  const [makeMain, setMakeMain] = useState<boolean>(true);
  const handleClose = () => {
    setSelectedUserId(null);
    setEstimatedWorkouts(null);
    onOpenChange(false);
  };

  const handleAssign = async () => {
    if (!selectedUserId) return;
    onAssign({
      userId: Number.parseInt(selectedUserId),
      estimatedWorkouts,
      makeMain,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("assignWorkoutTitle")}</DialogTitle>
          <DialogDescription>
            {t("selectTraineesDescription")}
          </DialogDescription>
        </DialogHeader>
        <TraineeSelection
          trainees={trainees}
          selectedUserId={selectedUserId}
          onSelectionChange={setSelectedUserId}
          disabled={isAssigning}
        />

        <div className="flex flex-col gap-2">
          <Label htmlFor="estimatedWorkouts">
            Estimated amount of workouts
          </Label>
          <Input
            id="estimatedWorkouts"
            type="number"
            min={0}
            max={100}
            value={estimatedWorkouts ?? ""}
            onChange={(e) => {
              const value = Number.parseInt(e.target.value);
              if (value > 100) return;
              setEstimatedWorkouts(value);
            }}
            placeholder="Enter number of workouts"
            disabled={isAssigning}
          />
          <div className="flex items-center gap-2">
            <Switch
              dir="ltr"
              id="makeMain"
              checked={makeMain}
              onCheckedChange={setMakeMain}
            />
            <Label htmlFor="makeMain">{t("makeMainProgram")}</Label>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isAssigning}
          >
            {tCommon("cancel")}
          </Button>
          <Button
            onClick={handleAssign}
            disabled={!selectedUserId || isAssigning}
          >
            {isAssigning
              ? t("assigning")
              : `${t("assign")} (${selectedUserId ? 1 : 0})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
