import React, { useEffect, useState } from "react";
import { useGetSolvedProblemsByUserQuery } from "../services/userDataService";
import { useGetContestDataQuery } from "../services/contestDataService";
import { useParams } from "react-router";
import ProblemCard from "../components/block-components/ProblemCard";

export default function ContestPage() {
  const { id } = useParams();
  const { data: solvedProblems } = useGetSolvedProblemsByUserQuery();
  const { data: contest, isLoading, error } = useGetContestDataQuery(id);

  const [timer, setTimer] = useState("--:--:--");

  const getStatus = () => {
    if (!contest) return "";
    const now = new Date();
    const start = new Date(contest.startTime);
    const end = new Date(contest.endTime);

    if (now < start) return "Upcoming";
    if (now > end) return "Ended";
    return "Running";
  };

  const status = getStatus();

  // Countdown Timer
  useEffect(() => {
    if (!contest) return;

    const interval = setInterval(() => {
      const now = new Date();
      const target =
        status === "Upcoming"
          ? new Date(contest.startTime)
          : new Date(contest.endTime);

      const diff = target - now;

      if (diff <= 0) {
        setTimer("00:00:00");
        return;
      }

      const h = String(Math.floor(diff / (1000 * 60 * 60))).padStart(2, "0");
      const m = String(Math.floor((diff / (1000 * 60)) % 60)).padStart(2, "0");
      const s = String(Math.floor((diff / 1000) % 60)).padStart(2, "0");

      setTimer(`${h}:${m}:${s}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [contest, status]);

  // UI states
  if (isLoading) return <p className="text-center py-10 text-gray-400">Loading...</p>;
  if (error) return <p className="text-center text-red-500">Failed to load contest</p>;

  return (
    <div className="max-w-6xl mx-auto px-5 py-10 text-gray-200">

      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{contest.name}</h1>

        <div className="flex items-center gap-4 mt-3">

          <span className={`px-3 py-1 rounded-full text-sm font-medium 
            ${status === "Running" && "bg-green-500/20 text-green-400 border border-green-600/40"} 
            ${status === "Upcoming" && "bg-blue-500/20 text-blue-400 border border-blue-600/40"} 
            ${status === "Ended" && "bg-gray-600/20 text-gray-400 border border-gray-700"}`}>
            {status}
          </span>

          <span className="text-sm opacity-70">•</span>

          <span className="text-sm font-medium">
            {status === "Ended" ? "Contest Finished" : `${status === "Upcoming" ? "Starts in" : "Ends in"}:`}
            <span className="ml-2 text-lg font-semibold text-yellow-400">{timer}</span>
          </span>
        </div>
      </div>

      {/* INFO GRID */}
      <div className="grid grid-cols-3 gap-6 mb-10">

        <div className="bg-gray-800/40 px-4 py-3 rounded-xl border border-gray-700 backdrop-blur-sm">
          <p className="text-xs uppercase tracking-wide text-gray-400">Starts</p>
          <p className="text-sm font-semibold">
            {new Date(contest.startTime).toLocaleString()}
          </p>
        </div>

        <div className="bg-gray-800/40 px-4 py-3 rounded-xl border border-gray-700 backdrop-blur-sm">
          <p className="text-xs uppercase tracking-wide text-gray-400">Ends</p>
          <p className="text-sm font-semibold">
            {new Date(contest.endTime).toLocaleString()}
          </p>
        </div>

        <div className="bg-gray-800/40 px-4 py-3 rounded-xl border border-gray-700 backdrop-blur-sm">
          <p className="text-xs uppercase tracking-wide text-gray-400">Problems</p>
          <p className="text-sm font-semibold">{contest.problems.length}</p>
        </div>
      </div>

      {/* PROBLEMS LIST */}
      <h2 className="text-xl font-semibold mb-3">Problems</h2>

      <div className="space-y-4">
        {contest.problems.map((problem) => (
          <ProblemCard
            key={problem._id}
            problem={problem}
            solvedProblems={solvedProblems}
          />
        ))}
      </div>
    </div>
  );
}
    