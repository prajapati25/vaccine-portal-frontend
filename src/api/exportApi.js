import axiosInstance from './axios';
import { API_ENDPOINTS } from './axios';

export const exportApi = {
    exportToCsv: async (filters) => {
        try {
            const response = await axiosInstance.get(API_ENDPOINTS.VACCINATION_RECORDS_EXPORT, {
                params: {
                    ...filters,
                    format: 'csv'
                },
                responseType: 'blob'
            });
            
            // Create a download link and trigger it
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', response.headers['content-disposition']?.split('filename=')[1] || 'vaccination_records.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            
            return true;
        } catch (error) {
            console.error('Error exporting to CSV:', error);
            throw error;
        }
    },

    exportToPdf: async (filters) => {
        try {
            const response = await axiosInstance.get(API_ENDPOINTS.VACCINATION_RECORDS_EXPORT, {
                params: {
                    ...filters,
                    format: 'pdf'
                },
                responseType: 'blob'
            });
            
            // Create a download link and trigger it
            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', response.headers['content-disposition']?.split('filename=')[1] || 'vaccination_records.pdf');
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            
            return true;
        } catch (error) {
            console.error('Error exporting to PDF:', error);
            throw error;
        }
    }
}; 