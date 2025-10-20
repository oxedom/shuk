"use client";
import { Button } from "app/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "app/components/ui/dialog";
import { useTranslations } from "next-intl";
import { Lock, Unlock } from "lucide-react";
import { ProgramPlanInstance } from "@guy-vaserman/shared-my-training-app";

interface ManageProgramPlansDialogProps {
  isOpen: boolean;
  onClose: () => void;
  activeProgramPlan: ProgramPlanInstance | null;
  nonActiveProgramPlans: ProgramPlanInstance[];
  onActivatePlan: (programPlanId: number) => void;
  onLockPlan: (programPlanId: number) => void;
  onDeletePlan: (programPlanId: number) => void;
  activatingOrLockingPlanId: number | null;
  deletingPlanId: number | null;
}

export function ManageProgramPlansDialog({
  isOpen,
  onClose,
  activeProgramPlan,
  nonActiveProgramPlans,
  onActivatePlan,
  onLockPlan,
  onDeletePlan,
  activatingOrLockingPlanId,
  deletingPlanId,
}: ManageProgramPlansDialogProps) {
  const t = useTranslations("Components.TraineeList");

  const isPlanProcessing = (planId: number) => {
    return activatingOrLockingPlanId === planId || deletingPlanId === planId;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("manageProgramPlans")}</DialogTitle>
          <DialogDescription>
            {t("manageProgramPlansDescription")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Active Plan Section */}
          <div>
            <h3 className="text-lg font-semibold mb-2">{t("activePlan")}</h3>
            {activeProgramPlan ? (
              <div className="p-4 border rounded-lg ">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-primary">
                      {activeProgramPlan.english_name}
                    </h4>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={() =>
                      onDeletePlan(activeProgramPlan.program_plan_id)
                    }
                    disabled={
                      deletingPlanId === activeProgramPlan.program_plan_id
                    }
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">{t("noActivePlan")}</p>
            )}
          </div>

          {/* TODO BUG WITH LOCKING RESPONSIVE NESS AND OPTMISTIC UI */}
          {/* Available Plans Section */}
          <div>
            <h3 className="text-lg font-semibold mb-2">
              {t("availablePlans")}
            </h3>
            <div className="space-y-2">
              {nonActiveProgramPlans.map((plan) => (
                <div
                  key={plan.program_plan_id}
                  className="p-4 border rounded-lg"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">{plan.english_name}</h4>
                      <p className="text-sm text-gray-500">
                        {plan.hebrew_name}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => onActivatePlan(plan.program_plan_id)}
                        disabled={isPlanProcessing(plan.program_plan_id)}
                      >
                        {t("activate")}
                      </Button>
                      <Button
                        variant={plan.is_locked ? "destructive" : "outline"}
                        onClick={() => onLockPlan(plan.program_plan_id)}
                        disabled={isPlanProcessing(plan.program_plan_id)}
                      >
                        {plan.is_locked ? (
                          <Lock size={16} />
                        ) : (
                          <Unlock size={16} />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => onDeletePlan(plan.program_plan_id)}
                        disabled={isPlanProcessing(plan.program_plan_id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {nonActiveProgramPlans.length === 0 && (
                <p className="text-gray-500">{t("noAvailablePlans")}</p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
