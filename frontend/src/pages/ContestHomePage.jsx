import { useEffect, useState } from "react";
import { NavLink } from "react-router";
import axiosClient from "../utils/axiosClient";

const PAGE_SIZE = 6;

export default function ContestHomePage() {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState({
    running: 1,
    upcoming: 1,
    finished: 1,
  });

  useEffect(() => {
    const fetchContests = async () => {
      try {
        const res = await axiosClient.get(`/contest`);
        setContests(res.data.contests || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchContests();
  }, []);

  // Categorization logic (Frontend)
  const now = new Date();
  const running = contests.filter(
    (c) => new Date(c.startTime) <= now && new Date(c.endTime) >= now
  );
  const upcoming = contests.filter((c) => new Date(c.startTime) > now);
  const finished = contests.filter((c) => new Date(c.endTime) < now);

  const paginate = (arr, section) => {
    const start = (page[section] - 1) * PAGE_SIZE;
    return arr.slice(start, start + PAGE_SIZE);
  };

  const updatePage = (section, val) => {
    setPage((prev) => ({ ...prev, [section]: val }));
  };

  // ---- UI Components ---
  const StatusBadge = ({ status }) => {
    const colors = {
      running: "from-green-400 to-green-600 shadow-green-500/50",
      upcoming: "from-yellow-400 to-yellow-600 shadow-yellow-500/50",
      finished: "from-red-400 to-red-600 shadow-red-500/50",
    };

    return (
      <span
        className={`px-3 py-1 text-xs rounded-full font-semibold text-black bg-gradient-to-r ${colors[status]} shadow-md`}
      >
        {status.toUpperCase()}
      </span>
    );
  };

  const ContestCard = ({ contest }) => {
    let status = "finished";
    if (new Date(contest.startTime) > now) status = "upcoming";
    if (new Date(contest.startTime) <= now && new Date(contest.endTime) >= now)
      status = "running";

    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5 
      shadow-[0_0_20px_rgba(80,80,255,0.15)] hover:shadow-[0_0_30px_rgba(120,120,255,0.35)]
      hover:-translate-y-1 transition-all duration-300">

        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-bold text-white">
            {contest.name}
          </h2>
          <StatusBadge status={status} />
        </div>

        <p className="text-sm text-gray-400">
          🕒 {new Date(contest.startTime).toLocaleString()} →{" "}
          {new Date(contest.endTime).toLocaleString()}
        </p>

        <p className="mt-3 text-gray-300">
          🧩 Problems:{" "}
          <span className="text-purple-400 font-semibold">
            {contest.problems?.length}
          </span>
        </p>

        <NavLink
          to={`/contest/${contest._id}`}
          className="block w-full text-center mt-5 py-2 rounded-lg
         bg-gradient-to-r from-purple-600 to-blue-500
         hover:opacity-90 transition-all font-semibold text-white"
        >
          View Contest →
        </NavLink>
      </div>
    );
  };

  const Section = ({ title, list, sectionKey }) => (
    <div className="mb-14">
      <h2 className="text-2xl font-semibold mb-5 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
        {title}
      </h2>

      {list.length === 0 ? (
        <div className="text-gray-500 text-center italic pb-6">
          No contests available.
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginate(list, sectionKey).map((c) => (
              <ContestCard key={c._id} contest={c} />
            ))}
          </div>

          {list.length > PAGE_SIZE && (
            <div className="flex justify-center items-center gap-4 mt-6">
              <button
                disabled={page[sectionKey] === 1}
                onClick={() => updatePage(sectionKey, page[sectionKey] - 1)}
                className="px-4 py-2 text-sm bg-gray-700 rounded-lg hover:bg-gray-600 disabled:opacity-30"
              >
                Prev
              </button>

              <span className="text-gray-300 text-sm">
                Page {page[sectionKey]} / {Math.ceil(list.length / PAGE_SIZE)}
              </span>

              <button
                disabled={page[sectionKey] * PAGE_SIZE >= list.length}
                onClick={() => updatePage(sectionKey, page[sectionKey] + 1)}
                className="px-4 py-2 text-sm bg-gray-700 rounded-lg hover:bg-gray-600 disabled:opacity-30"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-12">

        <h1 className="text-4xl font-extrabold text-center mb-4
          bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          🚀 Coding Contests
        </h1>
        <p className="text-center text-gray-400 mb-12">
          Compete, improve skills, and track your progress.
        </p>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-purple-500 border-b-2"></div>
          </div>
        ) : (
          <>
            <Section title="🔥 Running Contests" list={running} sectionKey="running" />
            <Section title="⏳ Upcoming Contests" list={upcoming} sectionKey="upcoming" />
            <Section title="📁 Finished Contests" list={finished} sectionKey="finished" />
          </>
        )}
      </div>
    </div>
  );
}
