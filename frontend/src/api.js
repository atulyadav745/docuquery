import axios from 'axios';

let baseURL;
if (process.env.NODE_ENV === 'development') {
    baseURL = 'http://localhost:8000'; 
} else {
    baseURL = 'https://aiplanet-3in4.onrender.com'; 
}

const api = axios.create({
    baseURL: baseURL,
});

export const uploadPDF = (formData) => {
    return api.post('/upload/', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};

export const askQuestion = (data) => {
    return api.post('/question/', data);
};
