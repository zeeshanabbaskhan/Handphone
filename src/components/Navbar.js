"use client"
import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { IoSearch } from "react-icons/io5";
import { FiShoppingCart } from "react-icons/fi";
import { userauthstore } from "@/Store/UserAuthStore";
import { LogOut, Menu, X } from "lucide-react";
import Link from "next/link";

const Navbar = () => {
    const { user, logout } = userauthstore();
    const router = useRouter();
    const [openUserMenu, setOpenUserMenu] = React.useState(false);
    const [mobileNavOpen, setMobileNavOpen] = React.useState(false);
    const [mobileSearchOpen, setMobileSearchOpen] = React.useState(false);

    const handleLogout = () => {
        logout(router);
    };

    const closeAll = () => {
        setMobileNavOpen(false);
        setOpenUserMenu(false);
        setMobileSearchOpen(false);
    };

    return (
        <header className="bg-cyan-700 text-white shadow-sm relative z-40">
            <nav className="flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-10 py-3">
                <div className="flex items-center gap-2">
                    {/* Mobile: menu toggle */}
                    <button
                        aria-label="Toggle navigation"
                        className="inline-flex md:hidden p-2 rounded hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-white/40"
                        onClick={() => setMobileNavOpen(o => !o)}
                    >
                        {mobileNavOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>

                    {/* Mobile: search toggle (moved here because right section is hidden on small) */}
                    <button
                        aria-label="Toggle search"
                        className="md:hidden p-2 rounded hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-white/40"
                        onClick={() => setMobileSearchOpen(o => !o)}
                    >
                        <IoSearch size={20} />
                    </button>

                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <Image
                            className="rounded-full"
                            src="/handphone.png"
                            alt="logo"
                            width={40}
                            height={40}
                            priority
                        />
                        <h1 className="text-lg font-bold tracking-wide group-hover:opacity-90">
                            HANDPHONE
                        </h1>
                    </Link>
                </div>

                {/* Desktop / Tablet search */}
                <div className="hidden md:block flex-1 max-w-xl">
                    <div className="rounded-2xl bg-white px-3 py-1 flex items-center gap-2 focus-within:ring-2 focus-within:ring-cyan-300">
                        <IoSearch className="text-cyan-600" />
                        <input
                            id="search"
                            placeholder="Search items"
                            className="flex-1 bg-transparent outline-none text-cyan-800 placeholder-cyan-500"
                            type="search"
                        />
                    </div>
                </div>

                {/* RIGHT SECTION (Desktop only). On mobile these options are available in the sidebar */}
                <div className="hidden md:flex items-center gap-3">
                    {user ? (
                        <>
                            <Link
                                href="/customers/products/cart"
                                className="relative p-2 rounded hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-white/40"
                                aria-label="Cart"
                            >
                                <FiShoppingCart size={22} />
                            </Link>

                            <div className="relative">
                                <button
                                    onClick={() => setOpenUserMenu(o => !o)}
                                    className="flex items-center justify-center w-9 h-9 rounded-full bg-cyan-600 hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-white/40"
                                    aria-haspopup="true"
                                    aria-expanded={openUserMenu}
                                >
                                    <img
                                        className="w-9 h-9 rounded-full object-cover"
                                        src={user?.profileImg || "/playstation.png"}
                                        alt="User avatar"
                                    />
                                </button>

                                <div
                                    className={`absolute right-0 mt-2 w-52 bg-white text-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-100 ${openUserMenu ? "" : "hidden"
                                        }`}
                                >
                                    <div className="px-4 py-3 text-sm">
                                        <p className="font-medium truncate">{user.name || "User"}</p>
                                        <p className="text-gray-500 truncate">
                                            {user.email || "email@example.com"}
                                        </p>
                                    </div>
                                    <div className="border-t">
                                        <Link
                                            href="/customers/orders"
                                            className="block px-4 py-2 text-sm hover:bg-gray-100"
                                            onClick={() => setOpenUserMenu(false)}
                                        >
                                            Dashboard
                                        </Link>
                                        <Link
                                            href="/customers/profile"
                                            className="block px-4 py-2 text-sm hover:bg-gray-100"
                                            onClick={() => setOpenUserMenu(false)}
                                        >
                                            Settings
                                        </Link>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setOpenUserMenu(false);
                                            handleLogout();
                                        }}
                                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-left hover:bg-gray-100"
                                    >
                                        <LogOut size={16} />
                                        Sign out
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => router.push("/login")}
                                className="px-4 py-2 bg-white text-cyan-700 font-semibold rounded-lg hover:bg-gray-200 text-sm"
                            >
                                Login
                            </button>
                            <button
                                onClick={() => router.push("/signup")}
                                className="px-4 py-2 bg-white text-cyan-700 font-semibold rounded-lg hover:bg-gray-200 text-sm"
                            >
                                Sign Up
                            </button>
                        </div>
                    )}
                </div>
            </nav>

            {mobileSearchOpen && (
                <div className="md:hidden px-4 pb-3">
                    <div className="rounded-2xl bg-white px-3 py-2 flex items-center gap-2 focus-within:ring-2 focus-within:ring-cyan-300">
                        <IoSearch className="text-cyan-600" />
                        <input
                            placeholder="Search items"
                            className="flex-1 bg-transparent outline-none text-cyan-800 placeholder-cyan-500 text-sm"
                            type="search"
                        />
                        <button
                            onClick={() => setMobileSearchOpen(false)}
                            className="text-xs text-cyan-600 font-medium hover:underline"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            <div
                className={`md:hidden fixed inset-y-0 left-0 w-64 bg-white text-gray-800 shadow-xl transform transition-transform duration-300 z-50 ${mobileNavOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                {/* Mobile Sidebar Content (now includes all options) */}
                <div className="flex items-center justify-between px-4 py-4 border-b">
                    <div className="flex items-center gap-2">
                        <Image
                            className="rounded-full"
                            src={user?.profileImg || null}
                            alt="logo"
                            width={34}
                            height={34}
                        />
                        <span className="font-semibold tracking-wide text-cyan-700">
                            HANDPHONE
                        </span>
                    </div>
                    <button
                        aria-label="Close menu"
                        onClick={() => setMobileNavOpen(false)}
                        className="p-2 rounded hover:bg-gray-100"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 space-y-4 text-sm">
                    {/* Optional search inside sidebar */}
                    <div className="flex md:hidden">
                        <div className="w-full rounded-2xl bg-white border border-cyan-200 px-3 py-2 flex items-center gap-2">
                            <IoSearch className="text-cyan-600" />
                            <input
                                placeholder="Search items"
                                className="flex-1 bg-transparent outline-none text-cyan-800 placeholder-cyan-500 text-sm"
                                type="search"
                            />
                        </div>
                    </div>

                    <Link
                        href="/"
                        onClick={closeAll}
                        className="block px-2 py-2 rounded hover:bg-gray-100 font-medium"
                    >
                        Home
                    </Link>
                    <Link
                        href="/customers/products"
                        onClick={closeAll}
                        className="block px-2 py-2 rounded hover:bg-gray-100 font-medium"
                    >
                        Products
                    </Link>

                    {user && (
                        <>
                            <Link
                                href="/customers/products/cart"
                                onClick={closeAll}
                                className="block px-2 py-2 rounded hover:bg-gray-100 font-medium"
                            >
                                Cart
                            </Link>
                            <Link
                                href="/customers/orders"
                                onClick={closeAll}
                                className="block px-2 py-2 rounded hover:bg-gray-100 font-medium"
                            >
                                Dashboard
                            </Link>
                            <Link
                                href="/customers/profile"
                                onClick={closeAll}
                                className="block px-2 py-2 rounded hover:bg-gray-100 font-medium"
                            >
                                Profile
                            </Link>
                            <button
                                onClick={() => {
                                    closeAll();
                                    handleLogout();
                                }}
                                className="w-full text-left px-2 py-2 rounded hover:bg-gray-100 font-medium flex items-center gap-2"
                            >
                                <LogOut size={16} />
                                Sign out
                            </button>
                        </>
                    )}

                    {!user && (
                        <div className="pt-2 space-y-2">
                            <button
                                onClick={() => {
                                    router.push("/login");
                                    closeAll();
                                }}
                                className="w-full px-3 py-2 bg-cyan-700 text-white rounded-lg font-medium hover:bg-cyan-600"
                            >
                                Login
                            </button>
                            <button
                                onClick={() => {
                                    router.push("/signup");
                                    closeAll();
                                }}
                                className="w-full px-3 py-2 bg-cyan-50 text-cyan-700 border border-cyan-700 rounded-lg font-medium hover:bg-cyan-100"
                            >
                                Sign Up
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {(mobileNavOpen || openUserMenu) && (
                <div
                    onClick={closeAll}
                    className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-[1px] z-30"
                />
            )}
        </header>
    );
};

export default Navbar;
