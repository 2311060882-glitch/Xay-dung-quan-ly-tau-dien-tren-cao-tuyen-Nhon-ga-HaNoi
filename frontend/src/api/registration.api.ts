import axiosInstance from './axios';

export interface PriorityRegistrationPayload {
    is_for_other: boolean;
    full_name: string;
    dob: string;
    id_card: string;
    phone: string;
    email?: string;
    category: string;
}

export const registrationApi = {
  submit: (data: PriorityRegistrationPayload) =>
    axiosInstance.post('/registration/submit.php', data),

  getHistory: () =>
    axiosInstance.get('/registration/history.php'),
};