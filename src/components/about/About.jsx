/* eslint-disable no-unused-vars */
import React from 'react';
import AboutImg from '../../assets/pictures/abanyabuzuma2.jpg';

function About() {
    return (
        <section id="about" className="py-10 bg-slate-100 dark:bg-slate-900 dark:text-white">
            <h2
                data-aos="fade-up"
                className="text-center text-4xl font-bold mb-10"
            >
                About Us
            </h2>
            <main className="container mx-auto flex flex-col items-center justify-center">

                <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center p-4 md:p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                    <div data-aos="fade-right">
                        <img
                            src={AboutImg}
                            alt="No image"
                            className="w-full h-80 object-cover rounded-lg"
                        />
                    </div>
                    <div data-aos="fade-left" className="flex flex-col gap-4">
                        <div className="p-4 border-l-4 border-primary">
                            <h3 className="text-2xl font-semibold mb-2">Us</h3>
                            <p className="text-sm dark:text-slate-400">
                            The overall objective of the health sector in the recently updated Health Sector
                             Strategic Plan IV (2018 to 2024) is to ensure universal accessibility
                              (geographical and financial) of equitable and affordable quality health services 
                              (preventative, curative, rehabilitative and promotional services) for all Rwandans. 
                            </p>
                        </div>
                        <div className="p-4 border-l-4 border-primary">
                            <h3 className="text-2xl font-semibold mb-2">Vision</h3>
                            <p className="text-sm dark:text-slate-400">
                            The Health Sector Policy (2015) states the overall vision of the health sector
                             as follows: To pursue an integrated and community-driven development process
                              through the provision of equitable, accessible and quality health care services.
                            </p>
                        </div>
                        <div className="p-4 border-l-4 border-primary">
                            <h3 className="text-2xl font-semibold mb-2">Mission</h3>
                            <p className="text-sm dark:text-slate-400">
                            The mission of the Ministry of Health is to provide and continually improve affordable
                             promotive, preventive, curative and rehabilitative health care services of the highest
                              quality, thereby contributing to the reduction of poverty and enhancing the general 
                              well-being of the population.
                            </p>
                        </div>
                    </div>
                </section>
            </main>
        </section>
    );
}

export default About;
