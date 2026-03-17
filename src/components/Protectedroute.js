"use client";

import { userauthstore } from "@/Store/UserAuthStore";
import { Loader } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const ProtectedRoute = ({ children }) => {
    const { checkauth } = userauthstore();
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();
    console.log("in protected route");

    useEffect(() => {
        console.log("in protected route");

        let isMounted = true;
        async function check() {
            const user = await checkauth();

            console.log(user);
            console.log(pathname);




            if ((pathname == "/" || pathname == "/customers/products" || pathname.startsWith("/customers/products/details/")) && !user) {
                if (isMounted) setLoading(false);
                return children;

            }





            if ((pathname === "/login" || pathname === "/register") && user) {
                router.replace('/');
                return;
            }
            if (!user && (pathname !== "/login" || pathname !== "/register")) {
                router.replace('/login');
                return;
            }
            if (user.role === "admin" && !pathname.startsWith("/admin")) {
                router.replace('/admin/');
                return;
            }
            if (user.role === "customer" && pathname.startsWith("/admin")) {
                router.replace('/');
                return;
            }
            if (isMounted) setLoading(false);
        }
        check();
        return () => { isMounted = false; };
    }, [checkauth, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <Loader className="w-16 h-16 text-white animate-spin" />
            </div>
        );
    }

    return children;
};

export default ProtectedRoute;