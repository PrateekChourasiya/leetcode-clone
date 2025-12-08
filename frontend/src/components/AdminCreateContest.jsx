import { useState } from "react";
import axiosClient from "../utils/axiosClient";

export default function AdminCreateContest({ user, handleLogout }) {

  const [formData, setFormData] = useState({
    name: "",
    problems: "",
    startTime: "",
    endTime: "",
  });

  const [status, setStatus] = useState({ loading: false, message: "", type: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, message: "", type: "" });

    const problemsArray = formData.problems.split("\n").map(p => p.trim()).filter(Boolean);

    try {
      await axiosClient.post("/contest/create", {
        ...formData,
        problems: problemsArray,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),        
      });

      setStatus({ type: "success", message: "Contest created successfully!", loading: false });

      setFormData({
        name: "",
        problems: "",
        startTime: "",
        endTime: "",
      });

    } catch (err) {
      setStatus({
        type: "error",
        message: err.response?.data?.error || "Failed to create contest.",
        loading: false
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100">


      {/* CONTENT */}
      <div className="max-w-3xl mx-auto px-6 py-12">

        <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-6">
          Create New Contest
        </h1>

        <form
          onSubmit={handleSubmit}
          className="bg-gray-800/50 backdrop-blur-lg p-8 rounded-2xl border border-gray-700 shadow-xl space-y-6"
        >

          <div>
            <label className="text-gray-300 font-medium">Contest Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="mt-2 w-full bg-gray-900 border border-gray-600 text-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              placeholder="Ex: Weekly Coding Contest #5"
            />
          </div>

          <div>
            <label className="text-gray-300 font-medium">Problem IDs (one per line)</label>
            <textarea
              name="problems"
              rows="5"
              value={formData.problems}
              onChange={handleChange}
              required
              className="mt-2 w-full bg-gray-900 border border-gray-600 text-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              placeholder={`6723ab0192a3b1dbe00c11a1\n6723acd192a3b1dbe00c11a3`}
            ></textarea>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="text-gray-300 font-medium">Start Time</label>
              <input
                type="datetime-local"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                required
                className="mt-2 w-full bg-gray-900 border border-gray-600 text-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="text-gray-300 font-medium">End Time</label>
              <input
                type="datetime-local"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                required
                className="mt-2 w-full bg-gray-900 border border-gray-600 text-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={status.loading}
            className="w-full py-3 rounded-lg text-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 transition disabled:opacity-50"
          >
            {status.loading ? "Creating..." : "Create Contest"}
          </button>

          {status.message && (
            <p className={`mt-2 text-center font-medium ${status.type === "success" ? "text-green-400" : "text-red-400"}`}>
              {status.message}
            </p>
          )}
        </form>
      </div>

      {/* FOOTER */}
      <footer className="py-6 text-center border-t border-gray-800 text-gray-500 text-sm">
        © {new Date().getFullYear()} CodeItUp — Practice. Compete. Grow. 🚀
      </footer>
    </div>
  );
}
