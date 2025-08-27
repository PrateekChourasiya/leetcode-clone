import axios from "axios"

const baseURL = import.meta.env.VITE_ENVIRONMENT == "development" ? "http://localhost:3000" : "";

const axiosClient =  axios.create({
    baseURL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});


export default axiosClient;

