import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import HomePage from "./pages/HomePage";
import { useDispatch, useSelector } from "react-redux";
import { checkAuth } from "./authSlice";
import { useEffect, useState } from "react";
import AdminPanel from "./components/AdminPanel";
import ProblemPage from "./pages/ProblemPage"
import Admin from "./pages/Admin";
import AdminDelete from "./components/AdminDelete"
import AdminUpdateList from "./components/AdminUpdateList";
import AdminUpdate from "./components/AdminUpdate";
import ContestHomePage from "./pages/ContestHomePage";
import AdminCreateContest from "./components/AdminCreateContest";
import ContestPage from "./pages/ContestPage";
import LoggedInLayout from "./components/layouts/LoggedInLayout";
import ContestProblemPage from "./pages/ContestProblemPage";

function App() {
  // checking prior that if the user is authenticated or not to directly navigate it to HomePage
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

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
        <Route
          path="/admin/update"
          element={
            isAuthenticated && user?.role === "admin" ? (
              <AdminUpdateList />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/admin/update/:id"
          element={
            isAuthenticated && user?.role === "admin" ? (
              <AdminUpdate />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/admin/create"
          element={
            isAuthenticated && user?.role === "admin" ? (
              <AdminPanel />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/admin/delete"
          element={
            isAuthenticated && user?.role === "admin" ? (
              <AdminDelete />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/admin/create-contest"
          element={
            isAuthenticated && user?.role === "admin" ? (
              <AdminCreateContest />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route path="/problem/:problemId" element={<ProblemPage />}></Route>
        {/* <Route path="/admin" element={<AdminPanel/>}></Route> */}
        <Route
          path="/admin"
          element={
            isAuthenticated && user?.role === "admin" ? (
              <Admin />
            ) : (
              <Navigate to="/" />
            )
          }
        ></Route>
        <Route element={isAuthenticated ? <LoggedInLayout /> : <Navigate to="/signup" />}>
            <Route path="/contests" element={<ContestHomePage />} />
            <Route path="/contest/:id"element={<ContestPage/>}></Route>
        </Route>

        <Route element={isAuthenticated ? <Outlet /> : <Navigate to="/signup" />}>
          <Route
            path="/contest/:id/problem/:problemId"
            element={<ContestProblemPage />}
          />
        </Route>

               
      </Routes>
    </>
  );
}

export default App;
