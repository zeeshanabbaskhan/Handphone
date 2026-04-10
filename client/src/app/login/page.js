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
        <div className="auth-clean-bg min-h-screen flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                <div className="auth-clean-card px-8 py-10">
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-bold text-blue-300">
                            Welcome Back
                        </h1>
                        <p className="mt-3 text-slate-300 text-sm leading-relaxed">
                            Log in to continue where you left off. Join the community and explore new features.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-200 mb-2">
                                Email
                            </label>
                            <div className="auth-clean-input-wrap">
                                <MdEmail className="text-blue-500 text-xl" />
                                <input
                                    id="email"
                                    type="text"
                                    className="auth-clean-input"
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
                            <label htmlFor="password" className="block text-sm font-medium text-slate-200 mb-2">
                                Password
                            </label>
                            <div className="auth-clean-input-wrap">
                                <RiLockPasswordFill className="text-blue-500 text-xl" />
                                <input
                                    id="password"
                                    type="password"
                                    className="auth-clean-input"
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
                            className="auth-clean-button disabled:opacity-60 disabled:cursor-not-allowed"
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
                            <Link href="/forgot-password" className="auth-clean-link transition-colors">
                                Forgot password?
                            </Link>
                        </div>

                        <div className="pt-4 text-center text-sm text-slate-400">
                            <span>Don't have an account? </span>
                            <Link href="/signup" className="auth-clean-link font-medium">
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
