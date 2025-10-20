"use client"; // This component needs client-side interactivity

import {
  activateProgramPlan,
  deleteProgramPlanById,
  getProgramPlansByUserId,
  lockProgramPlan,
} from "app/backend/actions";
import { Button } from "app/components/ui/button";
import { Input } from "app/components/ui/input";
import { ScrollArea } from "app/components/ui/scroll-area";
import { toast } from "app/hooks/use-toast";
import { concatTraineeName } from "app/libs/utils";
import { Calendar, Pencil, BarChart3 } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ManageProgramPlansDialog } from "./dialogs/ManageProgramPlansDialog";
import { useConfirmDialog } from "./dialogs/ConfirmDialog";
import useGlobalStore from "app/store/globalStore";
import {
  ProgramPlanInstance,
  TraineeOption,
} from "@guy-vaserman/shared-my-training-app";
interface TraineeListProps {
  initialTrainees: TraineeOption[];
}

export function TraineeList({ initialTrainees }: TraineeListProps) {
  const t = useTranslations("Components.TraineeList");
  const tCommon = useTranslations("Common");
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTraineeId, setSelectedTraineeId] = useState<number | null>(
    null,
  );
  const [isManageProgramPlansOpen, setIsManageProgramPlansOpen] =
    useState(false);
  const [activeProgramPlan, setActiveProgramPlan] =
    useState<ProgramPlanInstance | null>(null);
  const [nonActiveProgramPlans, setNonActiveProgramPlans] = useState<
    ProgramPlanInstance[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activatingOrLockingPlanId, setActivatingOrLockingPlanId] = useState<
    number | null
  >(null);
  const [deletingPlanId, setDeletingPlanId] = useState<number | null>(null);
  const { handleLinkClick } = useGlobalStore();

  const fetchAndUpdateProgramPlans = async (traineeId: number) => {
    try {
      setIsLoading(true);
      setSelectedTraineeId(traineeId);

      const response = await getProgramPlansByUserId(traineeId);

      if (!response.success) {
        alert(response.message);
        return;
      }

      const programPlans = response.data || [];
      const activePlan = programPlans.find(
        (plan: ProgramPlanInstance) => plan.is_active,
      );
      const nonActivePlans = programPlans.filter(
        (plan: ProgramPlanInstance) => !plan.is_active,
      );

      setActiveProgramPlan(activePlan || null);
      setNonActiveProgramPlans(nonActivePlans);
    } catch (err) {
      toast({
        title: "Failed to fetch program plans",
        description:
          err instanceof Error ? err.message : "Failed to fetch program plans",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLockAccount = (traineeId: number) => {
    alert("handleLockAccount");
  };

  const handleManageProgramPlans = async (traineeId: number) => {
    await fetchAndUpdateProgramPlans(traineeId);
    setIsManageProgramPlansOpen(true);
  };

  const handleRefreshPlans = async () => {
    if (selectedTraineeId) await fetchAndUpdateProgramPlans(selectedTraineeId);
  };

  const handleActivatePlan = async (programPlanId: number) => {
    setActivatingOrLockingPlanId(programPlanId);
    try {
      const { success, message } = await activateProgramPlan(programPlanId);
      if (success) {
        toast({
          title: t("planActivatedSuccess"),
          description: message,
        });
        await handleRefreshPlans();
      } else {
        toast({
          title: "Error activating plan",
          description: message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error activating plan",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setActivatingOrLockingPlanId(null);
    }
  };

  const handleLockPlan = async (programPlanId: number) => {
    setActivatingOrLockingPlanId(programPlanId);
    try {
      const { success, message } = await lockProgramPlan(programPlanId);
      if (success) {
        toast({
          title: t("planLockedSuccess"),
          description: message,
        });
        await handleRefreshPlans();
      } else {
        toast({
          title: "Error locking plan",
          description: message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error locking plan",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setActivatingOrLockingPlanId(null);
    }
  };

  const handleDeletePlan = async (programPlanId: number) => {
    await confirm({
      title: t("confirmDeletePlan"),
      message: t("confirmDeletePlanMessage"),
      confirmLabel: tCommon("delete"),
      cancelLabel: tCommon("cancel"),
      onConfirm: async () => {
        setDeletingPlanId(programPlanId);
        try {
          await deleteProgramPlanById(programPlanId);
          toast({
            title: t("planDeletedSuccess"),
            description: t("planDeletedDescription"),
          });
          await handleRefreshPlans();
        } catch (error) {
          toast({
            title: "Error deleting plan",
            description:
              error instanceof Error
                ? error.message
                : "An unexpected error occurred.",
            variant: "destructive",
          });
        } finally {
          setDeletingPlanId(null);
        }
      },
    });
  };

  // Filter trainees based on search term
  const filteredTrainees = useMemo(() => {
    if (!searchTerm) {
      return initialTrainees;
    }
    return initialTrainees.filter((trainee) =>
      concatTraineeName(trainee)
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
    );
  }, [initialTrainees, searchTerm]);

  return (
    <div className="lg:grid grid-cols-10 ">
      <div className="col-start-2 col-span-full">
        <Input
          type="text"
          placeholder={t("searchByNamePlaceholder")}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm bg-card"
        />
      </div>
      <ScrollArea className="mt-4 col-span-6 col-start-2 lg:max-h-[600px] ">
        <div className="space-y-3">
          {filteredTrainees.length > 0 ? (
            filteredTrainees.map((trainee: TraineeOption) => (
              <div
                key={trainee.user_id}
                className=" p-4 border bg-card rounded-lg shadow-sm hover:shadow transition-shadow "
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-base">
                      {concatTraineeName(trainee)}
                    </h4>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      prefetch={true}
                      onClick={() =>
                        handleLinkClick(`/statistics?tId=${trainee.user_id}`)
                      }
                      href={`/statistics?tId=${trainee.user_id}`}
                      className="hidden lg:inline-flex h-8 w-8  items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground"
                      title={t("userStats")}
                    >
                      <BarChart3 size={16} />
                    </Link>

                    <Link
                      prefetch={true}
                      onClick={() =>
                        handleLinkClick(`/builder?tId=${trainee.user_id}`)
                      }
                      href={`/builder?tId=${trainee.user_id}`}
                      className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground"
                      title={t("builder")}
                    >
                      <Pencil size={16} />
                    </Link>

                    {/* <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          title={t('lockAccount')}
                          onClick={() => handleLockAccount(trainee.user_id)}
                        >
                          <Lock size={16} />
                        </Button> */}

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      title={t("manageProgramPlans")}
                      onClick={() => handleManageProgramPlans(trainee.user_id)}
                      disabled={isLoading}
                    >
                      <Calendar size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full p-4 border rounded-lg text-center">
              <p className="text-gray-500">
                {searchTerm ? t("noTraineesMatchSearch") : t("noTraineesFound")}
              </p>
            </div>
          )}
        </div>
      </ScrollArea>

      <ManageProgramPlansDialog
        isOpen={isManageProgramPlansOpen}
        onClose={() => {
          setIsManageProgramPlansOpen(false);
          setSelectedTraineeId(null);
        }}
        activeProgramPlan={activeProgramPlan}
        nonActiveProgramPlans={nonActiveProgramPlans}
        onActivatePlan={handleActivatePlan}
        onDeletePlan={handleDeletePlan}
        onLockPlan={handleLockPlan}
        activatingOrLockingPlanId={activatingOrLockingPlanId}
        deletingPlanId={deletingPlanId}
      />
      <ConfirmDialog />
    </div>
  );
}
