import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import HomePage from "./pages/HomePage";
import { useDispatch, useSelector } from "react-redux";
import { checkAuth } from "./authSlice";
import { useEffect, useState } from "react";
import AdminPanel from "./pages/AdminPanel"
import ProblemPage from "./pages/ProblemPage";


function App() {
  // checking prior that if the user is authenticated or not to directly navigate it to HomePage
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  console.log(user);
  console.log(isAuthenticated);

  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuthentication = async () => {
      dispatch(checkAuth());
      setIsCheckingAuth(false);
    };
    checkAuthentication();
  }, [dispatch]);
 // we have put dispatch in dependency array so that checkauth runs only once, as it will have either true or false

  if (loading || isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? <HomePage></HomePage> : <Navigate to="signup" />
          }
        ></Route>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" /> : <Login></Login>}
        ></Route>
        <Route
          path="/signup"
          element={isAuthenticated ? <Navigate to="/" /> : <SignUp></SignUp>}
        ></Route>
        <Route path="/problem/:problemId" element={<ProblemPage/>}></Route>
        {/* <Route path="/admin" element={<AdminPanel/>}></Route> */}
        <Route
          path="/admin"
          element={
            isAuthenticated && user?.role === "admin" ? (
              <AdminPanel />
            ) : (
              <Navigate to="/" />
            )
          }
        ></Route>
      </Routes>
    </>
  );
}

export default App;
