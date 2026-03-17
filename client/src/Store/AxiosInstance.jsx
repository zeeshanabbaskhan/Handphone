import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://ecommerceserver-09a3048c55bb.herokuapp.com/', // set your base URL here
  withCredentials: true, // send cookies (optional)
});

export default axiosInstance
