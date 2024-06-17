import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000',
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
