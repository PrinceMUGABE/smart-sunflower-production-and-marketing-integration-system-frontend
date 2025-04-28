/* eslint-disable no-unused-vars */
import React from "react";
import Navbar from "./Navbar/Navbar.jsx";
import Hero from "./Hero/Hero";
import FarmingServices from "./Services/Services";
import Footer from "./Footer/Footer";
import About from "./about/About.jsx";
import Contact from "./contact/Contact.jsx";
import Partners from "./partners/Partners.jsx";
import MapDebugComponent from "./Footer/MapComponent.jsx";
import Partner from "./partners/parterners.jsx";


const MainLayout = () => {


  return (
    <>
      <Navbar />
      <Hero />

      <FarmingServices />
      <Partners />
      <Partner />
      
      <MapDebugComponent />
      <Contact />
      
      
      <Footer />
    </>
  );
};

export default MainLayout;
