"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "app/components/ui/dialog";
import { useTranslations } from "next-intl";
import { useLocaleInfo } from "app/hooks/use-locale-info";
import { cn } from "app/libs/utils";
import { ExerciseCommentInstance } from "@guy-vaserman/shared-my-training-app";
import { ScrollArea } from "app/components/ui/scroll-area";

interface ExerciseCommentsDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  exerciseComments: ExerciseCommentInstance[];
  exerciseName?: string;
}

export default function ExerciseCommentsDialog({
  isOpen,
  onOpenChange,
  exerciseComments,
  exerciseName,
}: ExerciseCommentsDialogProps) {
  const t = useTranslations("Components.ExerciseCommentsDialog");
  const tCommon = useTranslations("Common");
  const { dir, isRtl } = useLocaleInfo();

  const sortedComments = [...exerciseComments].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        dir={dir}
        className={cn("max-w-[350px] rounded-lg lg:max-w-[500px]")}
      >
        <DialogHeader>
          <DialogTitle>
            <p className="text-lg border-b pb-2">
              {t("title", {
                exerciseName: exerciseName ?? tCommon("exercise"),
              })}
            </p>
          </DialogTitle>
        </DialogHeader>
        <ScrollArea dir={dir} className="py-2 max-h-[50vh] ">
          {sortedComments.length > 0 ? (
            <div className="space-y-4">
              {sortedComments.map((comment) => (
                <div
                  key={comment.exercise_comment_id}
                  className="p-2 rounded-lg"
                >
                  <p className="text-sm text-foreground mb-2">
                    {comment.comment}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(comment.createdAt).toLocaleDateString(
                      isRtl ? "he-IL" : "en-US",
                      {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    )}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              {t("noComments")}
            </p>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
