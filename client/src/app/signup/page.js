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
    <div className="auth-clean-bg min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="auth-clean-card px-8 py-10">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-blue-300">
              Create Account
            </h1>
            <p className="mt-3 text-slate-300 text-sm leading-relaxed">
              Join us and start building. It only takes a moment.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2" htmlFor="name">
                Full Name
              </label>
              <div className={`auth-clean-input-wrap ${errors.name ? "border-red-500" : ""}`}>
                <FaUser className="text-blue-500 text-lg" />
                <input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  className="auth-clean-input"
                  {...register("name", { required: "Name is required" })}
                />
              </div>
              {errors.name && <p className="mt-2 text-xs text-red-400">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2" htmlFor="email">
                Email
              </label>
              <div className={`auth-clean-input-wrap ${errors.email ? "border-red-500" : ""}`}>
                <MdEmail className="text-blue-500 text-xl" />
                <input
                  id="email"
                  type="text"
                  placeholder="you@example.com"
                  className="auth-clean-input"
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
              <label className="block text-sm font-medium text-slate-200 mb-2" htmlFor="password">
                Password
              </label>
              <div className={`auth-clean-input-wrap ${errors.password ? "border-red-500" : ""}`}>
                <RiLockPasswordFill className="text-blue-500 text-xl" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="auth-clean-input"
                  {...register("password", {
                    required: "Password is required",
                    minLength: { value: 6, message: "Min 6 characters" }
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-blue-600 transition-colors"
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
              className="auth-clean-button disabled:opacity-60 disabled:cursor-not-allowed"
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
            <p className="text-xs text-slate-400 text-center">
              By signing up you agree to our{" "}
              <Link href="/terms" className="auth-clean-link underline">
                Terms
              </Link>{" "}
              &{" "}
              <Link href="/privacy" className="auth-clean-link underline">
                Privacy
              </Link>
            </p>

            {/* Switch */}
            <div className="pt-2 text-center text-sm text-slate-400">
              <span>Already have an account? </span>
              <Link href="/login" className="auth-clean-link font-medium">
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