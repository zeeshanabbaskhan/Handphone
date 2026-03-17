"use client";
import React from 'react';
import {
    ShoppingCart,
    Users,
    TrendingUp,
    Package,
    X,
    Menu,
    LogOut
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { userauthstore } from '@/Store/UserAuthStore';

const Adminsidebar = () => {
    const { opensidebar, setOpenSidebar } = userauthstore();
    const pathname = usePathname();
    const { logout } = userauthstore();

    const navItems = [
        { name: 'Dashboard', icon: Package, link: "/admin" },
        { name: 'Products', icon: Package, link: "/admin/product" },
        { name: 'Orders', icon: ShoppingCart, link: "/admin/order" },
        { name: 'Customers', icon: Users, link: "/admin/customer-management" },
        { name: 'Analytics', icon: TrendingUp, link: "/admin/analytics" }
    ];

    const router = useRouter();

    // Dummy logout handler, replace with your actual logout logic
    const handleLogout = () => {
        // Example: clear localStorage, redirect, etc.
        logout(router);
    };

    return (
        <>
            <div className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out ${opensidebar ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
                <div className="flex flex-col h-full bg-slate-800/50 backdrop-blur-xl border-r border-slate-700/50">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50">
                        <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                            HANDPHONE
                        </h1>
                        <button
                            onClick={() => setOpenSidebar(false)}
                            className="lg:hidden p-1 rounded-lg hover:bg-slate-700/50 transition-colors"
                        >
                            <X className="w-5 h-5 text-slate-400" />
                        </button>
                    </div>

                    <nav className="flex-1 px-4 py-6 space-y-2">
                        {navItems.map((item) => {
                            const isActive = pathname === item.link;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.link}
                                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${isActive
                                        ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border border-purple-500/30'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                                        }`}
                                >
                                    <item.icon className="w-5 h-5 mr-3" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                    <div className="px-4 pb-6">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center px-4 py-3 text-sm font-medium rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition"
                        >
                            <LogOut className="w-5 h-5 mr-2" />
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Adminsidebar;
