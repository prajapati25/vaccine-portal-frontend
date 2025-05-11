import axios from 'axios';

const instance = axios.create({
    baseURL: 'http://localhost:8080/api',  // Backend base URL
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for adding auth token
instance.interceptors.request.use(
    (config) => {
        // Skip adding token for login request
        if (config.url === API_ENDPOINTS.LOGIN) {
            return config;
        }
        
        // For all other requests, add the token
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('Token being sent with request:', config.url);
        } else {
            console.warn('No token found for request:', config.url);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for handling errors
instance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear token and redirect to login only if not already on login page
            if (!window.location.pathname.includes('/login')) {
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// API endpoint mapping
export const API_ENDPOINTS = {
    // Auth
    LOGIN: '/user/login',
    
    // Students
    STUDENTS: '/students',
    STUDENT_BY_ID: (studentId) => `/students/${studentId}`,
    STUDENTS_BY_GRADE: (grade) => `/students/grade/${grade}`,
    STUDENTS_SEARCH: '/students/search',
    STUDENTS_IMPORT: '/students/import',
    STUDENTS_EXPORT: '/students/export',
    
    // Vaccination Drives
    DRIVES: '/vaccination-drives',
    DRIVE_BY_ID: (id) => `/vaccination-drives/${id}`,
    UPCOMING_DRIVES: '/vaccination-drives/upcoming',
    DRIVES_BY_GRADE: (grade) => `/vaccination-drives/grade/${grade}`,
    
    // Vaccination Records
    VACCINATION_RECORDS: '/vaccination-records',
    VACCINATION_RECORD_BY_ID: (id) => `/vaccination-records/${id}`,
    VACCINATION_RECORDS_BY_STUDENT: (studentId) => `/vaccination-records/student/${studentId}`,
    VACCINATION_RECORDS_BY_STUDENT_STATUS: (studentId, status) => `/vaccination-records/student/${studentId}/status/${status}`,
    VACCINATION_RECORDS_EXPORT: '/vaccination-records/export',
    
    // Appointments
    APPOINTMENTS: '/appointments',
    APPOINTMENT_BY_ID: (id) => `/appointments/${id}`,
    
    // Dashboard
    DASHBOARD: {
        STUDENT_COUNT: '/dashboard/students/count',
        VACCINES_ADMINISTERED: '/dashboard/vaccines/administered',
        VACCINES_DUE_SOON: '/dashboard/vaccines/due-soon',
        VACCINES_OVERDUE: '/dashboard/vaccines/overdue',
        VACCINATIONS_BY_GRADE: '/dashboard/vaccinations/by-grade',
        VACCINATIONS_STATUS: '/dashboard/vaccinations/status-summary',
        UPCOMING_DRIVES: '/dashboard/upcoming-drives'
    },

    // New endpoints
    VACCINES: '/vaccines',
    GRADES: '/grades'
};

// Helper function to check if token exists
export const checkToken = () => {
    const token = localStorage.getItem('token');
    console.log('Current token:', token ? 'exists' : 'not found');
    return !!token;
};

export default instance; 