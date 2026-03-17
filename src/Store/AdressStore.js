// import { create } from 'zustand'
// import axiosInstance from './AxiosInstance'
// import toast from 'react-hot-toast'

// export const useAddressStore = create((set, get) => ({
//     address: null,
//     isLoadingAddress: false,
//     isUpdatingAddress: false,
//     isAddingAddress: false,
//     isDeletingAddress: false,

//     // Get user's saved address
//     getAddress: async () => {
//         set({ isLoadingAddress: true })
//         try {
//             const res = await axiosInstance.get("/address/get-address/")
            
//             if (res.status === 200) {
//                 set({ address: res.data })
//                 return res.data
//             }
//         } catch (error) {
//             if (error.response?.status !== 404) {
//                 console.log("Error fetching address:", error)
//                 toast.error(error.response?.data?.message || "Failed to fetch address")
//             }
//             // If 404, address doesn't exist yet, which is fine
//             set({ address: null })
//             return null
//         } finally {
//             set({ isLoadingAddress: false })
//         }
//     },

//     // Add new address
//     addAddress: async (addressData) => {
//         set({ isAddingAddress: true })
//         try {
//             const res = await axiosInstance.post("/address/add-address/", addressData)
            
//             if (res.status === 201) {
//                 set({ address: res.data })
//                 toast.success("Address saved successfully")
//                 return res.data
//             }
//         } catch (error) {
//             console.log("Error adding address:", error)
//             if (error.response?.data?.missingFields) {
//                 toast.error(`Missing required fields: ${error.response.data.missingFields.join(', ')}`)
//             } else {
//                 toast.error(error.response?.data?.message || "Failed to save address")
//             }
//             throw error
//         } finally {
//             set({ isAddingAddress: false })
//         }
//     },

//     // Update existing address
//     updateAddress: async (addressData) => {
//         set({ isUpdatingAddress: true })
//         try {
//             const res = await axiosInstance.put("/address/update-address/", addressData)
            
//             if (res.status === 200) {
//                 set({ address: res.data })
//                 toast.success("Address updated successfully")
//                 return res.data
//             }
//         } catch (error) {
//             console.log("Error updating address:", error)
//             toast.error(error.response?.data?.message || "Failed to update address")
//             throw error
//         } finally {
//             set({ isUpdatingAddress: false })
//         }
//     },

//     // Delete address
//     deleteAddress: async () => {
//         set({ isDeletingAddress: true })
//         try {
//             const res = await axiosInstance.delete("/address/delete-address/")
            
//             if (res.status === 200) {
//                 set({ address: null })
//                 toast.success("Address deleted successfully")
//                 return true
//             }
//         } catch (error) {
//             console.log("Error deleting address:", error)
//             toast.error(error.response?.data?.message || "Failed to delete address")
//             throw error
//         } finally {
//             set({ isDeletingAddress: false })
//         }
//     },

//     // Clear address from store
//     clearAddress: () => set({ address: null })
// }))