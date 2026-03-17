"use client"
import Link from 'next/link';
import React from 'react'

const Bottomnavbar = () => {
    const [isOpenDropdown, setIsOpenDropdown] = React.useState(false);
    return (
        <div className='flex justify-between px-14 items-center py-4  '>
            <div className='flex items-center justify-center  gap-2 '>
                {/* <div className='flex items-center justify-center bg-slate-200 pr-4 cursor-pointer py-1.5'>
                    <button onBlur={() => setIsOpenDropdown(false)} onClick={() => setIsOpenDropdown(!isOpenDropdown)} id="dropdownHoverButton" data-dropdown-toggle="dropdownHover" data-dropdown-trigger="hover" className="text-whitefocus:ring-4 focus:outline-none relative cursor-pointer focus:ring-blue-300 font-medium rounded-lg text-sm pl-5  text-center inline-flex items-center" type="button">All Categories<svg className="w-2.5 h-2.5 ms-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
                    </svg>
                    </button> */}


                    {/* <div id="dropdownHover" className={`z-10 absolute ${isOpenDropdown ? 'block' : 'hidden'} bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-22 dark:bg-gray-700`}>
                        <ul className="py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownHoverButton">
                            <li>
                                <a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">URDU</a>
                            </li>
                            <li>
                                <a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">HINDI
                                </a>
                            </li>
                            <li>
                                <a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">ARABIC</a>
                            </li>
                            <li>
                                <a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">FRANCE</a>
                            </li>
                        </ul>
                    </div>
                </div> */}
                <Link href="/customers/orders">
                    <div className=' hover:bg-slate-200  px-1 py-1 transition ease-in duration-100 cursor-pointer'>
                        <h3>Track Order</h3>
                    </div>
                </Link>
                <Link href="/customers/support">
                    <div className=' hover:bg-slate-200  px-1 py-1 transition ease-in duration-100 cursor-pointer'>
                        <h3>Customer Support</h3>
                </div>
                </Link>
                
            </div>
            <div className='flex items-center justify-center text-l font-medium'>
                <h2>+91 123456789</h2>
            </div>

        </div>
    )
}

export default Bottomnavbar
