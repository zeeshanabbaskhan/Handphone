"use client";

import { Suspense } from "react";
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation'; // Changed import
import { CheckCircle, Package, CreditCard, Truck, Clock } from 'lucide-react';
import axiosInstance from '@/Store/AxiosInstance';

function CheckoutErrorContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const sessionId = searchParams.get("session_id");
    const errorCode = searchParams.get("error_code");
    const errorMessage = searchParams.get("error_message") || searchParams.get("message");
    const [loading, setLoading] = useState(!!sessionId);
    const [serverInfo, setServerInfo] = useState(null);
    const [detailsOpen, setDetailsOpen] = useState(false);

    useEffect(() => {
        const run = async () => {
            if (!sessionId) return;
            try {
                setLoading(true);
                // Optional endpoint – create it if you need server cleanup
                // const resp = await axiosInstance.post("/api/stripe-cancel", { sessionId });
                // setServerInfo(resp.data?.data);
            } catch (e) {
                // ignore failing optional call
            } finally {
                setLoading(false);
            }
        };
        run();
    }, [sessionId]);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center py-10 px-4">
            <div className="max-w-xl w-full mx-auto">
                <div className="bg-white rounded-2xl shadow-md p-8">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <XCircle className="w-12 h-12 text-red-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">Payment Not Completed</h1>
                    <p className="text-gray-600 text-center mb-6">
                        Your checkout session did not finish. {loading ? "Verifying session status..." : "No charge has been made."}
                    </p>

                    {errorMessage || errorCode ? (
                        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
                            <div className="flex items-start gap-2">
                                <AlertTriangle className="w-5 h-5 mt-0.5" />
                                <div>
                                    <p className="font-medium">Error Details</p>
                                    {errorMessage && <p className="mt-1">{decodeURIComponent(errorMessage)}</p>}
                                    {errorCode && <p className="mt-1 text-xs opacity-80">Code: {errorCode}</p>}
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setDetailsOpen(o => !o)}
                                className="mt-3 text-xs font-medium text-red-600 hover:underline"
                            >
                                {detailsOpen ? "Hide technical info" : "Show technical info"}
                            </button>
                            {detailsOpen && (
                                <pre className="mt-2 bg-white rounded p-2 overflow-x-auto text-xs text-gray-700">
                                    {JSON.stringify({ sessionId, errorCode, errorMessage, serverInfo }, null, 2)}
                                </pre>
                            )}
                        </div>
                    ) : null}

                    <div className="space-y-3">

                        <button
                            onClick={() => router.push("/customers/products/cart")}
                            className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                        >
                            <ShoppingCart className="w-5 h-5" />
                            Review Cart
                        </button>
                        <button
                            onClick={() => router.replace("/")}
                            className="w-full flex items-center justify-center gap-2 bg-gray-200 text-gray-800 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                        >
                            <Home className="w-5 h-5" />
                            Continue Shopping
                        </button>
                    </div>

                    <div className="mt-8 text-xs text-gray-500 text-center leading-relaxed">
                        If you believe you completed payment but still see this page,
                        DO NOT retry multiple times. Check your email or card statement first,
                        or contact support with the session ID: <span className="font-mono">{sessionId || "N/A"}</span>.
                    </div>
                </div>

                <div className="mt-6 text-center text-xs text-gray-400">
                    Need help? <Link href="mailto:support@example.com" className="hover:underline">Contact Support</Link>
                </div>
            </div>
        </div>
    );
}

export default function CheckoutError() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CheckoutErrorContent />
        </Suspense>
    );
}