import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export const exportApi = {
    exportToCsv: async (filters) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/exports/csv`, {
                params: filters,
                responseType: 'blob',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
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
            const response = await axios.get(`${API_BASE_URL}/exports/pdf`, {
                params: filters,
                responseType: 'blob',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
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