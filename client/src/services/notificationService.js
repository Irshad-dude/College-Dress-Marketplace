import api from './api';

export const getNotifications = () => api.get('/notifications');
export const markAllRead = () => api.patch('/notifications/read');
export const markOneRead = (id) => api.patch(`/notifications/${id}/read`);
