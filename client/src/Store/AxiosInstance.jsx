import axios from 'axios';

const getBaseURL = () => {
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }

  if (typeof window !== 'undefined') {
    return '';
  }

  if (process.env.API_INTERNAL_URL) {
    return process.env.API_INTERNAL_URL;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return 'http://127.0.0.1:5001';
};

const axiosInstance = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
});

export default axiosInstance;
