import { AxiosInstance } from 'axios';

export function reasonableErrorMessages(axios: AxiosInstance) {
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      const sanitizedError = {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url,
        method: error.config?.method,
        data: error.response?.data,
      };

      return Promise.reject(sanitizedError);
    }
  );
}
