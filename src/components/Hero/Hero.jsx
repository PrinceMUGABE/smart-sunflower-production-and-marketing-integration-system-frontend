// eslint-disable-next-line no-unused-vars
import React from "react";
import hero from "../../assets/pictures/ministry_of_healthy_image.jpg";

const Hero = () => {
  return (

    <div className="dark:bg-gray-950 dark:text-white duration-300 " id="home">
      <div className="container min-h-[620px] flex mt-10 sm:mt-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 place-items-center">
          {/* Image section */}
          <div data-aos="zoom-in" className="order-1 sm:order-2 relative">
            <img
              src={hero}
              alt=""
              className="w-full sm:max-w-[280px] md:max-w-[430px]"
            />
            {/* <div
              data-aos="slide-right"
              className="absolute -bottom-5 -right-8 px-4 py-2 rounded-xl bg-white dark:bg-gray-900 dark:text-white shadow-md"
            >
            </div> */}
          </div>

          {/* Text section */}
          <div className="space-y-5 order-2 sm:order-1 xl:pr-40 ">
            <h1
              data-aos="fade-up"
              className="text-4xl sm:text-4xl font-semibold"
              style={{ lineHeight: 1.2 }}
            >
              Get in tourch with updated{" "}
              <span className="text-primary ">Community Health Work Emporing Management System</span>
            </h1>
            <p data-aos="fade-up" data-aos-delay="300">
            Created in January 2011, Job in Rwanda is a private held company providing services 
            in the area of online recruitment and advertisement.
            </p>
            {/* <button
              data-aos="fade-up"
              data-aos-delay="500"
              data-aos-offset="0"
              className="primary-btn"
            >
              Learn More
            </button> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
