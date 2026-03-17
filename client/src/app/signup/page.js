"use client"
import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { FaUser, FaEye, FaEyeSlash } from "react-icons/fa"
import { MdEmail } from "react-icons/md"
import { RiLockPasswordFill } from "react-icons/ri"
import { AiOutlineLoading3Quarters } from "react-icons/ai"
import Link from "next/link"
import { userauthstore } from "@/Store/UserAuthStore"
import { useRouter } from "next/navigation"

const SignupPage = () => {
  const router = useRouter()
  const { signup, isSigningup } = userauthstore()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm()

  const onSubmit = (data) => {
    signup(data, router)
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-950 px-4 py-12">
      {/* Decorative blurred blobs (like login) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        <div className="backdrop-blur-xl bg-slate-900/70 border border-slate-700/60 shadow-2xl rounded-2xl px-8 py-10">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Create Account
            </h1>
            <p className="mt-3 text-slate-400 text-sm leading-relaxed">
              Join us and start building. It only takes a moment.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2" htmlFor="name">
                Full Name
              </label>
              <div className={`flex items-center gap-3 bg-slate-800/60 border ${errors.name ? "border-red-500" : "border-slate-700"} focus-within:border-indigo-500 rounded-xl px-4 py-3 transition-colors`}>
                <FaUser className="text-indigo-400 text-lg" />
                <input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  className="w-full bg-transparent outline-none text-slate-200 placeholder-slate-500 text-sm"
                  {...register("name", { required: "Name is required" })}
                />
              </div>
              {errors.name && <p className="mt-2 text-xs text-red-400">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2" htmlFor="email">
                Email
              </label>
              <div className={`flex items-center gap-3 bg-slate-800/60 border ${errors.email ? "border-red-500" : "border-slate-700"} focus-within:border-indigo-500 rounded-xl px-4 py-3 transition-colors`}>
                <MdEmail className="text-indigo-400 text-xl" />
                <input
                  id="email"
                  type="text"
                  placeholder="you@example.com"
                  className="w-full bg-transparent outline-none text-slate-200 placeholder-slate-500 text-sm"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Enter a valid email"
                    }
                  })}
                />
              </div>
              {errors.email && <p className="mt-2 text-xs text-red-400">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2" htmlFor="password">
                Password
              </label>
              <div className={`flex items-center gap-3 bg-slate-800/60 border ${errors.password ? "border-red-500" : "border-slate-700"} focus-within:border-indigo-500 rounded-xl px-4 py-3 transition-colors`}>
                <RiLockPasswordFill className="text-indigo-400 text-xl" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full bg-transparent outline-none text-slate-200 placeholder-slate-500 text-sm"
                  {...register("password", {
                    required: "Password is required",
                    minLength: { value: 6, message: "Min 6 characters" }
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-indigo-300 transition-colors"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && <p className="mt-2 text-xs text-red-400">{errors.password.message}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSigningup}
              className="w-full relative inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 disabled:opacity-60 disabled:cursor-not-allowed text-sm font-medium text-white px-6 py-3 shadow-lg shadow-indigo-900/40 transition-all"
            >
              {isSigningup ? (
                <span className="flex items-center gap-2">
                  <AiOutlineLoading3Quarters className="h-4 w-4 animate-spin" />
                  Creating...
                </span>
              ) : (
                "Sign Up"
              )}
            </button>

            {/* Terms */}
            <p className="text-xs text-slate-500 text-center">
              By signing up you agree to our{" "}
              <Link href="/terms" className="text-indigo-400 hover:text-indigo-300 underline">
                Terms
              </Link>{" "}
              &{" "}
              <Link href="/privacy" className="text-indigo-400 hover:text-indigo-300 underline">
                Privacy
              </Link>
            </p>

            {/* Switch */}
            <div className="pt-2 text-center text-sm text-slate-400">
              <span>Already have an account? </span>
              <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
                Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default SignupPage