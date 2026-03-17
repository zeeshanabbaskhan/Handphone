
import { create } from 'zustand'
import axiosInstance from './AxiosInstance'
import toast from 'react-hot-toast'
import { all } from 'axios'
import { AlarmClock } from 'lucide-react'

// import { io } from 'socket.io-client'

const BASE_URl = 'http://localhost:5000'




export const userauthstore = create((set, get) => ({




    user: null,
    searcheduser: null,
    isSigningup: false,
    isloggingin: false,
    isupdatinguser: false,
    islogingout: false,
    ischeckingauth: false,
    sidebarusers: [],
    issettingsidebaruser: false,
    selecteduser: null,

    setSelectedUser: (user) => set({ selecteduser: user }),

    opensidebar: false,
    setOpenSidebar: (value) => set({ opensidebar: value }),
    allcustomers: [],



    login: async (data, router) => {
        try {
            set({ isloggingin: true })


            const res = await axiosInstance.post("/user/login", data)

            if (res.status === 200) {
                set({ user: res.data.user })

                toast.success(res.data.message)
                console.log(res.data);

                router.push("/")

            }


        }
        catch (error) {
            toast.error(error.response.data.message || "Server Error")
            console.log("error in logging in :", error)
        }
        finally {
            set({ isloggingin: false })
        }


    },
    signup: async (data, router) => {

        try {
            set({ isSigningup: true })


            const res = await axiosInstance.post("/user/sign-up", data)

            if (res.status === 200) {
                set({ user: res.data.user })

                console.log(res.data);
                toast.success(res.data.message)

                router.push('/'); // Navigate to login page


            }


        }
        catch (error) {
            toast.error(error.response.data.message || "Server Error")
            console.log("error in signing up   :", error)
        }
        finally {
            set({ isSigningup: false })
        }


    },
    logout: async (router) => {

        try {
            set({ islogingout: true })

            console.log(" in user auth store : logging out .... ");

            const res = await axiosInstance.get("/user/logout")
            console.log("in log out res : ", res);



            if (res.status === 200) {
                set({ user: null })


                router.push("/login")
                toast.success(res.data.message)
            }

        }
        catch (error) {
            console.log("error in logging in :", error)
            toast.error(error.response.data.message || "Server Error")
        }
        finally {
            set({ islogingout: false })
        }


    },
    editprofile: async (data) => {
        set({ isupdatinguser: true })

        try {


            console.log(" in user auth store : editting profile .... ");

            const res = await axiosInstance.post("/user/update", data)
            if (res.status === 200) {
                set({ user: res.data.user })
                toast.success(res.data.message)
                console.log(res.data);

            }

        }
        catch (error) {
            console.log("error in logging in :", error)
            toast.error(error.response.data.message)
        }
        finally {
            set({ isupdatinguser: false })
        }

    },

    checkauth: async () => {
        set({ ischeckingauth: true })
        try {
            console.log("in check auth");


            const res = await axiosInstance.get("/user/check")

            if (res.status === 200) {
                set({ user: res.data.user })
                return res.data.user

            }

        }
        catch (error) {
            console.log("error in checkauth in :", error?.data?.message)

            // toast.error(error.response.data.message || "Server Error")
            return null

        }
        finally {
            set({ ischeckingauth: false })
        }

    },

    getallcustomers: async () => {
        console.log("in get all customers");

        try {
            set({ issettingsidebaruser: true })


            const res = await axiosInstance.get("/user/customers")

            set({ allcustomers: res.data.customers })
            console.log("sidebar users :", res.data.customers);

        }
        catch (error) {
            console.log(error);

        }
        finally {
            set({ issettingsidebaruser: false })
        }

    }



}))