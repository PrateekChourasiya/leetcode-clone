import React from "react";
import { NavLink } from "react-router";

const getDifficultyBadgeColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
        case "easy":
            return "badge-success bg-green-900/30 text-green-400 border-green-800";
        case "medium":
            return "badge-warning bg-yellow-900/30 text-yellow-400 border-yellow-800";
        case "hard":
            return "badge-error bg-red-900/30 text-red-400 border-red-800";
        default:
            return "badge-neutral bg-gray-700 text-gray-300 border-gray-600";
    }
};

function ProblemCard({ problem, solvedProblems }) {
    return (
        <div
            key={problem._id}
            className="card bg-gray-800/50 backdrop-blur-sm border border-gray-700 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
        >
            <div className="card-body p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                        <h2 className="card-title text-lg md:text-xl mb-2">
                            <NavLink
                                to={`/problem/${problem._id}`}
                                className="hover:text-blue-400 transition-colors"
                            >
                                {problem.title}
                            </NavLink>
                        </h2>

                        <div className="flex flex-wrap gap-2 mt-2">
                            <div
                                className={`badge ${getDifficultyBadgeColor(
                                    problem.difficulty
                                )} border-0 text-white font-medium py-2`}
                            >
                                {problem.difficulty}
                            </div>
                            <div className="badge badge-info bg-gray-700 text-gray-300 border-gray-600 font-medium py-2">
                                {problem.tags}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center">
                        {solvedProblems.some((sp) => sp._id === problem._id) ? (
                            <div className="badge badge-success gap-2 py-3 px-4 bg-green-900/30 text-green-400 border-green-800">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                Solved
                            </div>
                        ) : (
                            <NavLink
                                to={`/problem/${problem._id}`}
                                className="btn btn-primary bg-gradient-to-r from-blue-500 to-purple-600 border-0 text-white hover:opacity-90 transition-all"
                            >
                                Solve Challenge
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 ml-1"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                                    />
                                </svg>
                            </NavLink>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProblemCard;
