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
});

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
