import axios from 'axios';

const baseURL = process.env.BASE_URL || 'http://127.0.0.1:8000';
// let baseURL;
// if (process.env.NODE_ENV === 'development') {
//     baseURL = 'http://127.0.0.1:8000'; 
// } else {
//     baseURL = process.env.BACKEND_URL; 
// }
const api = axios.create({
    baseURL: baseURL,
    timeout: 30000, // 30 second timeout
    headers: {
        'Content-Type': 'application/json',
    }
});

// Add response interceptor for error handling
api.interceptors.response.use(
    response => response,
    error => {
        // Log the error for debugging
        console.error('API Error:', error);
        
        // Handle network errors
        if (!error.response) {
            return Promise.reject({
                message: 'Network error. Please check your internet connection.',
                status: 'network_error'
            });
        }
        
        // Handle timeout errors
        if (error.code === 'ECONNABORTED') {
            return Promise.reject({
                message: 'Request timed out. Please try again.',
                status: 'timeout'
            });
        }
        
        // Pass through the error response for handling by components
        return Promise.reject(error);
    }
);

export const uploadPDF = (formData) => {
    return api.post('/upload/', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

export const askQuestion = (data) => {
    return api.post('/question/', data);
};
