import { useEffect, useState } from 'react';
import { NavLink } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import axiosClient from '../utils/axiosClient';
import { logoutUser } from '../authSlice';
import Navbar from '../components/block-components/Navbar';

function HomePage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [filters, setFilters] = useState({
    difficulty: 'all',
    tag: 'all',
    status: 'all' 
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [problemsResponse, solvedResponse] = await Promise.all([
          axiosClient.get('/problem/getAllProblems'),
          user ? axiosClient.get('/problem/getAllProblemsSolvedByUser') : Promise.resolve({ data: [] })
        ]);
        
        setProblems(problemsResponse.data);
        if (user) setSolvedProblems(solvedResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleLogout = () => {
    dispatch(logoutUser());
    setSolvedProblems([]);
  };

  const filteredProblems = problems.filter(problem => {
    const difficultyMatch = filters.difficulty === 'all' || problem.difficulty === filters.difficulty;
    const tagMatch = filters.tag === 'all' || problem.tags === filters.tag;
    const statusMatch = filters.status === 'all' || 
                      solvedProblems.some(sp => sp._id === problem._id);
    return difficultyMatch && tagMatch && statusMatch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100">
      {/* Navigation Bar */}
      <Navbar/>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Coding Challenges
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Sharpen your coding skills with our curated collection of programming problems. Filter by difficulty, tags, or status to find your next challenge.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 mb-8 border border-gray-700 shadow-lg">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span className="text-sm font-medium text-gray-300">Filter Problems:</span>
            </div>
            
            <select 
              className="select bg-gray-700 border-gray-600 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
            >
              <option value="all">All Problems</option>
              <option value="solved">Solved Problems</option>
            </select>

            <select 
              className="select bg-gray-700 border-gray-600 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              value={filters.difficulty}
              onChange={(e) => setFilters({...filters, difficulty: e.target.value})}
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>

            <select 
              className="select bg-gray-700 border-gray-600 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              value={filters.tag}
              onChange={(e) => setFilters({...filters, tag: e.target.value})}
            >
              <option value="all">All Tags</option>
              <option value="array">Array</option>
              <option value="linkedList">Linked List</option>
              <option value="graph">Graph</option>
              <option value="dp">DP</option>
            </select>
          </div>
        </div>

        {/* Problems List */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid gap-5">
            {filteredProblems.length === 0 ? (
              <div className="text-center py-12 bg-gray-800/50 rounded-xl border border-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-xl font-medium text-gray-300 mb-2">No problems found</h3>
                <p className="text-gray-500">Try adjusting your filters to find more challenges.</p>
              </div>
            ) : (
              filteredProblems.map(problem => (
                <div key={problem._id} className="card bg-gray-800/50 backdrop-blur-sm border border-gray-700 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
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
                          <div className={`badge ${getDifficultyBadgeColor(problem.difficulty)} border-0 text-white font-medium py-2`}>
                            {problem.difficulty}
                          </div>
                          <div className="badge badge-info bg-gray-700 text-gray-300 border-gray-600 font-medium py-2">
                            {problem.tags}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        {solvedProblems.some(sp => sp._id === problem._id) ? (
                          <div className="badge badge-success gap-2 py-3 px-4 bg-green-900/30 text-green-400 border-green-800">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Solved
                          </div>
                        ) : (
                          <NavLink 
                            to={`/problem/${problem._id}`}
                            className="btn btn-primary bg-gradient-to-r from-blue-500 to-purple-600 border-0 text-white hover:opacity-90 transition-all"
                          >
                            Solve Challenge
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                          </NavLink>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
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

const getDifficultyBadgeColor = (difficulty) => {
  switch (difficulty.toLowerCase()) {
    case 'easy': return 'badge-success bg-green-900/30 text-green-400 border-green-800';
    case 'medium': return 'badge-warning bg-yellow-900/30 text-yellow-400 border-yellow-800';
    case 'hard': return 'badge-error bg-red-900/30 text-red-400 border-red-800';
    default: return 'badge-neutral bg-gray-700 text-gray-300 border-gray-600';
  }
};

export default HomePage;