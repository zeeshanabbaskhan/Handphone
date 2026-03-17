"use client"
import { useForm } from "react-hook-form"
import { MdEmail } from "react-icons/md"
import { RiLockPasswordFill } from "react-icons/ri"
import Link from "next/link"
import { userauthstore } from "@/Store/UserAuthStore"
import { useRouter } from "next/navigation"

const LoginPage = () => {
    const { login, isloggingin } = userauthstore()
    const router = useRouter()

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm()

    const onSubmit = (data) => {
        login(data, router)
    }

    return (
        <div className="min-h-screen relative flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-950 px-4 py-12">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-32 -left-32 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-md relative">
                <div className="backdrop-blur-xl bg-slate-900/70 border border-slate-700/60 shadow-2xl rounded-2xl px-8 py-10">
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                            Welcome Back
                        </h1>
                        <p className="mt-3 text-slate-400 text-sm leading-relaxed">
                            Log in to continue where you left off. Join the community and explore new features.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                                Email
                            </label>
                            <div className="flex items-center gap-3 bg-slate-800/60 border border-slate-700 focus-within:border-indigo-500 rounded-xl px-4 py-3 transition-colors">
                                <MdEmail className="text-indigo-400 text-xl" />
                                <input
                                    id="email"
                                    type="text"
                                    className="w-full bg-transparent outline-none text-slate-200 placeholder-slate-500 text-sm"
                                    placeholder="you@example.com"
                                    {...register("email", {
                                        required: "Email is required",
                                        pattern: {
                                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                            message: "Enter a valid email",
                                        },
                                    })}
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-2 text-xs text-red-400">{errors.email.message}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                                Password
                            </label>
                            <div className="flex items-center gap-3 bg-slate-800/60 border border-slate-700 focus-within:border-indigo-500 rounded-xl px-4 py-3 transition-colors">
                                <RiLockPasswordFill className="text-indigo-400 text-xl" />
                                <input
                                    id="password"
                                    type="password"
                                    className="w-full bg-transparent outline-none text-slate-200 placeholder-slate-500 text-sm"
                                    placeholder="••••••••"
                                    {...register("password", {
                                        required: "Password is required",
                                        minLength: { value: 6, message: "Min 6 characters" },
                                    })}
                                />
                            </div>
                            {errors.password && (
                                <p className="mt-2 text-xs text-red-400">{errors.password.message}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isloggingin}
                            className="w-full relative inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 disabled:opacity-60 disabled:cursor-not-allowed text-sm font-medium text-white px-6 py-3 shadow-lg shadow-indigo-900/40 transition-all"
                        >
                            {isloggingin ? (
                                <span className="flex items-center gap-2">
                                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Logging in...
                                </span>
                            ) : (
                                "Login"
                            )}
                        </button>

                        <div className="flex items-center justify-between text-xs text-slate-400">
                            <Link href="/forgot-password" className="hover:text-indigo-400 transition-colors">
                                Forgot password?
                            </Link>
                        </div>

                        <div className="pt-4 text-center text-sm text-slate-400">
                            <span>Don't have an account? </span>
                            <Link href="/signup" className="text-indigo-400 hover:text-indigo-300 font-medium">
                                Sign Up
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default LoginPage
