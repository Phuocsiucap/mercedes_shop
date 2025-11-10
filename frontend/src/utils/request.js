import axios from "axios";

axios.defaults.withCredentials = true
const request = import.meta.env.VITE_API_URL
const request2=axios.create({
    baseURL: import.meta.env.VITE_API_URL,
}
)

const url = import.meta.env.VITE_API_URL + "/api/"
const request1=axios.create({
    baseURL: url ,
})
export {request,request1, request2} ;