"use client";

import type {
  Program,
  TraineeOption,
} from "@guy-vaserman/shared-my-training-app";
import { getProgramsByUserId } from "app/backend/actions";
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
import { Label } from "app/components/ui/label";
import { cn, concatTraineeName } from "app/libs/utils";
import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useLocaleInfo } from "app/hooks/use-locale-info";

interface TraineeSelectionProps {
  trainees: TraineeOption[];
  selectedUserId: string | null;
  onSelectionChange: (id: string | null) => void;
  disabled?: boolean;
  dir: string;
}

function TraineeSelection({
  trainees,
  selectedUserId,
  onSelectionChange,
  disabled,
  dir,
}: TraineeSelectionProps) {
  const t = useTranslations("Components.ProgramBuilder");
  return (
    <Command className="rounded-lg border shadow-md" dir={dir}>
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

interface LoadProgramDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  trainees: TraineeOption[];
  onLoadProgram: (programId: number) => Promise<void>;
  onCancel: () => void;
  preselectedUserId?: string | null;
}

export function LoadProgramDialog({
  isOpen,
  onOpenChange,
  trainees,
  onLoadProgram,
  onCancel,
  preselectedUserId,
}: LoadProgramDialogProps) {
  const t = useTranslations("Components.ProgramBuilder");
  const tCommon = useTranslations("Common");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [availablePrograms, setAvailablePrograms] = useState<any[]>([]);
  const [isFetchingPrograms, setIsFetchingPrograms] = useState(false);
  const { dir } = useLocaleInfo();

  const fetchProgramsForUser = async (userId: number) => {
    setIsFetchingPrograms(true);
    try {
      const response = await getProgramsByUserId(userId);
      if (response.success) {
        const { data, message } = response;
        if (data && Array.isArray(data) && data.length > 0) {
          setAvailablePrograms(data);
        } else {
          setAvailablePrograms([]);
        }
      } else {
        setAvailablePrograms([]);
      }
    } catch (error) {
      console.error("Error fetching programs:", error);
      setAvailablePrograms([]);
    } finally {
      setIsFetchingPrograms(false);
    }
  };

  useEffect(() => {
    if (selectedUserId) {
      fetchProgramsForUser(Number(selectedUserId));
    }
  }, [selectedUserId]);

  useEffect(() => {
    if (isOpen && preselectedUserId && !selectedUserId) {
      setSelectedUserId(preselectedUserId);
    }
  }, [isOpen, preselectedUserId, selectedUserId]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedUserId(null);
      setAvailablePrograms([]);
    }
  }, [isOpen]);

  const handleUserSelected = async (userId: string | null) => {
    setSelectedUserId(userId);
  };

  const loadSelectedProgram = (program: Program) => {
    if (!program.program_plan_id) return;
    onLoadProgram(program.program_plan_id);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh]  overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("loadExistingProgramTitle")}</DialogTitle>
          <DialogDescription>
            {!selectedUserId
              ? t("selectTraineeToView")
              : availablePrograms.length > 1
                ? t("selectProgramToLoad")
                : t("loadingProgram")}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label dir={dir} htmlFor="user">
              {t("trainee")}
            </Label>
            <TraineeSelection
              trainees={trainees}
              selectedUserId={selectedUserId}
              onSelectionChange={handleUserSelected}
              disabled={isFetchingPrograms}
              dir={dir}
            />
          </div>
          <div className="space-y-4">
            <div className="text-sm font-medium">
              {selectedUserId &&
                availablePrograms.length > 0 &&
                t("availablePrograms")}
            </div>
            <div className="grid gap-2 min-h-[200px]">
              {selectedUserId &&
                availablePrograms &&
                availablePrograms.length > 0 &&
                availablePrograms.map((program) => (
                  <Button
                    key={program.program_plan_id}
                    variant="outline"
                    className={cn(
                      "justify-start font-normal",
                      program.is_active && "text-primary",
                    )}
                    onClick={() => loadSelectedProgram(program)}
                    disabled={isFetchingPrograms}
                  >
                    {program.english_name}
                    {program.is_active && (
                      <span className="ml-auto text-xs">({t("active")})</span>
                    )}
                  </Button>
                ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isFetchingPrograms}
          >
            {selectedUserId && availablePrograms.length > 0
              ? tCommon("back")
              : tCommon("cancel")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
