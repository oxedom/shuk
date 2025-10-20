"use client";

import { useState, useEffect } from "react";

import { useTranslations } from "next-intl";
import { ExercisePersonalRecord } from "@guy-vaserman/shared-my-training-app";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "app/components/ui/card";
import { Badge } from "app/components/ui/badge";
import { Button } from "app/components/ui/button";
import { Input } from "app/components/ui/input";
import {
  Trophy,
  Calendar,
  Target,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import { NumberTicker } from "app/components/magicui/number-ticker";
import { useLocaleInfo } from "app/hooks/use-locale-info";

import { getExerciseHistoryByExerciseIdAndUserId } from "app/backend/actions";
import { toast } from "app/hooks/use-toast";
import ExerciseHistoryDialog from "app/components/dialogs/ExerciseHistoryDialog";
import { WorkoutActivityInstance } from "packages/shared-my-training-app/src";

interface PersonalRecordsChartProps {
  records: ExercisePersonalRecord[];
  className?: string;
  userId: number;
}

export default function PersonalRecordsChart({
  records,
  className,
  userId,
}: PersonalRecordsChartProps) {
  const t = useTranslations(
    "Components.TraineeAnalyticsDashboard.personalRecords",
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { dir, isRtl, isHebrew } = useLocaleInfo();

  // Exercise history dialog state
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [exerciseHistoryMap, setExerciseHistoryMap] = useState<{
    [id: number]: WorkoutActivityInstance[] | null;
  }>({});
  const [selectedExerciseId, setSelectedExerciseId] = useState<number | null>(
    null,
  );

  // Get userId from analytics context

  // Normalize text for search - handle Hebrew, English, and special characters
  const normalizeText = (text: string): string => {
    if (!text) return "";
    return text
      .toLowerCase()
      .trim()
      .replace(/[\u0590-\u05FF\u200F\u200E]/g, (match) => match) // Keep Hebrew chars
      .replace(/[^\u0590-\u05FF\w\s]/g, ""); // Remove special chars except Hebrew
  };

  // Fuzzy matching function
  const fuzzyMatch = (text: string, query: string): boolean => {
    const normalizedText = normalizeText(text);
    const normalizedQuery = normalizeText(query);

    if (!normalizedQuery) return true; // If query is empty, show all
    if (!normalizedText) return false;

    const queryChars = [...normalizedQuery];
    let textIndex = 0;
    for (const char of queryChars) {
      textIndex = normalizedText.indexOf(char, textIndex);
      if (textIndex === -1) return false;
      textIndex += 1;
    }
    return true;
  };

  // Filter records based on search query
  const filteredRecords = records.filter((record) => {
    if (!searchQuery.trim()) return true;

    const englishMatch = fuzzyMatch(record.englishName, searchQuery);
    const hebrewMatch = fuzzyMatch(record.hebrewName, searchQuery);

    return englishMatch || hebrewMatch;
  });

  // Function to fetch exercise history and open dialog
  const handleViewExerciseHistory = async (exerciseId: number) => {
    try {
      setSelectedExerciseId(exerciseId);

      // Check if we already have the history cached
      if (exerciseHistoryMap[exerciseId] !== undefined) {
        setIsHistoryDialogOpen(true);
        return;
      }

      const { success, message, data } =
        await getExerciseHistoryByExerciseIdAndUserId(exerciseId, userId);

      if (success) {
        setExerciseHistoryMap((prev) => ({
          ...prev,
          [exerciseId]: data ?? null,
        }));
        setIsHistoryDialogOpen(true);
      } else {
        toast({ title: "Error", description: message, variant: "destructive" });
      }
    } catch (error) {
      console.error("Error fetching exercise history:", error);
      toast({
        title: "Error",
        description: "Failed to fetch exercise history.",
        variant: "destructive",
      });
    }
  };

  // Check if mobile on client side
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Calculate records per page based on screen size
  const recordsPerPage = isMobile ? 4 : 8;
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);

  // Get current page data
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const currentRecords = filteredRecords.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  if (records.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-4">
          <Trophy className="text-muted-foreground" />
          <p className="text-muted-foreground text-center">{t("noRecords")}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div dir={dir} className={className}>
      <div>
        {/* Header with search and pagination info */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <h2 className="text-xl font-semibold">{t("title")}</h2>
              <Badge variant="outline">
                {filteredRecords.length} {t("totalRecords")}
              </Badge>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative lg:w-1/4 border rounded-lg">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder={t("searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* No search results message */}
        {filteredRecords.length === 0 && searchQuery.trim() && (
          <div className="flex flex-col items-center justify-center py-8">
            <Search className="text-muted-foreground h-8 w-8 mb-2" />
            <p className="text-muted-foreground text-center">
              {t("noSearchResults")}
            </p>
          </div>
        )}

        {/* Individual Records Grid */}
        {filteredRecords.length > 0 && (
          <div className="mt-4 grid gap-4 grid-cols-1 lg:grid-cols-4">
            {currentRecords.map((record, index) => {
              return (
                <Card
                  dir={dir}
                  key={record.exerciseId}
                  className="hover:shadow-md transition-shadow  h-full lg:min-h-[220px] flex flex-col"
                >
                  <CardHeader>
                    <CardTitle className="flex items-start justify-between text-lg">
                      <span className="font-semibold line-clamp-2 leading-tight">
                        {isHebrew ? record.hebrewName : record.englishName}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-between space-y-2">
                    <div className="space-y-3">
                      <div className="flex flex-col gap-2">
                        <div>
                          <Target className="h-4 w-4 text-primary" />
                          <span className="text-2xl font-bold text-primary">
                            <NumberTicker value={record.recordValue} />{" "}
                            {t("weightUnit")}
                          </span>
                        </div>
                        {
                          <span className="text-sm text-muted-foreground">
                            {record.previousRecord !== undefined &&
                            record.previousRecord !== null ? (
                              <>
                                {t("previousRecord")} {record.previousRecord}{" "}
                                {t("weightUnit")}
                              </>
                            ) : (
                              t("noPreviousRecord")
                            )}
                          </span>
                        }
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {t("achievedOn")}{" "}
                          {record.achievedDate.toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleViewExerciseHistory(record.exerciseId)
                          }
                        >
                          {t("viewExerciseHistory")}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && filteredRecords.length > 0 && (
          <div
            dir={dir}
            className="flex mt-4 items-center justify-center flex-wrap gap-2"
          >
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="flex items-center gap-1"
            >
              {isRtl ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
              {t("previous")}
            </Button>

            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                    className="w-8 h-8 p-0"
                  >
                    {page}
                  </Button>
                ),
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1"
            >
              {t("next")}
              {isRtl ? (
                <ChevronLeft className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Exercise History Dialog */}
      <ExerciseHistoryDialog
        isOpen={isHistoryDialogOpen}
        onOpenChange={(value) => {
          if (value === false) setSelectedExerciseId(null);
          setIsHistoryDialogOpen(value);
        }}
        exerciseHistory={
          selectedExerciseId ? exerciseHistoryMap[selectedExerciseId] : null
        }
        activeExerciseName={
          selectedExerciseId
            ? (records.find((r) => r.exerciseId === selectedExerciseId)?.[
                isHebrew ? "hebrewName" : "englishName"
              ] ?? t("unknownExercise"))
            : t("unknownExercise")
        }
      />
    </div>
  );
}
