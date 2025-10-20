"use client";
// import { loginWithApple } from 'app/backend/actions/index'
import { getWorkoutSummaryByInstanceId } from "app/backend/actions";
export default function ActionTest({
  workoutInstanceId,
}: {
  workoutInstanceId: number;
}) {
  const handleGetWorkoutSummary = async () => {
    const { data, success, message } =
      await getWorkoutSummaryByInstanceId(workoutInstanceId);
    console.log(data, success, message);
  };
  return (
    <button
      className="bg-purple-500 text-white px-4 py-2 rounded-md"
      onClick={handleGetWorkoutSummary}
    >
      Get Workout Summary
    </button>
  );
}
