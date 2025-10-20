"use client";
import type {
  ProgramPlanWorkoutExerciseInstance,
  WorkoutInputSetUnit,
} from "@guy-vaserman/shared-my-training-app";
import { useTranslations } from "next-intl";
import { Input } from "./input";
import { Label } from "./label";
import { useState, useEffect } from "react";
import { REPETITIONS, WEIGHT_SCORE, RPE_SCORE, RIR_SCORE } from "app/shared";

// Helper function to create formatted placeholder
function createFormattedPlaceholder({
  min,
  max,
  fallback,
  unit,
}: {
  min: number;
  max?: number;
  fallback: string;
  unit: string;
}) {
  // Check that min is a number
  const isMinNumber = typeof min === "number";
  const isMaxNumber = typeof max === "number";

  if (!isMinNumber) {
    return fallback;
  }

  if (!isMaxNumber || min === max) {
    return `${min}`;
  }

  return `${min} - ${max}`;
}

export interface SetInputProps {
  index: number;
  activeExercise: ProgramPlanWorkoutExerciseInstance;
  isLastSet: boolean;
  addSetToExercise: () => void;
  onChange: (
    value: string,
    field: string | "repetitions" | "weight_score",
  ) => void;
  disabled?: boolean;
  workoutInputData: WorkoutInputSetUnit;
}

// Define ManagedInputProps interface
interface ManagedInputProps {
  idPrefix: string;
  index: number;
  labelContent: string;
  currentValue: string; // Value from parent state (e.g., workoutInputData.weight_score)
  onValueChange: (newValue: string) => void; // Callback to update parent state
  placeholderArgs: Parameters<typeof createFormattedPlaceholder>[0];
  inputProps: {
    type?: string;
    min?: number;
    max?: number;
    step?: number | string;
    inputMode?:
      | "none"
      | "text"
      | "tel"
      | "url"
      | "email"
      | "numeric"
      | "decimal"
      | "search";
  };
  disabled?: boolean;
}

// ManagedInput component implementation
function ManagedInput({
  idPrefix,
  index,
  labelContent,
  currentValue,
  onValueChange,
  placeholderArgs,
  inputProps,
  disabled,
}: ManagedInputProps) {
  const [internalValue, setInternalValue] = useState<string>(currentValue);
  const [valueOnFocus, setValueOnFocus] = useState<string>("");
  const [isFocused, setIsFocused] = useState<boolean>(false);

  useEffect(() => {
    // If the input is not focused, ensure internalValue reflects currentValue.
    // This handles initial load and external updates if the prop changes.
    if (!isFocused) {
      setInternalValue(currentValue);
    }
  }, [currentValue, isFocused]);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (disabled) return;
    setValueOnFocus(currentValue); // Store the actual current data value from prop
    setInternalValue(""); // Clear display for editing
    setIsFocused(true);
  };

  //TODO a bit arvy
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const newValue = e.target.value;

    // Allow empty string for editing
    if (newValue === "") {
      setInternalValue(newValue);
      onValueChange(newValue);
      return;
    }

    // Validate against min/max constraints
    const numericValue = parseFloat(newValue);

    // Check if it's a valid number
    if (isNaN(numericValue)) {
      return; // Don't update if not a valid number
    }

    // Check min constraint
    if (inputProps.min !== undefined && numericValue < inputProps.min) {
      return; // Don't update if below minimum
    }

    // Check max constraint
    if (inputProps.max !== undefined && numericValue > inputProps.max) {
      return; // Don't update if above maximum
    }

    if (inputProps.type === "number" || inputProps.type === "decimal") {
      setInternalValue(numericValue.toString());
      // @ts-ignore
      onValueChange(numericValue); // Pass the numeric value
      return;
    }

    setInternalValue(newValue);
    onValueChange(newValue); // Pass the string value, conversion will happen in parent
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (disabled) return;
    setIsFocused(false);
    // If internalValue is empty after focus (meaning user cleared and didn't type)
    // Check e.target.value as well because internalValue might not have updated yet if blur happens rapidly
    if (internalValue.trim() === "" || e.target.value.trim() === "") {
      // Restore visual and parent state to what it was when focus started
      setInternalValue(valueOnFocus);
      onValueChange(valueOnFocus); // Make sure to update the parent as well
    }
    // If user typed something, internalValue is already set, and onValueChange was called.
    // The useEffect will then sync internalValue with currentValue if parent accepted the change.
  };

  return (
    <div>
      <div className="relative flex flex-col items-center ">
        <div className="absolute -top-7">
          {index === 0 && (
            <Label
              htmlFor={`${idPrefix}-${index}`}
              className="opacity-70 font-bold"
            >
              {labelContent}
            </Label>
          )}
        </div>
        <Input
          disabled={disabled}
          type={inputProps.type || "number"}
          className="text-center no-arrows border-secondary-foreground/20 rounded-2xl "
          id={`${idPrefix}-${index}`}
          min={inputProps.min}
          max={inputProps.max}
          value={disabled ? currentValue : internalValue} // Bind to internalValue, or currentValue if disabled
          inputMode={inputProps.inputMode || "decimal"}
          placeholder={
            placeholderArgs ? createFormattedPlaceholder(placeholderArgs) : ""
          }
          onFocus={handleFocus}
          onChange={handleChange}
          onBlur={handleBlur}
        />
      </div>
    </div>
  );
}

export default function SetInput({
  index,
  activeExercise,
  onChange,
  disabled,
  workoutInputData,
  isLastSet,
}: SetInputProps) {
  const t = useTranslations("Components.TraineePlayMenu");
  const tCommon = useTranslations("Common");

  interface setInputConfigType {
    isActive: boolean;
    idPrefix: string;
    labelContent: string;
    placeholderArgs: Parameters<typeof createFormattedPlaceholder>[0] | null;
    inputProps: ManagedInputProps["inputProps"];
  }

  const setInputs: Record<string, setInputConfigType> = {
    weight_score: {
      isActive: true,
      idPrefix: "weight",
      labelContent: tCommon("weight"),
      placeholderArgs: null,
      inputProps: {
        type: "number",
        min: WEIGHT_SCORE.min,
        max: WEIGHT_SCORE.max,
        inputMode: "decimal",
      },
    },
    repetitions: {
      isActive: true,
      idPrefix: "reps",
      labelContent: tCommon("reps"),
      placeholderArgs: null,
      inputProps: {
        type: "number",
        min: REPETITIONS.min,
        max: REPETITIONS.max,
        inputMode: "decimal",
      },
    },
    rpe_score: {
      isActive: activeExercise.track_rpe_score,
      idPrefix: "rpe",
      labelContent: tCommon("rpe"),
      placeholderArgs: {
        min: RPE_SCORE.min,
        max: RPE_SCORE.max,
        fallback: tCommon("rpe"),
        unit: "",
      },
      inputProps: {
        type: "number",
        min: RPE_SCORE.min,
        max: RPE_SCORE.max,
        inputMode: "decimal",
      },
    },
    rir_score: {
      isActive: activeExercise.track_rir_score,
      idPrefix: "rir",
      labelContent: tCommon("rir"),
      placeholderArgs: {
        min: RIR_SCORE.min,
        max: RIR_SCORE.max,
        fallback: tCommon("rir"),
        unit: "",
      },
      inputProps: {
        type: "number",
        min: RIR_SCORE.min,
        max: RIR_SCORE.max,
        inputMode: "decimal",
      },
    },
  };

  return (
    <div
      className={`flex  gap-x-2 ${
        !isLastSet ? "border-b-white border-opacity-25 border-b pb-3" : ""
      }`}
    >
      <div className="flex items-center gap-x-2">
        <span className="text-sm "> {t("set", { index: index + 1 })} </span>
      </div>
      <div className="flex gap-x-2">
        {Object.entries(setInputs)
          .filter(([, config]) => config.isActive)
          .map(([field, config]) => (
            <ManagedInput
              key={field}
              idPrefix={config.idPrefix}
              index={index}
              labelContent={config.labelContent}
              //@ts-ignore
              currentValue={(workoutInputData[field] ?? "").toString()}
              onValueChange={(value) => onChange(value, field)}
              //@ts-ignore
              placeholderArgs={config.placeholderArgs || null}
              inputProps={config.inputProps}
              disabled={disabled}
            />
          ))}
      </div>
    </div>
  );
}
