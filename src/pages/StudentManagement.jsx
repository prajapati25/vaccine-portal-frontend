import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Upload, Search, Plus, Edit, Trash2, Filter, Download } from "lucide-react";
import axios, { API_ENDPOINTS } from "../api/axios";
import Layout from "../components/ui/Layout";
import StudentList from "../components/ui/StudentList";
import StudentForm from "../components/ui/StudentForm";
import ImportCSV from "../components/ImportCSV";
import { useAuth } from "../context/AuthContext";

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    grade: "",
    section: "",
    vaccinationStatus: "",
    gender: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const { auth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudents();
  }, [navigate, page, searchTerm, filters]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        size: '10',
        sortBy: 'name',
        direction: 'ASC'
      });

      // Add search and filter parameters if they exist
      if (searchTerm) {
        params.append('name', searchTerm);
      }
      if (filters.grade) {
        params.append('grade', filters.grade);
      }
      if (filters.section) {
        params.append('section', filters.section);
      }
      if (filters.vaccinationStatus) {
        params.append('vaccinationStatus', filters.vaccinationStatus);
      }
      if (filters.gender) {
        params.append('gender', filters.gender);
      }

      const response = await axios.get(`${API_ENDPOINTS.STUDENTS}?${params.toString()}`);
      
      if (response.data && response.data.content) {
        setStudents(response.data.content);
        setTotalPages(response.data.totalPages);
        setTotalElements(response.data.totalElements);
      } else {
        setStudents([]);
        setTotalPages(0);
        setTotalElements(0);
      }
    } catch (error) {
      console.error("Failed to fetch students", error);
      setError("Failed to load students. Please try again later.");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveStudent = async (studentData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      let response;
      if (selectedStudent) {
        response = await axios.put(`/students/${selectedStudent.id}`, studentData);
      } else {
        response = await axios.post("/students", studentData);
      }

      await fetchStudents();
      setShowForm(false);
      setSelectedStudent(null);
      return { success: true };
    } catch (error) {
      console.error("Failed to save student", error);
      const errorMessage = error.response?.data?.message || "Failed to save student";
      setError(errorMessage);
      return { error: errorMessage };
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditStudent = (student) => {
    setSelectedStudent({
      ...student,
      name: student.name,
      grade: student.grade,
      section: student.section,
      gender: student.gender,
      dateOfBirth: student.dateOfBirth,
      parentName: student.parentName,
      contactNumber: student.contactNumber,
      address: student.address,
    });
    setShowForm(true);
  };

  const handleDeleteStudent = async (id) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      try {
        await axios.delete(API_ENDPOINTS.STUDENT_BY_ID(id));
        fetchStudents();
      } catch (error) {
        console.error("Failed to delete student", error);
        setError("Failed to delete student. Please try again later.");
      }
    }
  };

  const handleImportComplete = (importedStudents) => {
    fetchStudents();
    setShowImport(false);
  };

  const handleExport = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.STUDENTS_EXPORT, {
        responseType: 'blob'
      });
      
      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'students.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Failed to export students", error);
      setError("Failed to export students. Please try again later.");
    }
  };

  return (
    <Layout>
      <div className="w-full h-full">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Student Management</h2>
          <p className="text-sm text-gray-600 mt-1">Manage student records and vaccination status</p>
        </div>

        <div className="flex justify-end mb-6">
          <div className="flex space-x-4">
            <button
              onClick={() => setShowImport(true)}
              className="px-4 py-2 text-white rounded-md flex items-center transition-colors duration-200"
              style={{ backgroundColor: 'rgb(116, 120, 117)' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgb(96, 100, 97)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgb(116, 120, 117)'}
            >
              <Upload className="w-4 h-4 mr-2" />
              Import CSV
            </button>
            <button
              onClick={handleExport}
              className="px-4 py-2 text-white rounded-md flex items-center transition-colors duration-200"
              style={{ backgroundColor: 'rgb(116, 120, 117)' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgb(96, 100, 97)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgb(116, 120, 117)'}
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </button>
            <button
              onClick={() => {
                setSelectedStudent(null);
                setShowForm(true);
              }}
              className="px-4 py-2 text-white rounded-md flex items-center transition-colors duration-200"
              style={{ backgroundColor: 'rgb(116, 120, 117)' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgb(96, 100, 97)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgb(116, 120, 117)'}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Student
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="col-span-1 md:col-span-2 lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by name or roll number"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(0); // Reset to first page on search
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <select
                value={filters.grade}
                onChange={(e) => {
                  setFilters({ ...filters, grade: e.target.value });
                  setPage(0); // Reset to first page on filter change
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Grades</option>
                <option value="1">Grade 1</option>
                <option value="2">Grade 2</option>
                <option value="3">Grade 3</option>
                <option value="4">Grade 4</option>
                <option value="5">Grade 5</option>
              </select>
            </div>
            <div>
              <select
                value={filters.section}
                onChange={(e) => {
                  setFilters({ ...filters, section: e.target.value });
                  setPage(0); // Reset to first page on filter change
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Sections</option>
                <option value="A">Section A</option>
                <option value="B">Section B</option>
                <option value="C">Section C</option>
              </select>
            </div>
            <div>
              <select
                value={filters.vaccinationStatus}
                onChange={(e) => {
                  setFilters({ ...filters, vaccinationStatus: e.target.value });
                  setPage(0); // Reset to first page on filter change
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="vaccinated">Vaccinated</option>
                <option value="not_vaccinated">Not Vaccinated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Students List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <StudentList
            students={students}
            loading={loading}
            page={page}
            totalPages={totalPages}
            setPage={setPage}
            onEdit={handleEditStudent}
            onDelete={handleDeleteStudent}
          />
        </div>
      </div>

      {/* Student Form Modal */}
      {showForm && (
        <StudentForm
          student={selectedStudent}
          onCancel={() => {
            setShowForm(false);
            setSelectedStudent(null);
            setError(null);
          }}
          onSave={handleSaveStudent}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Import CSV Modal */}
      {showImport && (
        <ImportCSV
          onImportComplete={handleImportComplete}
          onClose={() => setShowImport(false)}
        />
      )}
    </Layout>
  );
};

export default StudentManagement;