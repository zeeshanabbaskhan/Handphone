"use client"
import React from "react";
import { FaGoogle, FaFacebook, FaInstagram, FaTiktok, FaPinterestP } from "react-icons/fa";

const Topnavbar = () => {
    return (
        <>
            <div
                className="flex flex-col gap-2 md:flex-row md:gap-0 justify-between items-center bg-cyan-700 py-2 px-4 sm:px-6 lg:px-14 relative custom-border text-white"
            >
                {/* Welcome text (shorter on very small screens) */}
                <div className="text-center md:text-left">
                    <h2 className="font-medium leading-tight text-sm sm:text-base md:text-lg">
                        <span className="inline sm:hidden">Welcome to Handphone Store</span>
                        <span className="hidden sm:inline">Welcome to Handphone online store</span>
                    </h2>
                </div>

                {/* Social Icons */}
                <div className="flex items-center gap-3 sm:gap-4">
                    <p className="hidden sm:block text-xs sm:text-sm md:text-base">Follow Us:</p>
                    <div className="flex items-center gap-4 text-xl">
                        <a href="#" aria-label="Google" className="hover:text-yellow-200 transition-colors">
                            <FaGoogle className="h-4 w-4 sm:h-5 sm:w-5" />
                        </a>
                        <a href="#" aria-label="Facebook" className="hover:text-yellow-200 transition-colors">
                            <FaFacebook className="h-4 w-4 sm:h-5 sm:w-5" />
                        </a>
                        <a href="#" aria-label="Instagram" className="hover:text-yellow-200 transition-colors">
                            <FaInstagram className="h-4 w-4 sm:h-5 sm:w-5" />
                        </a>
                        <a href="#" aria-label="TikTok" className="hover:text-yellow-200 transition-colors">
                            <FaTiktok className="h-4 w-4 sm:h-5 sm:w-5" />
                        </a>
                        <a href="#" aria-label="Pinterest" className="hover:text-yellow-200 transition-colors">
                            <FaPinterestP className="h-4 w-4 sm:h-5 sm:w-5" />
                        </a>
                    </div>
                </div>
            </div>

            <style jsx>{`
        .custom-border::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 0;
          height: 1px;
          width: 100%;
          background-color: #94a3b8;
        }
      `}</style>
        </>
    );
};

export default Topnavbar;
