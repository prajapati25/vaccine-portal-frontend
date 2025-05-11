import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Download, Filter, Calendar, Search, Loader } from "lucide-react";
import axios, { API_ENDPOINTS } from "../api/axios";
import Layout from "../components/ui/Layout";
import { useAuth } from "../context/AuthContext";
import { exportApi } from '../api/exportApi';

const Reports = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    vaccine: "",
    grade: "",
    status: ""
  });
  const [availableVaccines, setAvailableVaccines] = useState([]);
  const [availableGrades, setAvailableGrades] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [exportStatus, setExportStatus] = useState({ loading: false, error: null });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchRecords();
    fetchVaccines();
    fetchGrades();
  }, [isAuthenticated, navigate, page, filters]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: page,
        size: 10,
        ...filters
      });

      const response = await axios.get(`${API_ENDPOINTS.VACCINATION_RECORDS}?${params}`);
      setRecords(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Failed to fetch records", error);
      setError("Failed to load vaccination records. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchVaccines = async () => {
    try {
      const response = await axios.get('/api/vaccines');
      setAvailableVaccines(response.data);
    } catch (error) {
      console.error("Failed to fetch vaccines", error);
    }
  };

  const fetchGrades = async () => {
    try {
      const response = await axios.get('/api/grades');
      setAvailableGrades(response.data);
    } catch (error) {
      console.error("Failed to fetch grades", error);
      // Fallback to common grades if API fails
      setAvailableGrades([
        "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5",
        "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10",
        "Grade 11", "Grade 12"
      ]);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPage(0); // Reset to first page when filters change
  };

  const handleExport = async (format) => {
    try {
      setExportStatus({ loading: true, error: null });
      
      // Convert filters to the format expected by the API
      const apiFilters = {
        startDate: filters.startDate,
        endDate: filters.endDate,
        vaccine: filters.vaccine,
        grade: filters.grade,
        status: filters.status
      };

      // Validate date range if both dates are provided
      if (apiFilters.startDate && apiFilters.endDate) {
        const start = new Date(apiFilters.startDate);
        const end = new Date(apiFilters.endDate);
        if (start > end) {
          throw new Error('Start date cannot be after end date');
        }
      }

      if (format === 'csv') {
        await exportApi.exportToCsv(apiFilters);
      } else if (format === 'pdf') {
        await exportApi.exportToPdf(apiFilters);
      }
      
      setExportStatus({ loading: false, error: null });
    } catch (error) {
      console.error(`Error exporting to ${format}:`, error);
      let errorMessage = 'Failed to export. Please try again.';
      
      if (error.response) {
        switch (error.response.status) {
          case 400:
            errorMessage = error.response.data?.message || 'Invalid filter parameters';
            break;
          case 413:
            errorMessage = 'Export data too large. Please apply more filters.';
            break;
          case 401:
            errorMessage = 'Session expired. Please login again.';
            break;
          default:
            errorMessage = `Server error (${error.response.status}). Please try again later.`;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setExportStatus({
        loading: false,
        error: errorMessage
      });
    }
  };

  const handleResetFilters = () => {
    setFilters({
      startDate: "",
      endDate: "",
      vaccine: "",
      grade: "",
      status: ""
    });
    setPage(0);
  };

  return (
    <Layout>
      <div className="w-full h-full">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Reports</h2>
          <p className="text-sm text-gray-600 mt-1">View and analyze vaccination statistics</p>
        </div>

        <div className="flex justify-end mb-6">
          <div className="flex space-x-4">
            <button
              onClick={handleExport}
              className="px-4 py-2 text-white rounded-md flex items-center transition-colors duration-200"
              style={{ backgroundColor: 'rgb(116, 120, 117)' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgb(96, 100, 97)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgb(116, 120, 117)'}
            >
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
            <button
              onClick={handleResetFilters}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Reset Filters
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vaccine
              </label>
              <select
                name="vaccine"
                value={filters.vaccine}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Vaccines</option>
                {availableVaccines.map(vaccine => (
                  <option key={vaccine.id} value={vaccine.name}>
                    {vaccine.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grade
              </label>
              <select
                name="grade"
                value={filters.grade}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Grades</option>
                {availableGrades.map(grade => (
                  <option key={grade} value={grade}>
                    {grade}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="COMPLETED">Completed</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Records Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader className="animate-spin text-blue-600" size={24} />
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No vaccination records found
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vaccine
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Grade
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dose
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {records.map((record) => (
                      <tr key={record.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.studentName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.vaccineName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(record.vaccinationDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.grade}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              record.status === "COMPLETED"
                                ? "bg-green-100 text-green-800"
                                : record.status === "SCHEDULED"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {record.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.doseNumber}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white transition-colors duration-200"
                    style={{ backgroundColor: page === 0 ? 'rgb(200, 200, 200)' : 'rgb(116, 120, 117)' }}
                    onMouseEnter={(e) => !page === 0 && (e.currentTarget.style.backgroundColor = 'rgb(96, 100, 97)')}
                    onMouseLeave={(e) => !page === 0 && (e.currentTarget.style.backgroundColor = 'rgb(116, 120, 117)')}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={page === totalPages - 1}
                    className="ml-3 relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white transition-colors duration-200"
                    style={{ backgroundColor: page === totalPages - 1 ? 'rgb(200, 200, 200)' : 'rgb(116, 120, 117)' }}
                    onMouseEnter={(e) => !(page === totalPages - 1) && (e.currentTarget.style.backgroundColor = 'rgb(96, 100, 97)')}
                    onMouseLeave={(e) => !(page === totalPages - 1) && (e.currentTarget.style.backgroundColor = 'rgb(116, 120, 117)')}
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing page <span className="font-medium">{page + 1}</span> of{" "}
                      <span className="font-medium">{totalPages}</span>
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => setPage(p => Math.max(0, p - 1))}
                        disabled={page === 0}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                        disabled={page === totalPages - 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Reports; 