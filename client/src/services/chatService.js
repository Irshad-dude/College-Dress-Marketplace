import api from './api';

export const createOrGetChat = (data) => api.post('/chats', data);
export const getUserChats = () => api.get('/chats');
export const getMessages = (chatId) => api.get(`/chats/${chatId}/messages`);
export const sendMessage = (data) => api.post('/messages', data);
