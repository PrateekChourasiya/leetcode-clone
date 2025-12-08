import React from 'react'
import Navbar from '../block-components/Navbar'
import Footer from '../block-components/Footer'
import { Outlet } from 'react-router'

function LoggedInLayout() {
  return (
    <>
        <Navbar/>
        <Outlet />
        <Footer />
    </>
  )
}

export default LoggedInLayout