import axios from 'axios';

const baseURL = process.env.BASE_URL || 'https://pdf-chatbot-6jte.onrender.com';

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
