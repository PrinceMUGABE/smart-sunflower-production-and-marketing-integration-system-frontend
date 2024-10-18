import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import Logo from '../../assets/police_image/logo_lil.jpeg';
import { MdInsertChart, MdOutlineDashboard } from "react-icons/md";
import { FaUsers, FaFilePdf } from "react-icons/fa";
import { SiMicrosoftexcel } from "react-icons/si";
import { IoIosFingerPrint } from "react-icons/io";
import { SiPublons } from "react-icons/si";

function Sidebar({ sidebarToggle }) {
    const [showSubMenu, setShowSubMenu] = useState(false);

    const toggleSubMenu = () => {
        setShowSubMenu(!showSubMenu);
    };

    return (
        <div className={`${sidebarToggle ? "hidden" : "block"} w-64 bg-white shadow fixed h-full px-4 py-2`}>
            {/* Logo */}
            <div className='flex items-center justify-center my-2 mb-4'>
                <img src={Logo} alt="" className="w-1/2 px-4 py-4 rounded-xl" />
            </div>
            <hr />
            <ul className='mt-3 text-gray-400 font-bold flex items-center justify-center'>
                <div>
                    <li className='mb-2 hover:shadow hover:bg-blue-600 hover:text-white hover:px-4 hover:py-2 hover:rounded-sm py-2'>
                        <NavLink to="/users" className='flex gap-2'>
                            <FaUsers className='inline-block w-6 h-6 text-2xl' />
                            Users
                        </NavLink>
                    </li>
                    <li className='mb-2 hover:shadow hover:bg-blue-600 hover:text-white hover:px-4 hover:py-2 hover:rounded-sm py-2'>
                        <NavLink to="/" className='flex gap-2'>
                            <MdOutlineDashboard className='inline-block w-6 h-6 text-2xl' />
                            Dashboard
                        </NavLink>
                    </li>
                    <li className='mb-2 hover:shadow hover:text-white hover:bg-blue-600 hover:px-4 hover:py-2 hover:rounded-sm py-2'>
                        <div className='flex gap-2 cursor-pointer' onClick={toggleSubMenu}>
                            <MdInsertChart className='inline-block w-6 h-6 text-2xl' />
                            Institutions
                        </div>
                        {showSubMenu && (
                            <ul className='ml-8 mt-2'>
                                <li className='mb-2 text-gray-500 hover:text-blue-500 hover:shadow hover:bg-white hover:px-4 hover:py-2 hover:rounded-sm py-2'>
                                    <NavLink to="/institutions/public" className='flex gap-2'>
                                        <SiPublons className='inline-block w-6 h-6 text-2xl' />
                                        Public
                                    </NavLink>
                                </li>
                                <li className='hover:shadow text-gray-500 hover:bg-white hover:text-blue-500 hover:px-4 hover:py-2 hover:rounded-sm py-2'>
                                    <NavLink to="/institutions/private" className='flex gap-2'>
                                        <IoIosFingerPrint className='inline-block w-6 h-6 text-2xl' />
                                        Private
                                    </NavLink>
                                </li>
                            </ul>
                        )}
                    </li>
                    <li className='hover:text-white mb-2 hover:shadow hover:bg-blue-600 hover:px-4 hover:py-2 hover:rounded-sm py-2'>
                        <NavLink to="/pdf-report" className='flex gap-2'>
                            <FaFilePdf className='inline-block w-6 h-6 text-2xl' />
                            Pdf report
                        </NavLink>
                    </li>
                    <li className='hover:text-white hover:shadow hover:bg-blue-600 hover:px-4 hover:py-2 hover:rounded-sm py-2'>
                        <NavLink to="/excel-report" className='flex gap-2'>
                            <SiMicrosoftexcel className='inline-block w-6 h-6 text-2xl' />
                            Excel report
                        </NavLink>
                    </li>
                </div>
            </ul>
        </div>
    );
}

export default Sidebar;
