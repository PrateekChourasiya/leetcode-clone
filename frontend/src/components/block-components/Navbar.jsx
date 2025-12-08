import { NavLink } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../../authSlice";

function Navbar() {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);

    const handleLogout = () => {
        dispatch(logoutUser());
    };

    return (
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100">
            {/* Navigation Bar */}
            <nav className="sticky top-0 z-50 bg-gray-800/90 backdrop-blur-sm border-b border-gray-700 shadow-2xl px-6 py-3">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center space-x-2">
  <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  </div>

  <NavLink to="/" className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
    CodeItUp
  </NavLink>

<div className="flex flex-col justify-end mt-1 ">
  <NavLink
    to="/contests"
    className={({ isActive }) =>
      `
        text-md font-semibold tracking-wide px-3 py-1 rounded-md transition-all duration-300
        ${
          isActive
            ? "bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent drop-shadow-md"
            : "text-gray-400 hover:text-white hover:drop-shadow-[0_0_4px_rgba(180,180,255,0.4)]"
        }
      `
    }
  >
    Contests
  </NavLink>
</div>


</div>

                    <div className="flex items-center space-x-4">
                        <div className="hidden md:flex items-center space-x-1 text-sm text-gray-300">
                            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span>Welcome, {user?.firstName}</span>
                        </div>

                        <div className="dropdown dropdown-end">
                            <div
                                tabIndex={0}
                                className="avatar placeholder cursor-pointer hover:opacity-80 transition-opacity"
                            >
                                <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full w-10 h-10 flex items-center justify-center">
                                    <span className="font-bold flex justify-center mt-2">
                                        {user?.firstName?.charAt(0)}
                                    </span>
                                </div>
                            </div>

                            <ul
                                tabIndex={0}
                                className="mt-3 p-2 shadow menu menu-sm dropdown-content bg-gray-800 rounded-box w-52 border border-gray-700"
                            >
                                <li>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center justify-between text-red-400 hover:bg-gray-700 py-2 px-4 rounded-lg"
                                    >
                                        <span>Logout</span>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-4 w-4"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                            />
                                        </svg>
                                    </button>
                                </li>
                                {user?.role === "admin" && (
                                    <li>
                                        <NavLink
                                            to="/admin"
                                            className="flex items-center justify-between text-blue-400 hover:bg-gray-700 py-2 px-4 rounded-lg"
                                        >
                                            <span>Admin Panel</span>
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-4 w-4"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                                                />
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                />
                                            </svg>
                                        </NavLink>
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            </nav>
        </div>
    );
}

export default Navbar;
