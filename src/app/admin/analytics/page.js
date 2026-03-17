"use client"
import React, { useState, useEffect } from 'react';
import {
    BarChart3,
    LineChart,
    Package,
    Users,
    DollarSign,
    TrendingUp,
    TrendingDown,
    Target,
    Menu,
    X,
    ArrowUpRight,
    ArrowDownRight,
    Download,
    RefreshCw,
    Calendar,
    Printer,
    FileText,
    ShoppingCart,
    Loader
} from 'lucide-react';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    LineChart as RechartsLineChart,
    Line,
    BarChart,
    Bar,
    PieChart as RechartsPieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend
} from 'recharts';
import Adminsidebar from '@/components/Adminsidebar';
import { userauthstore } from '@/Store/UserAuthStore';
import axiosInstance from '@/Store/AxiosInstance';
import { toast } from 'react-hot-toast';
import ProtectedRoute from '@/components/Protectedroute';
// import html2pdf from 'html2pdf.js';

const AnalyticsPage = () => {
    const { opensidebar, setOpenSidebar } = userauthstore();

    // State management
    const [activeChart, setActiveChart] = useState('overview');
    const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
    const [selectedMetric, setSelectedMetric] = useState('revenue');
    const [isExporting, setIsExporting] = useState(false);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [scheduleForm, setScheduleForm] = useState({
        email: '',
        frequency: 'weekly',
        day: 'monday',
        reportType: 'summary'
    });

    // Analytics data state
    const [analyticsData, setAnalyticsData] = useState({
        dashboard: {
            totalRevenue: 0,
            totalOrders: 0,
            avgOrderValue: 0,
            conversionRate: 0,
            changes: {
                revenue: 0,
                orders: 0,
                avgOrder: 0,
                conversion: 0
            }
        },
        revenueTrends: [],
        topProducts: [],
        categories: [],
        customers: {
            newCustomers: 0,
            returningCustomers: 0,
            totalCustomers: 0,
            avgCustomerValue: 0
        },
        loading: true,
        error: null
    });

    const timeRanges = ['7d', '30d', '90d', '6m', '1y'];
    const metrics = ['revenue', 'orders', 'customers'];

    // Fetch analytics data
    useEffect(() => {
        fetchAnalyticsData();
    }, [selectedTimeRange]);

    const fetchAnalyticsData = async () => {
        try {
            setAnalyticsData(prev => ({ ...prev, loading: true, error: null }));

            const [
                dashboardRes,
                trendsRes,
                productsRes,
                categoriesRes,
                customersRes
            ] = await Promise.all([
                axiosInstance.get(`/api/analytics/dashboard?timeRange=${selectedTimeRange}`),
                axiosInstance.get(`/api/analytics/revenue-trends?timeRange=${selectedTimeRange}&metric=${selectedMetric}`),
                axiosInstance.get(`/api/analytics/top-products?timeRange=${selectedTimeRange}&limit=10`),
                axiosInstance.get(`/api/analytics/categories?timeRange=${selectedTimeRange}`),
                axiosInstance.get(`/api/analytics/customers?timeRange=${selectedTimeRange}`)
            ]);

            setAnalyticsData({
                dashboard: dashboardRes.data.data,
                revenueTrends: trendsRes.data.data,
                topProducts: productsRes.data.data,
                categories: categoriesRes.data.data,
                customers: customersRes.data.data,
                loading: false,
                error: null
            });

        } catch (error) {
            console.error('Error fetching analytics:', error);

            let errorMessage = 'Failed to fetch analytics data';
            if (error.response) {
                errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
            } else if (error.request) {
                errorMessage = 'Network error. Please check your connection.';
            }

            setAnalyticsData(prev => ({
                ...prev,
                loading: false,
                error: errorMessage
            }));

            toast.error(errorMessage);
        }
    };

    // Utility functions
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount || 0);
    };

    const formatNumber = (num) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num?.toString() || '0';
    };

    const getTimeRangeLabel = (range) => {
        switch (range) {
            case '7d': return 'Last 7 days';
            case '30d': return 'Last 30 days';
            case '90d': return 'Last 90 days';
            case '6m': return 'Last 6 months';
            case '1y': return 'Last year';
            default: return 'Last 30 days';
        }
    };

    // Export functions

    const generatePDFReport = async () => {
        if (typeof window === "undefined") return;
        setIsExporting(true);

        try {
            const jsPDF = (await import('jspdf')).default;
            const html2canvas = (await import('html2canvas')).default;

            const reportElement = document.getElementById('analytics-report-section');
            if (!reportElement) {
                toast.error('Report section not found!');
                return;
            }

            // Create a completely new element with inline styles
            const createPDFCompatibleElement = () => {
                const container = document.createElement('div');
                container.style.cssText = `
                width: 1200px;
                padding: 40px;
                background-color: #0f172a;
                color: #ffffff;
                font-family: system-ui, -apple-system, sans-serif;
                line-height: 1.6;
            `;

                // Add title
                const title = document.createElement('h1');
                title.style.cssText = `
                font-size: 32px;
                font-weight: bold;
                color: #ffffff;
                margin-bottom: 30px;
                text-align: center;
                border-bottom: 2px solid #6366f1;
                padding-bottom: 20px;
            `;
                title.textContent = `Analytics Report - ${getTimeRangeLabel(selectedTimeRange)}`;
                container.appendChild(title);

                // Add metrics section
                const metricsSection = document.createElement('div');
                metricsSection.style.cssText = `
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 30px;
                margin-bottom: 40px;
            `;

                const metrics = [
                    {
                        label: 'Total Revenue',
                        value: formatCurrency(analyticsData.dashboard.totalRevenue),
                        change: analyticsData.dashboard.changes?.revenue || 0,
                        color: '#10b981'
                    },
                    {
                        label: 'Total Orders',
                        value: formatNumber(analyticsData.dashboard.totalOrders),
                        change: analyticsData.dashboard.changes?.orders || 0,
                        color: '#3b82f6'
                    },
                    {
                        label: 'Conversion Rate',
                        value: `${analyticsData.dashboard.conversionRate?.toFixed(2) || 0}%`,
                        change: analyticsData.dashboard.changes?.conversion || 0,
                        color: '#8b5cf6'
                    },
                    {
                        label: 'Avg Order Value',
                        value: formatCurrency(analyticsData.dashboard.avgOrderValue),
                        change: analyticsData.dashboard.changes?.avgOrder || 0,
                        color: '#f59e0b'
                    }
                ];

                metrics.forEach(metric => {
                    const metricCard = document.createElement('div');
                    metricCard.style.cssText = `
                    background-color: #1e293b;
                    border: 1px solid #374151;
                    border-radius: 12px;
                    padding: 24px;
                    text-align: center;
                `;

                    const label = document.createElement('p');
                    label.style.cssText = `
                    color: #94a3b8;
                    font-size: 14px;
                    margin: 0 0 8px 0;
                `;
                    label.textContent = metric.label;

                    const value = document.createElement('p');
                    value.style.cssText = `
                    color: #ffffff;
                    font-size: 28px;
                    font-weight: bold;
                    margin: 0 0 8px 0;
                `;
                    value.textContent = metric.value;

                    const change = document.createElement('p');
                    const changeColor = metric.change >= 0 ? '#10b981' : '#ef4444';
                    const changeSymbol = metric.change >= 0 ? '↗' : '↘';
                    change.style.cssText = `
                    color: ${changeColor};
                    font-size: 14px;
                    margin: 0;
                `;
                    change.textContent = `${changeSymbol} ${Math.abs(metric.change).toFixed(1)}% vs last period`;

                    metricCard.appendChild(label);
                    metricCard.appendChild(value);
                    metricCard.appendChild(change);
                    metricsSection.appendChild(metricCard);
                });

                container.appendChild(metricsSection);

                // Add top products section
                if (analyticsData.topProducts.length > 0) {
                    const productsTitle = document.createElement('h2');
                    productsTitle.style.cssText = `
                    font-size: 24px;
                    font-weight: bold;
                    color: #ffffff;
                    margin: 40px 0 20px 0;
                    border-left: 4px solid #6366f1;
                    padding-left: 16px;
                `;
                    productsTitle.textContent = 'Top Performing Products';
                    container.appendChild(productsTitle);

                    const productsTable = document.createElement('div');
                    productsTable.style.cssText = `
                    background-color: #1e293b;
                    border: 1px solid #374151;
                    border-radius: 12px;
                    overflow: hidden;
                `;

                    // Table header
                    const header = document.createElement('div');
                    header.style.cssText = `
                    display: grid;
                    grid-template-columns: 1fr 100px 120px;
                    background-color: #374151;
                    padding: 16px;
                    font-weight: bold;
                    color: #ffffff;
                    border-bottom: 1px solid #4b5563;
                `;
                    header.innerHTML = '<span>Product Name</span><span>Sales</span><span>Revenue</span>';
                    productsTable.appendChild(header);

                    // Table rows
                    analyticsData.topProducts.slice(0, 5).forEach((product, index) => {
                        const row = document.createElement('div');
                        row.style.cssText = `
                        display: grid;
                        grid-template-columns: 1fr 100px 120px;
                        padding: 16px;
                        border-bottom: 1px solid #374151;
                        color: #ffffff;
                        ${index % 2 === 1 ? 'background-color: #334155;' : ''}
                    `;

                        const name = document.createElement('span');
                        name.textContent = product.name || 'Unknown Product';

                        const sales = document.createElement('span');
                        sales.textContent = product.totalSales || '0';

                        const revenue = document.createElement('span');
                        revenue.style.color = '#10b981';
                        revenue.textContent = formatCurrency(product.totalRevenue || 0);

                        row.appendChild(name);
                        row.appendChild(sales);
                        row.appendChild(revenue);
                        productsTable.appendChild(row);
                    });

                    container.appendChild(productsTable);
                }

                // Add customer analytics
                const customerTitle = document.createElement('h2');
                customerTitle.style.cssText = `
                font-size: 24px;
                font-weight: bold;
                color: #ffffff;
                margin: 40px 0 20px 0;
                border-left: 4px solid #6366f1;
                padding-left: 16px;
            `;
                customerTitle.textContent = 'Customer Analytics';
                container.appendChild(customerTitle);

                const customerGrid = document.createElement('div');
                customerGrid.style.cssText = `
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 20px;
                margin-bottom: 40px;
            `;

                const customerMetrics = [
                    { label: 'New Customers', value: analyticsData.customers.newCustomers || 0, color: '#10b981' },
                    { label: 'Returning Customers', value: analyticsData.customers.returningCustomers || 0, color: '#3b82f6' },
                    { label: 'Total Customers', value: analyticsData.customers.totalCustomers || 0, color: '#ffffff' },
                    { label: 'Avg Customer Value', value: formatCurrency(analyticsData.customers.avgCustomerValue || 0), color: '#ffffff' }
                ];

                customerMetrics.forEach(metric => {
                    const card = document.createElement('div');
                    card.style.cssText = `
                    background-color: #374151;
                    border-radius: 8px;
                    padding: 20px;
                    text-align: center;
                `;

                    const label = document.createElement('p');
                    label.style.cssText = `
                    color: #94a3b8;
                    font-size: 14px;
                    margin: 0 0 8px 0;
                `;
                    label.textContent = metric.label;

                    const value = document.createElement('p');
                    value.style.cssText = `
                    color: ${metric.color};
                    font-size: 24px;
                    font-weight: bold;
                    margin: 0;
                `;
                    value.textContent = metric.value;

                    card.appendChild(label);
                    card.appendChild(value);
                    customerGrid.appendChild(card);
                });

                container.appendChild(customerGrid);

                // Add footer
                const footer = document.createElement('div');
                footer.style.cssText = `
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #374151;
                text-align: center;
                color: #94a3b8;
                font-size: 14px;
            `;
                footer.textContent = `Generated on ${new Date().toLocaleDateString()} • ${getTimeRangeLabel(selectedTimeRange)}`;
                container.appendChild(footer);

                return container;
            };

            // Create the PDF-compatible element
            const pdfElement = createPDFCompatibleElement();

            // Add to DOM temporarily
            pdfElement.style.position = 'absolute';
            pdfElement.style.left = '-9999px';
            pdfElement.style.top = '0';
            document.body.appendChild(pdfElement);

            // Generate canvas with strict options to avoid color parsing issues
            const canvas = await html2canvas(pdfElement, {
                scale: 1.5,
                useCORS: true,
                allowTaint: false,
                backgroundColor: '#0f172a',
                logging: false,
                width: 1200,
                height: pdfElement.scrollHeight,
                ignoreElements: (element) => {
                    // Skip any elements that might have problematic CSS
                    const computedStyle = window.getComputedStyle(element);
                    return computedStyle.backgroundImage.includes('gradient') ||
                        computedStyle.backdropFilter !== 'none';
                }
            });

            // Remove temporary element
            document.body.removeChild(pdfElement);

            // Create PDF
            const imgData = canvas.toDataURL('image/png', 0.95);
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'px',
                format: [canvas.width, canvas.height]
            });

            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
            pdf.save(`analytics-report-${selectedTimeRange}-${new Date().toISOString().split('T')[0]}.pdf`);

            toast.success('PDF report generated successfully!');

        } catch (error) {
            console.error('Error generating PDF:', error);
            toast.error('Failed to generate PDF report. Please try again.');
        } finally {
            setIsExporting(false);
        }
    };

    const exportCSV = async () => {
        if (typeof window === "undefined") return; // Only run in browser
        setIsExporting(true);
        try {
            const csvData = [
                ['Metric', 'Value', 'Change'],
                ['Total Revenue', analyticsData.dashboard.totalRevenue, `${analyticsData.dashboard.changes.revenue}%`],
                ['Total Orders', analyticsData.dashboard.totalOrders, `${analyticsData.dashboard.changes.orders}%`],
                ['Avg Order Value', analyticsData.dashboard.avgOrderValue, `${analyticsData.dashboard.changes.avgOrder}%`],
                ['Conversion Rate', `${analyticsData.dashboard.conversionRate}%`, `${analyticsData.dashboard.changes.conversion}%`]
            ];
            const csvContent = csvData.map(row => row.join(',')).join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `analytics-report-${selectedTimeRange}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success('CSV exported successfully!');
        } catch (error) {
            toast.error('Failed to export CSV');
        }
        setIsExporting(false);
    };

    const handleScheduleReport = () => {
        setShowScheduleModal(true);
    };

    const submitSchedule = async () => {
        try {
            // Send schedule request to backend
            toast.success(`Report scheduled successfully! You'll receive ${scheduleForm.frequency} reports at ${scheduleForm.email}`);
            setShowScheduleModal(false);
        } catch (error) {
            toast.error('Failed to schedule report');
        }
    };

    // ...existing code...

    const handlePrint = () => {
        if (typeof window === "undefined") return; // Only run in browser
        const reportElement = document.getElementById('analytics-report-section');
        if (reportElement) {
            const printWindow = window.open('', '', 'width=900,height=700');
            printWindow.document.write('<html><head><title>Print Report</title>');
            // Copy all stylesheets from the main document
            Array.from(document.styleSheets).forEach(styleSheet => {
                if (styleSheet.href) {
                    printWindow.document.write(`<link rel="stylesheet" href="${styleSheet.href}">`);
                }
            });
            printWindow.document.write('</head><body>');
            printWindow.document.write(reportElement.innerHTML);
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => {
                printWindow.print();
                printWindow.close();
            }, 500);
        } else {
            toast.error('Report section not found!');
        }
    };

    // ...existing code...
    // Custom tooltip for charts
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-800/90 backdrop-blur border border-slate-700/50 rounded-lg p-3 shadow-xl">
                    <p className="text-slate-300 text-sm mb-1">{label}</p>
                    {payload.map((item, index) => (
                        <p key={index} className="text-white font-medium" style={{ color: item.color }}>
                            {item.name}: {item.name.includes('Revenue') ? formatCurrency(item.value) : formatNumber(item.value)}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    if (analyticsData.loading && analyticsData.revenueTrends.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <Loader className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
                    <p className="text-white text-lg">Loading analytics...</p>
                    <p className="text-slate-400 text-sm mt-2">Fetching your business insights</p>
                </div>
            </div>
        );
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
                <Adminsidebar />

                <div className="lg:ml-64">
                    {/* Header */}
                    <header className="bg-slate-800/30 backdrop-blur-xl border-b border-slate-700/50 px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => setOpenSidebar(!opensidebar)}
                                    className="lg:hidden p-2 rounded-lg hover:bg-slate-700/50 transition-colors"
                                >
                                    <Menu className="w-5 h-5 text-slate-400" />
                                </button>
                                <h2 className="text-2xl font-bold text-white">Analytics & Reports</h2>
                            </div>

                            <div className="flex items-center space-x-4">
                                <select
                                    value={selectedTimeRange}
                                    onChange={(e) => setSelectedTimeRange(e.target.value)}
                                    className="bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
                                >
                                    {timeRanges.map(range => (
                                        <option key={range} value={range}>
                                            {getTimeRangeLabel(range)}
                                        </option>
                                    ))}
                                </select>

                                <button
                                    onClick={fetchAnalyticsData}
                                    disabled={analyticsData.loading}
                                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    <RefreshCw className={`w-5 h-5 ${analyticsData.loading ? 'animate-spin' : ''}`} />
                                </button>
                            </div>
                        </div>
                    </header>

                    {/* Error Display */}
                    {analyticsData.error && (
                        <div className="p-6">
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400 text-center">
                                <p>{analyticsData.error}</p>
                                <button
                                    onClick={fetchAnalyticsData}
                                    className="mt-2 text-sm underline hover:no-underline"
                                >
                                    Try again
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Key Metrics and Main Report Section */}
                    <div id="analytics-report-section">
                        {/* Key Metrics */}
                        <div className="p-6 bg-slate-800/20 backdrop-blur-xl border-b border-slate-700/50">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-slate-400 text-sm font-medium">Total Revenue</p>
                                            <p className="text-3xl font-bold text-white mt-2">
                                                {formatCurrency(analyticsData.dashboard.totalRevenue)}
                                            </p>
                                            <p className={`text-sm mt-1 flex items-center ${analyticsData.dashboard.changes?.revenue >= 0 ? 'text-green-400' : 'text-red-400'
                                                }`}>
                                                {analyticsData.dashboard.changes?.revenue >= 0 ? (
                                                    <ArrowUpRight className="w-4 h-4 mr-1" />
                                                ) : (
                                                    <ArrowDownRight className="w-4 h-4 mr-1" />
                                                )}
                                                {Math.abs(analyticsData.dashboard.changes?.revenue || 0).toFixed(1)}% vs last period
                                            </p>
                                        </div>
                                        <div className="p-3 bg-green-500/20 rounded-xl">
                                            <DollarSign className="w-8 h-8 text-green-400" />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-slate-400 text-sm font-medium">Total Orders</p>
                                            <p className="text-3xl font-bold text-white mt-2">
                                                {formatNumber(analyticsData.dashboard.totalOrders)}
                                            </p>
                                            <p className={`text-sm mt-1 flex items-center ${analyticsData.dashboard.changes?.orders >= 0 ? 'text-blue-400' : 'text-red-400'
                                                }`}>
                                                {analyticsData.dashboard.changes?.orders >= 0 ? (
                                                    <ArrowUpRight className="w-4 h-4 mr-1" />
                                                ) : (
                                                    <ArrowDownRight className="w-4 h-4 mr-1" />
                                                )}
                                                {Math.abs(analyticsData.dashboard.changes?.orders || 0).toFixed(1)}% vs last period
                                            </p>
                                        </div>
                                        <div className="p-3 bg-blue-500/20 rounded-xl">
                                            <ShoppingCart className="w-8 h-8 text-blue-400" />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-slate-400 text-sm font-medium">Conversion Rate</p>
                                            <p className="text-3xl font-bold text-white mt-2">
                                                {analyticsData.dashboard.conversionRate?.toFixed(2)}%
                                            </p>
                                            <p className={`text-sm mt-1 flex items-center ${analyticsData.dashboard.changes?.conversion >= 0 ? 'text-green-400' : 'text-red-400'
                                                }`}>
                                                {analyticsData.dashboard.changes?.conversion >= 0 ? (
                                                    <ArrowUpRight className="w-4 h-4 mr-1" />
                                                ) : (
                                                    <ArrowDownRight className="w-4 h-4 mr-1" />
                                                )}
                                                {Math.abs(analyticsData.dashboard.changes?.conversion || 0).toFixed(1)}% vs last period
                                            </p>
                                        </div>
                                        <div className="p-3 bg-purple-500/20 rounded-xl">
                                            <Target className="w-8 h-8 text-purple-400" />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-slate-400 text-sm font-medium">Avg Order Value</p>
                                            <p className="text-3xl font-bold text-white mt-2">
                                                {formatCurrency(analyticsData.dashboard.avgOrderValue)}
                                            </p>
                                            <p className={`text-sm mt-1 flex items-center ${analyticsData.dashboard.changes?.avgOrder >= 0 ? 'text-green-400' : 'text-red-400'
                                                }`}>
                                                {analyticsData.dashboard.changes?.avgOrder >= 0 ? (
                                                    <ArrowUpRight className="w-4 h-4 mr-1" />
                                                ) : (
                                                    <ArrowDownRight className="w-4 h-4 mr-1" />
                                                )}
                                                {Math.abs(analyticsData.dashboard.changes?.avgOrder || 0).toFixed(1)}% vs last period
                                            </p>
                                        </div>
                                        <div className="p-3 bg-yellow-500/20 rounded-xl">
                                            <TrendingUp className="w-8 h-8 text-yellow-400" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Chart Navigation */}
                    <main className="p-6 space-y-6">
                        <div className="flex flex-wrap gap-2 mb-6">
                            {[
                                { id: 'overview', name: 'Overview', icon: BarChart3 },
                                { id: 'revenue', name: 'Revenue Trends', icon: LineChart },
                                { id: 'products', name: 'Product Performance', icon: Package },
                                { id: 'customers', name: 'Customer Analytics', icon: Users }
                            ].map((chart) => (
                                <button
                                    key={chart.id}
                                    onClick={() => setActiveChart(chart.id)}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${activeChart === chart.id
                                        ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border border-purple-500/30'
                                        : 'bg-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700'
                                        }`}
                                >
                                    <chart.icon className="w-4 h-4" />
                                    <span>{chart.name}</span>
                                </button>
                            ))}
                        </div>

                        {/* Overview Charts */}
                        {activeChart === 'overview' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-xl font-bold text-white">Revenue Trends</h3>
                                        <div className="flex space-x-2">
                                            {metrics.map(metric => (
                                                <button
                                                    key={metric}
                                                    onClick={() => setSelectedMetric(metric)}
                                                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${selectedMetric === metric
                                                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                                        : 'bg-slate-700/50 text-slate-400 hover:text-white'
                                                        }`}
                                                >
                                                    {metric.charAt(0).toUpperCase() + metric.slice(1)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    {analyticsData.revenueTrends.length > 0 ? (
                                        <ResponsiveContainer width="100%" height={300}>
                                            <AreaChart data={analyticsData.revenueTrends}>
                                                <defs>
                                                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                                <XAxis dataKey="name" stroke="#9CA3AF" />
                                                <YAxis stroke="#9CA3AF" />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Area
                                                    type="monotone"
                                                    dataKey={selectedMetric}
                                                    stroke="#8B5CF6"
                                                    strokeWidth={2}
                                                    fill="url(#revenueGradient)"
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="h-[300px] flex items-center justify-center text-slate-400">
                                            No revenue trend data available
                                        </div>
                                    )}
                                </div>

                                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                                    <h3 className="text-xl font-bold text-white mb-6">Sales by Category</h3>
                                    {analyticsData.categories.length > 0 ? (
                                        <ResponsiveContainer width="100%" height={300}>
                                            <RechartsPieChart>
                                                <Pie
                                                    data={analyticsData.categories}
                                                    cx="50%"
                                                    cy="50%"
                                                    outerRadius={100}
                                                    dataKey="value"
                                                    label={({ name, value }) => `${name} ${value}%`}
                                                    labelLine={false}
                                                >
                                                    {analyticsData.categories.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip content={<CustomTooltip />} />
                                            </RechartsPieChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="h-[300px] flex items-center justify-center text-slate-400">
                                            No category data available
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Revenue Trends */}
                        {activeChart === 'revenue' && (
                            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                                <h3 className="text-xl font-bold text-white mb-6">Revenue Analytics</h3>
                                {analyticsData.revenueTrends.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={400}>
                                        <RechartsLineChart data={analyticsData.revenueTrends}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                            <XAxis dataKey="name" stroke="#9CA3AF" />
                                            <YAxis stroke="#9CA3AF" />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Line
                                                type="monotone"
                                                dataKey="revenue"
                                                stroke="#10B981"
                                                strokeWidth={3}
                                                dot={{ fill: '#10B981', strokeWidth: 2, r: 6 }}
                                            />
                                        </RechartsLineChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-[400px] flex items-center justify-center text-slate-400">
                                        No revenue data available
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Product Performance */}
                        {activeChart === 'products' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                                    <h3 className="text-xl font-bold text-white mb-6">Top Performing Products</h3>
                                    <div className="space-y-4 max-h-96 overflow-y-auto">
                                        {analyticsData.topProducts.length > 0 ? (
                                            analyticsData.topProducts.map((product, index) => (
                                                <div key={product.id || product._id} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                                            <span className="text-purple-400 font-bold text-sm">#{index + 1}</span>
                                                        </div>
                                                        <div className="flex items-center space-x-3">
                                                            {product.image && (
                                                                <img
                                                                    src={product.image}
                                                                    alt={product.name}
                                                                    className="w-10 h-10 rounded-lg object-cover"
                                                                    onError={(e) => { e.target.style.display = 'none'; }}
                                                                />
                                                            )}
                                                            <div>
                                                                <p className="font-medium text-white">{product.name}</p>
                                                                <p className="text-slate-400 text-sm">{product.totalSales || 0} sales</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-semibold text-green-400">{formatCurrency(product.totalRevenue || 0)}</p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-8 text-slate-400">
                                                No product data available
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                                    <h3 className="text-xl font-bold text-white mb-6">Category Performance</h3>
                                    {analyticsData.categories.length > 0 ? (
                                        <ResponsiveContainer width="100%" height={300}>
                                            <BarChart data={analyticsData.categories}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                                <XAxis dataKey="name" stroke="#9CA3AF" />
                                                <YAxis stroke="#9CA3AF" />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Bar dataKey="sales" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="h-[300px] flex items-center justify-center text-slate-400">
                                            No category data available
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Customer Analytics */}
                        {activeChart === 'customers' && (
                            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                                <h3 className="text-xl font-bold text-white mb-6">Customer Overview</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <div className="bg-slate-700/30 rounded-xl p-6 text-center">
                                        <p className="text-3xl font-bold text-green-400">{analyticsData.customers.newCustomers}</p>
                                        <p className="text-slate-400 text-sm mt-2">New Customers</p>
                                    </div>
                                    <div className="bg-slate-700/30 rounded-xl p-6 text-center">
                                        <p className="text-3xl font-bold text-blue-400">{analyticsData.customers.returningCustomers}</p>
                                        <p className="text-slate-400 text-sm mt-2">Returning Customers</p>
                                    </div>
                                    <div className="bg-slate-700/30 rounded-xl p-6 text-center">
                                        <p className="text-3xl font-bold text-white">{formatCurrency(analyticsData.customers.avgCustomerValue)}</p>
                                        <p className="text-slate-400 text-sm mt-2">Avg Customer Value</p>
                                    </div>
                                    <div className="bg-slate-700/30 rounded-xl p-6 text-center">
                                        <p className="text-3xl font-bold text-white">{formatNumber(analyticsData.customers.totalCustomers)}</p>
                                        <p className="text-slate-400 text-sm mt-2">Total Customers</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Export & Actions */}
                        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div>
                                    <h3 className="text-xl font-bold text-white">Export & Actions</h3>
                                    <p className="text-slate-400 mt-1">Download reports or schedule automated insights</p>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    <button
                                        onClick={generatePDFReport}
                                        disabled={isExporting}
                                        className="flex items-center space-x-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-xl px-4 py-2 text-sm font-medium hover:bg-green-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <FileText className="w-4 h-4" />
                                        <span>{isExporting ? 'Generating...' : 'PDF Report'}</span>
                                    </button>
                                    <button
                                        onClick={exportCSV}
                                        disabled={isExporting}
                                        className="flex items-center space-x-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-xl px-4 py-2 text-sm font-medium hover:bg-blue-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Download className="w-4 h-4" />
                                        <span>{isExporting ? 'Exporting...' : 'CSV Export'}</span>
                                    </button>
                                    <button
                                        onClick={handleScheduleReport}
                                        className="flex items-center space-x-2 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-xl px-4 py-2 text-sm font-medium hover:bg-purple-500/30 transition-colors"
                                    >
                                        <Calendar className="w-4 h-4" />
                                        <span>Schedule Report</span>
                                    </button>
                                    <button
                                        onClick={handlePrint}
                                        className="flex items-center space-x-2 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-xl px-4 py-2 text-sm font-medium hover:bg-yellow-500/30 transition-colors"
                                    >
                                        <Printer className="w-4 h-4" />
                                        <span>Print</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>

                {/* Schedule Report Modal */}
                {showScheduleModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-slate-800/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 w-full max-w-md">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-white">Schedule Report</h3>
                                <button
                                    onClick={() => setShowScheduleModal(false)}
                                    className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700/50 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        value={scheduleForm.email}
                                        onChange={(e) => setScheduleForm({ ...scheduleForm, email: e.target.value })}
                                        placeholder="your@email.com"
                                        className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Frequency</label>
                                    <select
                                        value={scheduleForm.frequency}
                                        onChange={(e) => setScheduleForm({ ...scheduleForm, frequency: e.target.value })}
                                        className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
                                    >
                                        <option value="daily">Daily</option>
                                        <option value="weekly">Weekly</option>
                                        <option value="monthly">Monthly</option>
                                        <option value="quarterly">Quarterly</option>
                                    </select>
                                </div>

                                {scheduleForm.frequency === 'weekly' && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Day of Week</label>
                                        <select
                                            value={scheduleForm.day}
                                            onChange={(e) => setScheduleForm({ ...scheduleForm, day: e.target.value })}
                                            className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
                                        >
                                            <option value="monday">Monday</option>
                                            <option value="tuesday">Tuesday</option>
                                            <option value="wednesday">Wednesday</option>
                                            <option value="thursday">Thursday</option>
                                            <option value="friday">Friday</option>
                                            <option value="saturday">Saturday</option>
                                            <option value="sunday">Sunday</option>
                                        </select>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Report Type</label>
                                    <select
                                        value={scheduleForm.reportType}
                                        onChange={(e) => setScheduleForm({ ...scheduleForm, reportType: e.target.value })}
                                        className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
                                    >
                                        <option value="summary">Summary Report</option>
                                        <option value="detailed">Detailed Analytics</option>
                                        <option value="performance">Performance Metrics</option>
                                        <option value="financial">Financial Report</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setShowScheduleModal(false)}
                                    className="flex-1 bg-slate-700/50 text-slate-300 rounded-xl px-4 py-2 text-sm font-medium hover:bg-slate-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={submitSchedule}
                                    disabled={!scheduleForm.email}
                                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl px-4 py-2 text-sm font-medium hover:from-purple-600 hover:to-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Schedule
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Mobile Sidebar Overlay */}
                {opensidebar && (
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                        onClick={() => setOpenSidebar(false)}
                    />
                )}
            </div>
        </ProtectedRoute>
    );
};

export default AnalyticsPage;