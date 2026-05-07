import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Navbar from '../components/block-components/Navbar';
import axiosClient from '../utils/axiosClient';

function LeaderboardPage() {
  const { user } = useSelector((state) => state.auth);
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      try {
        const response = await axiosClient.get('/user/leaderboard');
        setLeaderboard(response.data);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const getMedalEmoji = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
  };

  const getRankStyle = (rank) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-900/40 to-yellow-800/20 border-yellow-700/60';
    if (rank === 2) return 'bg-gradient-to-r from-gray-700/40 to-gray-600/20 border-gray-500/60';
    if (rank === 3) return 'bg-gradient-to-r from-amber-900/40 to-amber-800/20 border-amber-700/60';
    return 'bg-gray-800/30 border-gray-700/50';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500 bg-clip-text text-transparent">
            🏆 Global Leaderboard
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            Top coders ranked by distinct problems solved. Climb the ranks!
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-16 bg-gray-800/50 rounded-xl border border-gray-700">
            <p className="text-xl text-gray-400">No users yet. Be the first to solve a problem!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 text-sm font-semibold text-gray-400 uppercase tracking-wider">
              <div className="col-span-2 text-center">Rank</div>
              <div className="col-span-6">User</div>
              <div className="col-span-4 text-center">Problems Solved</div>
            </div>

            {/* Rows */}
            {leaderboard.map((entry) => {
              const isCurrentUser = user?.emailId === entry.emailId;
              const medal = getMedalEmoji(entry.rank);

              return (
                <div
                  key={entry.emailId}
                  className={`grid grid-cols-12 gap-4 items-center px-6 py-4 rounded-xl border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${getRankStyle(entry.rank)} ${
                    isCurrentUser ? 'ring-2 ring-blue-500/50 shadow-blue-500/10 shadow-lg' : ''
                  }`}
                >
                  {/* Rank */}
                  <div className="col-span-2 text-center">
                    {medal ? (
                      <span className="text-2xl">{medal}</span>
                    ) : (
                      <span className="text-lg font-bold text-gray-300">#{entry.rank}</span>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="col-span-6 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                      entry.rank <= 3
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-600'
                        : 'bg-gradient-to-r from-blue-500 to-purple-600'
                    }`}>
                      {entry.firstName?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <p className={`font-semibold ${isCurrentUser ? 'text-blue-400' : 'text-white'}`}>
                        {entry.firstName}
                        {isCurrentUser && (
                          <span className="ml-2 text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/30">
                            You
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500">{entry.emailId}</p>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="col-span-4 text-center">
                    <span className={`text-xl font-bold ${
                      entry.rank === 1 ? 'text-yellow-400' :
                      entry.rank === 2 ? 'text-gray-300' :
                      entry.rank === 3 ? 'text-amber-500' :
                      'text-blue-400'
                    }`}>
                      {entry.score}
                    </span>
                    <p className="text-xs text-gray-500 mt-0.5">solved</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-12 py-6 border-t border-gray-800 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} CodeItUp. A online coding platform for DSA practice.</p>
      </footer>
    </div>
  );
}

export default LeaderboardPage;
