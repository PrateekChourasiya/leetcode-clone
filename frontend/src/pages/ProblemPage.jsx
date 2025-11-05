import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import Editor from '@monaco-editor/react';
import { useParams, NavLink, useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import axiosClient from "../utils/axiosClient";
import SubmissionHistory from "../components/SubmissionHistory";
import ChatAi from '../components/ChatAi';
import { logoutUser } from '../authSlice';

const langMap = {
  cpp: 'C++',
  java: 'Java',
  javascript: 'JavaScript'
};

const ProblemPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth);
  const [problem, setProblem] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [activeLeftTab, setActiveLeftTab] = useState('description');
  const [activeRightTab, setActiveRightTab] = useState('code');
  const editorRef = useRef(null);
  let { problemId } = useParams();

  const { handleSubmit } = useForm();

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/signup');
  };

  useEffect(() => {
    const fetchProblem = async () => {
      setLoading(true);
      try {
        const response = await axiosClient.get(`/problem/problemById/${problemId}`, { withCredentials: true });
        const initialCode = response.data.startCode.find(sc => sc.language === langMap[selectedLanguage]).initialCode;

        setProblem(response.data);
        setCode(initialCode);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching problem:', error);
        setLoading(false);
      }
    };

    fetchProblem();
  }, [problemId]);

  useEffect(() => {
    if (problem) {
      const initialCode = problem.startCode.find(sc => sc.language === langMap[selectedLanguage]).initialCode;
      setCode(initialCode);
    }
  }, [selectedLanguage, problem]);

  const handleEditorChange = (value) => {
    setCode(value || '');
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
  };

  const handleRun = async () => {
    setLoading(true);
    setRunResult(null);
    
    try {
      const response = await axiosClient.post(`/submission/run/${problemId}`, { withCredentials: true }, {
        code,
        language: selectedLanguage
      });

      setRunResult(response.data);
      setLoading(false);
      setActiveRightTab('testcase');
    } catch (error) {
      console.error('Error running code:', error);
      setRunResult({
        success: false,
        error: 'Internal server error'
      });
      setLoading(false);
      setActiveRightTab('testcase');
    }
  };

  const handleSubmitCode = async () => {
    setLoading(true);
    setSubmitResult(null);
    
    try {
      const response = await axiosClient.post(`/submission/submit/${problemId}`, { withCredentials: true }, {
        code: code,
        language: selectedLanguage
      });

      setSubmitResult(response.data);
      setLoading(false);
      setActiveRightTab('result');
    } catch (error) {
      console.error('Error submitting code:', error);
      setSubmitResult(null);
      setLoading(false);
      setActiveRightTab('result');
    }
  };

  const getLanguageForMonaco = (lang) => {
    switch (lang) {
      case 'javascript': return 'javascript';
      case 'java': return 'java';
      case 'cpp': return 'cpp';
      default: return 'javascript';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'hard': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getDifficultyBadgeColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'badge-success bg-green-900/30 text-green-400 border-green-800';
      case 'medium': return 'badge-warning bg-yellow-900/30 text-yellow-400 border-yellow-800';
      case 'hard': return 'badge-error bg-red-900/30 text-red-400 border-red-800';
      default: return 'badge-neutral bg-gray-700 text-gray-300 border-gray-600';
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  if (loading && !problem) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
        <span className="loading loading-spinner loading-lg text-blue-500"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-gray-800/90 backdrop-blur-sm border-b border-gray-700 shadow-2xl px-6 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <NavLink to="/" className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              CodeItUp
            </NavLink>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-1 text-sm text-gray-300">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
              <span>Welcome, {user?.firstName}</span>
            </div>
            
            <div className="dropdown dropdown-end">
              <div tabIndex={0} className="avatar placeholder cursor-pointer hover:opacity-80 transition-opacity">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full w-10 h-10 flex items-center justify-center">
                  <span className="font-bold flex justify-center mt-2">{user?.firstName?.charAt(0)}</span>
                </div>
              </div>
              
              <ul tabIndex={0} className="mt-3 p-2 shadow menu menu-sm dropdown-content bg-gray-800 rounded-box w-52 border border-gray-700">
                <li>
                  <button onClick={handleLogout} className="flex items-center justify-between text-red-400 hover:bg-gray-700 py-2 px-4 rounded-lg">
                    <span>Logout</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </li>
                {user?.role === 'admin' && (
                  <li>
                    <NavLink to="/admin" className="flex items-center justify-between text-blue-400 hover:bg-gray-700 py-2 px-4 rounded-lg">
                      <span>Admin Panel</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </NavLink>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex" style={{ height: 'calc(100vh - 64px)' }}>
        {/* Left Panel */}
        <div className="w-1/2 flex flex-col border-r border-gray-700">
          {/* Left Tabs */}
          <div className="tabs tabs-bordered bg-gray-800/50 backdrop-blur-sm px-4 border-b border-gray-700">
            <button 
              className={`tab ${activeLeftTab === 'description' ? 'tab-active text-blue-400' : 'text-gray-400'}`}
              onClick={() => setActiveLeftTab('description')}
            >
              Description
            </button>
            <button 
              className={`tab ${activeLeftTab === 'editorial' ? 'tab-active text-blue-400' : 'text-gray-400'}`}
              onClick={() => setActiveLeftTab('editorial')}
            >
              Editorial
            </button>
            <button 
              className={`tab ${activeLeftTab === 'solutions' ? 'tab-active text-blue-400' : 'text-gray-400'}`}
              onClick={() => setActiveLeftTab('solutions')}
            >
              Solutions
            </button>
            <button 
              className={`tab ${activeLeftTab === 'submissions' ? 'tab-active text-blue-400' : 'text-gray-400'}`}
              onClick={() => setActiveLeftTab('submissions')}
            >
              Submissions
            </button>
            <button 
              className={`tab ${activeLeftTab === 'chatAI' ? 'tab-active text-blue-400' : 'text-gray-400'}`}
              onClick={() => setActiveLeftTab('chatAI')}
            >
              ChatAI
            </button>
          </div>

          {/* Left Content */}
          <div className="flex-1 overflow-y-auto p-6 bg-gray-800/30 backdrop-blur-sm">
            {problem && (
              <>
                {activeLeftTab === 'description' && (
                  <div>
                    <div className="flex items-center gap-4 mb-6">
                      <h1 className="text-2xl font-bold text-white">{problem.title}</h1>
                      <div className={`badge badge-outline ${getDifficultyBadgeColor(problem.difficulty)} py-2`}>
                        {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
                      </div>
                      <div className="badge badge-info bg-gray-700 text-gray-300 border-gray-600 py-2">
                        {problem.tags}
                      </div>
                    </div>

                    <div className="prose max-w-none text-gray-300">
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {problem.description}
                      </div>
                    </div>

                    <div className="mt-8">
                      <h3 className="text-lg font-semibold mb-4 text-white">Examples:</h3>
                      <div className="space-y-4">
                        {problem.visibleTestCases.map((example, index) => (
                          <div key={index} className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                            <h4 className="font-semibold mb-2 text-white">Example {index + 1}:</h4>
                            <div className="space-y-2 text-sm font-mono text-gray-300">
                              <div><strong className="text-blue-400">Input:</strong> {example.input}</div>
                              <div><strong className="text-green-400">Output:</strong> {example.output}</div>
                              <div><strong className="text-yellow-400">Explanation:</strong> {example.explanation}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeLeftTab === 'editorial' && (
                  <div className="prose max-w-none text-gray-300">
                    <h2 className="text-xl font-bold mb-4 text-white">Editorial</h2>
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      Editorial content will be available after you solve the problem.
                    </div>
                  </div>
                )}

                {activeLeftTab === 'solutions' && (
                  <div>
                    <h2 className="text-xl font-bold mb-4 text-white">Solutions</h2>
                    <div className="space-y-6">
                      {problem.referenceSolution?.map((solution, index) => (
                        <div key={index} className="border border-gray-700 rounded-lg bg-gray-800/50 backdrop-blur-sm">
                          <div className="bg-gray-800 px-4 py-2 rounded-t-lg flex justify-between items-center">
                            <h3 className="font-semibold text-white">{problem?.title} - {solution?.language}</h3>
                            <button 
                              onClick={() => copyToClipboard(solution?.completeCode)}
                              className="btn btn-sm btn-ghost text-blue-400 hover:text-blue-300"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                              </svg>
                              Copy Code
                            </button>
                          </div>
                          <div className="p-0 h-96">
                            <Editor
                              height="100%"
                              language={getLanguageForMonaco(selectedLanguage)}
                              value={solution?.completeCode}
                              theme="vs-dark"
                              options={{
                                readOnly: true,
                                minimap: { enabled: false },
                                scrollBeyondLastLine: false,
                                fontSize: 14,
                                wordWrap: 'on',
                                lineNumbers: 'on',
                              }}
                            />
                          </div>
                        </div>
                      )) || <p className="text-gray-500">Solutions will be available after you solve the problem.</p>}
                    </div>
                  </div>
                )}

                {activeLeftTab === 'submissions' && (
                  <div>
                    <h2 className="text-xl font-bold mb-4 text-white">My Submissions</h2>
                    <div className="text-gray-500">
                      <SubmissionHistory problemId={problemId} />
                    </div>
                  </div>
                )}

                {activeLeftTab === 'chatAI' && (
                  <div className="prose max-w-none">
                    <h2 className="text-xl font-bold mb-4 text-white">CHAT with AI</h2>
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      <ChatAi problem={problem}></ChatAi>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-1/2 flex flex-col">
          {/* Right Tabs */}
          <div className="tabs tabs-bordered bg-gray-800/50 backdrop-blur-sm px-4 border-b border-gray-700">
            <button 
              className={`tab ${activeRightTab === 'code' ? 'tab-active text-blue-400' : 'text-gray-400'}`}
              onClick={() => setActiveRightTab('code')}
            >
              Code
            </button>
            <button 
              className={`tab ${activeRightTab === 'testcase' ? 'tab-active text-blue-400' : 'text-gray-400'}`}
              onClick={() => setActiveRightTab('testcase')}
            >
              Testcase
            </button>
            <button 
              className={`tab ${activeRightTab === 'result' ? 'tab-active text-blue-400' : 'text-gray-400'}`}
              onClick={() => setActiveRightTab('result')}
            >
              Result
            </button>
          </div>

          {/* Right Content */}
          <div className="flex-1 flex flex-col bg-gray-800/30 backdrop-blur-sm">
            {activeRightTab === 'code' && (
              <div className="flex-1 flex flex-col">
                {/* Language Selector */}
                <div className="flex justify-between items-center p-4 border-b border-gray-700">
                  <div className="flex gap-2">
                    {['javascript', 'java', 'cpp'].map((lang) => (
                      <button
                        key={lang}
                        className={`btn btn-sm ${selectedLanguage === lang ? 'btn-primary bg-gradient-to-r from-blue-500 to-purple-600 border-0' : 'btn-ghost text-gray-300'}`}
                        onClick={() => handleLanguageChange(lang)}
                      >
                        {lang === 'cpp' ? 'C++' : lang === 'javascript' ? 'JavaScript' : 'Java'}
                      </button>
                    ))}
                  </div>
                  <button 
                    onClick={() => copyToClipboard(code)}
                    className="btn btn-sm btn-ghost text-blue-400 hover:text-blue-300"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    Copy Code
                  </button>
                </div>

                {/* Monaco Editor */}
                <div className="flex-1">
                  <Editor
                    height="100%"
                    language={getLanguageForMonaco(selectedLanguage)}
                    value={code}
                    onChange={handleEditorChange}
                    onMount={handleEditorDidMount}
                    theme="vs-dark"
                    options={{
                      fontSize: 14,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      tabSize: 2,
                      insertSpaces: true,
                      wordWrap: 'on',
                      lineNumbers: 'on',
                      glyphMargin: false,
                      folding: true,
                      lineDecorationsWidth: 10,
                      lineNumbersMinChars: 3,
                      renderLineHighlight: 'line',
                      selectOnLineNumbers: true,
                      roundedSelection: false,
                      readOnly: false,
                      cursorStyle: 'line',
                      mouseWheelZoom: true,
                    }}
                  />
                </div>

                {/* Action Buttons */}
                <div className="p-4 border-t border-gray-700 flex justify-between">
                  <div className="flex gap-2">
                    <button 
                      className="btn btn-ghost btn-sm text-gray-300 hover:text-white"
                      onClick={() => setActiveRightTab('testcase')}
                    >
                      Console
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className={`btn btn-outline btn-sm ${loading ? 'loading' : ''} border-gray-600 text-gray-300 hover:bg-gray-700`}
                      onClick={handleRun}
                      disabled={loading}
                    >
                      Run
                    </button>
                    <button
                      className={`btn btn-primary btn-sm ${loading ? 'loading' : ''} bg-gradient-to-r from-blue-500 to-purple-600 border-0 text-white`}
                      onClick={handleSubmitCode}
                      disabled={loading}
                    >
                      Submit
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeRightTab === 'testcase' && (
              <div className="flex-1 p-4 overflow-y-auto">
                <h3 className="font-semibold mb-4 text-white">Test Results</h3>
                {runResult ? (
                  <div className={`mb-4 rounded-lg border ${runResult.success ? 'border-green-800 bg-green-900/20' : 'border-red-800 bg-red-900/20'} p-4`}>
                    <div>
                      {runResult.success ? (
                        <div>
                          <h4 className="font-bold text-green-400">✅ All test cases passed!</h4>
                          <p className="text-sm mt-2 text-gray-300">Runtime: {runResult.runtime+" sec"}</p>
                          <p className="text-sm text-gray-300">Memory: {runResult.memory+" KB"}</p>
                          
                          <div className="mt-4 space-y-2">
                            {runResult.testCases.map((tc, i) => (
                              <div key={i} className="bg-gray-800/50 p-3 rounded text-xs border border-gray-700">
                                <div className="font-mono text-gray-300">
                                  <div><strong className="text-blue-400">Input:</strong> {tc.stdin}</div>
                                  <div><strong className="text-green-400">Expected:</strong> {tc.expected_output}</div>
                                  <div><strong className="text-yellow-400">Output:</strong> {tc.stdout}</div>
                                  <div className={'text-green-400'}>
                                    {'✓ Passed'}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <h4 className="font-bold text-red-400">❌ Error</h4>
                          <div className="mt-4 space-y-2">
                            {runResult.testCases.map((tc, i) => (
                              <div key={i} className="bg-gray-800/50 p-3 rounded text-xs border border-gray-700">
                                <div className="font-mono text-gray-300">
                                  <div><strong className="text-blue-400">Input:</strong> {tc.stdin}</div>
                                  <div><strong className="text-green-400">Expected:</strong> {tc.expected_output}</div>
                                  <div><strong className="text-yellow-400">Output:</strong> {tc.stdout}</div>
                                  <div className={tc.status_id==3 ? 'text-green-400' : 'text-red-400'}>
                                    {tc.status_id==3 ? '✓ Passed' : '✗ Failed'}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-500">
                    Click "Run" to test your code with the example test cases.
                  </div>
                )}
              </div>
            )}

            {activeRightTab === 'result' && (
              <div className="flex-1 p-4 overflow-y-auto">
                <h3 className="font-semibold mb-4 text-white">Submission Result</h3>
                {submitResult ? (
                  <div className={`rounded-lg border ${submitResult.accepted ? 'border-green-800 bg-green-900/20' : 'border-red-800 bg-red-900/20'} p-4`}>
                    <div>
                      {submitResult.accepted ? (
                        <div>
                          <h4 className="font-bold text-lg text-green-400">🎉 Accepted</h4>
                          <div className="mt-4 space-y-2 text-gray-300">
                            <p>Test Cases Passed: {submitResult.passedTestCases}/{submitResult.totalTestCases}</p>
                            <p>Runtime: {submitResult.runtime + " sec"}</p>
                            <p>Memory: {submitResult.memory + "KB"} </p>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <h4 className="font-bold text-lg text-red-400">❌ {submitResult.error}</h4>
                          <div className="mt-4 space-y-2 text-gray-300">
                            <p>Test Cases Passed: {submitResult.passedTestCases}/{submitResult.totalTestCases}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-500">
                    Click "Submit" to submit your solution for evaluation.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemPage;