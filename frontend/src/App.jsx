import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import HomePage from './pages/HomePage';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuth } from './authSlice';
import { useEffect } from 'react';

function App() {

  // checking prior that if the user is authenticated or not to directly navigate it to HomePage
  const {isAuthenticated} =  useSelector((state)=>state.auth);
  const dispatch = useDispatch();


  useEffect(()=>{
   dispatch(checkAuth());
  },[dispatch]); // we have put dispatch in dependency array so that checkauth runs only once, as it will have either true or false

  return (
    <>
      <Routes>
        <Route path = "/" element = {isAuthenticated ? <HomePage></HomePage> : <Navigate to = "signup"/>}></Route>
        <Route path = "/login" element = {isAuthenticated ? <Navigate to = "/"/> : <Login></Login>}></Route>
        <Route path = "/signup" element = {isAuthenticated ? <Navigate to = "/"/> : <SignUp></SignUp>}></Route> 
      </Routes>
    </>
  )
}

export default App
