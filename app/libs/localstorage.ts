import {
  WorkoutInputSetUnit,
  WorkoutTypeEnum,
} from "@guy-vaserman/shared-my-training-app";

type SingleSessionStorageData = {
  workoutInputData: WorkoutInputSetUnit[][];
  comments: string[];
  timestamp?: number;
};

export function setSessionStorageById(
  workoutInstanceId: number,
  data: SingleSessionStorageData,
  workoutType: WorkoutTypeEnum,
) {
  validateAppVersion();
  try {
    // Get all existing sessions first
    const sessions = JSON.parse(
      localStorage.getItem(workoutType + "_sessions") || "{}",
    );
    const date = new Date();
    data.timestamp = date.getTime();
    // Update the specific session
    sessions[workoutInstanceId] = data;
    localStorage.setItem(workoutType + "_sessions", JSON.stringify(sessions));
  } catch (err) {
    console.error("Failed to save workout data to storage:", err);
  }
}

export function getSessionStorageById(
  workoutInstanceId: number,
  workoutType: WorkoutTypeEnum,
) {
  validateAppVersion();
  try {
    const sessions = JSON.parse(
      localStorage.getItem(workoutType + "_sessions") || "{}",
    );
    return sessions[workoutInstanceId] || null;
  } catch (err) {
    console.error("Failed to get workout data from storage:", err);
    return null;
  }
}

export function deleteSessionStorageById(
  workoutInstanceId: number,
  workoutType: WorkoutTypeEnum,
) {
  validateAppVersion();
  const sessions = JSON.parse(
    localStorage.getItem(workoutType + "_sessions") || "{}",
  );
  delete sessions[workoutInstanceId];
  localStorage.setItem(workoutType + "_sessions", JSON.stringify(sessions));
}

//TODO: Would rather have this run in client layout once and not for each action
export function validateAppVersion(switchOff = true) {
  if (switchOff) return;

  try {
    const mostRecentBuildId = process.env.NEXT_PUBLIC_BUILD_ID;
    if (!mostRecentBuildId) {
      console.error("NEXT_PUBLIC_BUILD_ID is not set");
      return;
    }

    const usersBuildId = localStorage.getItem("build_id");

    if (usersBuildId !== mostRecentBuildId) {
      localStorage.clear();
    }
    localStorage.setItem("build_id", mostRecentBuildId);
  } catch (error) {
    console.error("Failed to validate app version:", error);
  }
}
