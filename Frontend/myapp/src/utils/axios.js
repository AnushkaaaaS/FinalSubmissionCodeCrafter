import axios from 'axios';

const instance = axios.create({
    baseURL: 'http://localhost:8000',  // Updated to use port 8000
    headers: {
        'Content-Type': 'application/json'
    }
});

export default instance; 