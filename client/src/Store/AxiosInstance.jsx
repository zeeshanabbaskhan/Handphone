import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL, // set your base URL here
  withCredentials: true, // send cookies (optional)
});

export default axiosInstance
