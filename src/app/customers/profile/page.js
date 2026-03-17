"use client"
import React, { useState, useEffect } from 'react'
import {
    User, Mail, Phone, MapPin, Edit3, Save, X, Trash2, Plus,
    Crown, Calendar, Package, DollarSign, TrendingUp, Badge
} from 'lucide-react'
import { userauthstore } from '@/Store/UserAuthStore'
import ProtectedRoute from '@/components/Protectedroute'
import Header from '@/components/Header'

const ProfilePage = () => {
    const { user, editprofile, isupdatinguser } = userauthstore()
    const [loadingTimeout, setLoadingTimeout] = useState(false)

    // Add a timeout to help debug loading issues
    useEffect(() => {
        const timer = setTimeout(() => {
            if (!user) {
                setLoadingTimeout(true)
                console.log('Loading timeout reached - user still not loaded')
            }
        }, 5000) // 5 second timeout

        return () => clearTimeout(timer)
    }, [user])

    // Profile editing state
    const [isEditingProfile, setIsEditingProfile] = useState(false)
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        phone: ''
    })

    // Address editing state
    const [isEditingAddress, setIsEditingAddress] = useState(false)
    const [addressData, setAddressData] = useState({
        location: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'US'
    })

    // Initialize data
    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || ''
            })
        }
    }, [user])

    // Update address form when address data changes
    useEffect(() => {
        if (user?.address) {
            setAddressData({
                location: user.address.location || '',
                city: user.address.city || '',
                state: user.address.state || '',
                zipCode: user.address.zipCode || '',
                country: user.address.country || 'US'
            })
        }
    }, [user?.address])

    const handleProfileEdit = () => {
        setIsEditingProfile(true)
    }

    const handleProfileSave = async () => {
        try {
            await editprofile(profileData)
            setIsEditingProfile(false)
        } catch (error) {
            console.error('Error updating profile:', error)
        }
    }

    const handleProfileCancel = () => {
        setProfileData({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || ''
        })
        setIsEditingProfile(false)
    }

    const handleAddressEdit = () => {
        setIsEditingAddress(true)
    }

    const handleAddressSave = async () => {
        try {
            await editprofile({

                address: addressData
            })
            setIsEditingAddress(false)
        } catch (error) {
            console.error('Error saving address:', error)
        }
    }

    const handleAddressCancel = () => {
        if (user?.address) {
            setAddressData({
                location: user.address.location || '',
                city: user.address.city || '',
                state: user.address.state || '',
                zipCode: user.address.zipCode || '',
                country: user.address.country || 'US'
            })
        } else {
            setAddressData({
                location: '',
                city: '',
                state: '',
                zipCode: '',
                country: 'US'
            })
        }
        setIsEditingAddress(false)
    }

    const handleAddressDelete = async () => {
        if (window.confirm('Are you sure you want to delete this address?')) {
            try {
                await editprofile({
                    ...profileData,
                    address: {
                        location: '',
                        city: '',
                        state: '',
                        zipCode: '',
                        country: ''
                    }
                })
            } catch (error) {
                console.error('Error deleting address:', error)
            }
        }
    }

    // Helper functions
    const formatDate = (date) => {
        if (!date) return 'Not available'
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const getSegmentColor = (segment) => {
        switch (segment?.toLowerCase()) {
            case 'vip': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
            case 'loyal': return 'bg-purple-100 text-purple-800 border-purple-200'
            case 'regular': return 'bg-blue-100 text-blue-800 border-blue-200'
            default: return 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'active': return 'bg-green-100 text-green-800 border-green-200'
            case 'inactive': return 'bg-red-100 text-red-800 border-red-200'
            default: return 'bg-blue-100 text-blue-800 border-blue-200'
        }
    }

    // Add debugging
    console.log('User data:', user);
    console.log('Is updating user:', isupdatinguser);

    if (!user) {
        return (
            <ProtectedRoute>
                <Header />
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">
                            {loadingTimeout ? 'Unable to load profile' : 'Loading profile...'}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                            Debug: User is {user === null ? 'null' : user === undefined ? 'undefined' : 'unknown'}
                        </p>
                        {loadingTimeout && (
                            <div className="mt-4">
                                <p className="text-sm text-red-600">Loading is taking longer than expected</p>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    Refresh Page
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </ProtectedRoute>
        )
    }

    const hasAddress = user?.address && (
        user.address.location ||
        user.address.city ||
        user.address.state ||
        user.address.zipCode ||
        user.address.country
    )

    return (
        <ProtectedRoute>
            <Header />
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <div className="relative inline-block">
                            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                                {user.profileImg ? (
                                    <img
                                        src={user.profileImg}
                                        alt="Profile"
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                ) : (
                                    user.name?.charAt(0)?.toUpperCase() || 'U'
                                )}
                            </div>
                            <div className={`absolute -bottom-1 -right-1 px-2 py-1 rounded-full text-xs font-medium border ${getSegmentColor(user.segment)}`}>
                                <Crown className="w-3 h-3 inline mr-1" />
                                {user.segment?.toUpperCase() || 'NEW'}
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">{user.name || 'User Profile'}</h1>
                        <p className="text-gray-600 mt-2">Manage your account information and preferences</p>
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border mt-3 ${getStatusColor(user.status)}`}>
                            <Badge className="w-4 h-4 mr-1" />
                            {user.status?.toUpperCase() || 'NEW'} ACCOUNT
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Account Statistics */}
                        <div className="lg:col-span-3">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                                    <Package className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                                    <div className="text-2xl font-bold text-gray-900">{user.totalOrders || 0}</div>
                                    <div className="text-sm text-gray-600">Total Orders</div>
                                </div>
                                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                                    <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
                                    <div className="text-2xl font-bold text-gray-900">${user.totalSpent || 0}</div>
                                    <div className="text-sm text-gray-600">Total Spent</div>
                                </div>
                                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                                    <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                                    <div className="text-2xl font-bold text-gray-900">${user.averageOrderValue || 0}</div>
                                    <div className="text-sm text-gray-600">Avg Order Value</div>
                                </div>
                                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                                    <Calendar className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                                    <div className="text-sm font-medium text-gray-900">Member Since</div>
                                    <div className="text-sm text-gray-600">{formatDate(user.createdAt)}</div>
                                </div>
                            </div>
                        </div>

                        {/* Editable Profile Information */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
                                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                                    <div className="flex items-center">
                                        <User className="h-5 w-5 text-gray-500 mr-2" />
                                        <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
                                    </div>
                                    {!isEditingProfile && (
                                        <button
                                            onClick={handleProfileEdit}
                                            className="text-blue-600 hover:text-blue-800 transition-colors"
                                            disabled={isupdatinguser}
                                        >
                                            <Edit3 className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>

                                <div className="p-6 space-y-6">
                                    {/* Name Field */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Full Name
                                        </label>
                                        {isEditingProfile ? (
                                            <input
                                                type="text"
                                                value={profileData.name}
                                                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Enter your full name"
                                            />
                                        ) : (
                                            <div className="flex items-center p-3 bg-gray-50 rounded-md">
                                                <User className="h-4 w-4 text-gray-400 mr-3" />
                                                <span className="text-gray-900">{user.name || 'Not provided'}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Email Field */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email Address
                                        </label>
                                        {isEditingProfile ? (
                                            <input
                                                type="email"
                                                value={profileData.email}
                                                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Enter your email"
                                            />
                                        ) : (
                                            <div className="flex items-center p-3 bg-gray-50 rounded-md">
                                                <Mail className="h-4 w-4 text-gray-400 mr-3" />
                                                <span className="text-gray-900">{user.email || 'Not provided'}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Phone Field */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Phone Number
                                        </label>
                                        {isEditingProfile ? (
                                            <input
                                                type="tel"
                                                value={profileData.phone}
                                                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Enter your phone number"
                                            />
                                        ) : (
                                            <div className="flex items-center p-3 bg-gray-50 rounded-md">
                                                <Phone className="h-4 w-4 text-gray-400 mr-3" />
                                                <span className="text-gray-900">{user.phone || 'Not provided'}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons for Profile */}
                                    {isEditingProfile && (
                                        <div className="flex space-x-3 pt-4 border-t border-gray-200">
                                            <button
                                                onClick={handleProfileSave}
                                                disabled={isupdatinguser}
                                                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isupdatinguser ? (
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                ) : (
                                                    <Save className="h-4 w-4 mr-2" />
                                                )}
                                                {isupdatinguser ? 'Saving...' : 'Save Changes'}
                                            </button>
                                            <button
                                                onClick={handleProfileCancel}
                                                disabled={isupdatinguser}
                                                className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <X className="h-4 w-4 mr-2" />
                                                Cancel
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Address Information */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                                    <div className="flex items-center">
                                        <MapPin className="h-5 w-5 text-gray-500 mr-2" />
                                        <h2 className="text-lg font-semibold text-gray-900">Shipping Address</h2>
                                    </div>
                                    <div className="flex space-x-2">
                                        {!isEditingAddress && hasAddress && (
                                            <button
                                                onClick={handleAddressDelete}
                                                disabled={isupdatinguser}
                                                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                                                title="Delete address"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        )}
                                        {!isEditingAddress && (
                                            <button
                                                onClick={handleAddressEdit}
                                                disabled={isupdatinguser}
                                                className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50"
                                                title={hasAddress ? "Edit address" : "Add address"}
                                            >
                                                {hasAddress ? <Edit3 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="p-6">
                                    {isEditingAddress ? (
                                        <div className="space-y-4">
                                            {/* Street Address */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Street Address *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={addressData.location}
                                                    onChange={(e) => setAddressData({ ...addressData, location: e.target.value })}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                    placeholder="123 Main Street"
                                                    required
                                                />
                                            </div>

                                            {/* City and State */}
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        City *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={addressData.city}
                                                        onChange={(e) => setAddressData({ ...addressData, city: e.target.value })}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                        placeholder="New York"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        State *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={addressData.state}
                                                        onChange={(e) => setAddressData({ ...addressData, state: e.target.value })}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                        placeholder="NY"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            {/* Zip Code and Country */}
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Zip Code
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={addressData.zipCode}
                                                        onChange={(e) => setAddressData({ ...addressData, zipCode: e.target.value })}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                        placeholder="10001"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Country *
                                                    </label>
                                                    <select
                                                        value={addressData.country}
                                                        onChange={(e) => setAddressData({ ...addressData, country: e.target.value })}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                                                        required
                                                    >
                                                        <option value="US">United States</option>
                                                        <option value="CA">Canada</option>
                                                        <option value="UK">United Kingdom</option>
                                                        <option value="AU">Australia</option>
                                                        <option value="DE">Germany</option>
                                                        <option value="FR">France</option>
                                                        <option value="IN">India</option>
                                                        <option value="JP">Japan</option>
                                                        <option value="CN">China</option>
                                                        <option value="BR">Brazil</option>
                                                        <option value="MX">Mexico</option>
                                                        <option value="Other">Other</option>
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Action Buttons for Address */}
                                            <div className="flex space-x-3 pt-6 border-t border-gray-200">
                                                <button
                                                    onClick={handleAddressSave}
                                                    disabled={isupdatinguser}
                                                    className="flex-1 flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                                >
                                                    {isupdatinguser ? (
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                    ) : (
                                                        <Save className="h-4 w-4 mr-2" />
                                                    )}
                                                    {isupdatinguser ? 'Saving...' : (hasAddress ? 'Update Address' : 'Save Address')}
                                                </button>
                                                <button
                                                    onClick={handleAddressCancel}
                                                    disabled={isupdatinguser}
                                                    className="flex-1 flex items-center justify-center px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                                >
                                                    <X className="h-4 w-4 mr-2" />
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : hasAddress ? (
                                        <div className="space-y-4">
                                            {/* Address Display Card */}
                                            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
                                                <div className="flex items-start space-x-3">
                                                    <div className="flex-shrink-0">
                                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                            <MapPin className="h-5 w-5 text-blue-600" />
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-sm font-medium text-gray-900 mb-2">
                                                            Primary Shipping Address
                                                        </div>
                                                        <div className="space-y-1">
                                                            {user.address.location && (
                                                                <p className="text-sm text-gray-800 font-medium">
                                                                    {user.address.location}
                                                                </p>
                                                            )}
                                                            <p className="text-sm text-gray-600">
                                                                {[user.address.city, user.address.state, user.address.zipCode]
                                                                    .filter(Boolean)
                                                                    .join(', ')}
                                                            </p>
                                                            {user.address.country && (
                                                                <p className="text-sm text-gray-600 font-medium">
                                                                    {user.address.country === 'US' ? 'United States' :
                                                                        user.address.country === 'CA' ? 'Canada' :
                                                                            user.address.country === 'UK' ? 'United Kingdom' :
                                                                                user.address.country === 'AU' ? 'Australia' :
                                                                                    user.address.country === 'DE' ? 'Germany' :
                                                                                        user.address.country === 'FR' ? 'France' :
                                                                                            user.address.country === 'IN' ? 'India' :
                                                                                                user.address.country === 'JP' ? 'Japan' :
                                                                                                    user.address.country === 'CN' ? 'China' :
                                                                                                        user.address.country === 'BR' ? 'Brazil' :
                                                                                                            user.address.country === 'MX' ? 'Mexico' :
                                                                                                                user.address.country}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Address Details */}
                                            <div className="grid grid-cols-2 gap-4 pt-2">
                                                <div className="text-center p-3 bg-gray-50 rounded-lg">
                                                    <div className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
                                                        Address Type
                                                    </div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        Shipping
                                                    </div>
                                                </div>
                                                <div className="text-center p-3 bg-gray-50 rounded-lg">
                                                    <div className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
                                                        Last Updated
                                                    </div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {user.address.createdAt ?
                                                            new Date(user.address.createdAt).toLocaleDateString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric'
                                                            }) :
                                                            'Recently'
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-12">
                                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <MapPin className="h-8 w-8 text-gray-400" />
                                            </div>
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">No address saved</h3>
                                            <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
                                                Add your shipping address to make checkout faster and easier.
                                            </p>
                                            <button
                                                onClick={handleAddressEdit}
                                                disabled={isupdatinguser}
                                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium"
                                            >
                                                <Plus className="h-4 w-4 mr-2" />
                                                Add Address
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        {/* Account Information (Read-only) */}
                        <div className="lg:col-span-3">
                            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                                    <div className="flex items-center">
                                        <Badge className="h-5 w-5 text-gray-500 mr-2" />
                                        <h2 className="text-lg font-semibold text-gray-900">Account Information</h2>
                                        <span className="ml-auto text-sm text-gray-500">Read-only</span>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">User ID</label>
                                            <div className="p-3 bg-gray-50 rounded-md">
                                                <span className="text-sm text-gray-900 font-mono">{user._id || 'N/A'}</span>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">Role</label>
                                            <div className="p-3 bg-gray-50 rounded-md">
                                                <span className="text-sm text-gray-900 capitalize">{user.role || 'Customer'}</span>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">Status</label>
                                            <div className="p-3 bg-gray-50 rounded-md">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                                                    {user.status?.toUpperCase() || 'NEW'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">Segment</label>
                                            <div className="p-3 bg-gray-50 rounded-md">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSegmentColor(user.segment)}`}>
                                                    <Crown className="w-3 h-3 mr-1" />
                                                    {user.segment?.toUpperCase() || 'NEW'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">Account Created</label>
                                            <div className="p-3 bg-gray-50 rounded-md">
                                                <span className="text-sm text-gray-900">{formatDate(user.createdAt)}</span>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">Last Updated</label>
                                            <div className="p-3 bg-gray-50 rounded-md">
                                                <span className="text-sm text-gray-900">{formatDate(user.updatedAt)}</span>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">Address Created</label>
                                            <div className="p-3 bg-gray-50 rounded-md">
                                                <span className="text-sm text-gray-900">{formatDate(user.address?.createdAt)}</span>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">Profile Image</label>
                                            <div className="p-3 bg-gray-50 rounded-md">
                                                <span className="text-sm text-gray-900">{user.profileImg ? 'Set' : 'Not Set'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    )
}

export default ProfilePage