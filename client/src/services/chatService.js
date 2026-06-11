import api from './api';

export const createOrGetChat = (data) => api.post('/chats', data);
export const getUserChats = () => api.get('/chats');
export const getMessages = (chatId, params = {}) => api.get(`/messages/${chatId}`, { params });
export const sendMessage = (data) => api.post('/messages', data);
