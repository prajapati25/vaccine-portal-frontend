import { useState } from "react";
import { Edit, Check, AlertCircle, ChevronLeft, ChevronRight, Users, Trash2 } from "lucide-react";

const StudentList = ({
  students,
  loading,
  page,
  totalPages,
  setPage,
  onEdit,
  onVaccinate,
  availableVaccines,
  onDelete
}) => {
  const [selectedVaccine, setSelectedVaccine] = useState("");
  const [selectedDrive, setSelectedDrive] = useState("");
  const [vaccinationStatus, setVaccinationStatus] = useState({});
  const [availableDrives, setAvailableDrives] = useState([]);

  // Handle vaccine selection change
  const handleVaccineChange = async (e, studentId) => {
    const vaccineId = e.target.value;
    setSelectedVaccine(vaccineId);
    
    // Clear previous status
    setVaccinationStatus({
      ...vaccinationStatus,
      [studentId]: {
        loading: false,
        error: null,
        success: false
      }
    });
    
    // Reset drive selection
    setSelectedDrive("");
    
    if (vaccineId) {
      try {
        // Fetch available drives for this vaccine
        const response = await fetch(`/api/drives?vaccineId=${vaccineId}`);
        const data = await response.json();
        setAvailableDrives(data || []);
      } catch (error) {
        console.error("Failed to fetch drives", error);
      }
    } else {
      setAvailableDrives([]);
    }
  };

  // Handle vaccination submission
  const handleVaccinate = async (studentId) => {
    if (!selectedVaccine || !selectedDrive) {
      setVaccinationStatus({
        ...vaccinationStatus,
        [studentId]: {
          loading: false,
          error: "Please select both vaccine and drive",
          success: false
        }
      });
      return;
    }
    
    // Set loading state
    setVaccinationStatus({
      ...vaccinationStatus,
      [studentId]: {
        loading: true,
        error: null,
        success: false
      }
    });
    
    try {
      const result = await onVaccinate(studentId, selectedVaccine, selectedDrive);
      
      if (result.error) {
        setVaccinationStatus({
          ...vaccinationStatus,
          [studentId]: {
            loading: false,
            error: result.error,
            success: false,
            alreadyVaccinated: result.alreadyVaccinated
          }
        });
      } else {
        setVaccinationStatus({
          ...vaccinationStatus,
          [studentId]: {
            loading: false,
            error: null,
            success: true
          }
        });
        
        // Reset selections after success
        setSelectedVaccine("");
        setSelectedDrive("");
        setAvailableDrives([]);
      }
    } catch (error) {
      setVaccinationStatus({
        ...vaccinationStatus,
        [studentId]: {
          loading: false,
          error: "Failed to process vaccination",
          success: false
        }
      });
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Loading students...
      </div>
    );
  }

  if (!students || students.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        No students found. Add a new student or import from CSV.
      </div>
    );
  }

  const handlePreviousPage = () => {
    if (page > 0) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages - 1) {
      setPage(page + 1);
    }
  };

  return (
    <div>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Roll Number
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Grade
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Section
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Gender
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Vaccination Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {students.map((student) => (
              <tr key={student.studentId} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {student.studentId}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {student.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {student.grade}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {student.section}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {student.gender}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    student.isVaccinated
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {student.isVaccinated ? "Vaccinated" : "Not Vaccinated"}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-3">
                  <button
                    onClick={() => onEdit(student)}
                    className="text-white rounded-md transition-colors duration-200"
                    style={{ backgroundColor: 'rgb(116, 120, 117)' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgb(96, 100, 97)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgb(116, 120, 117)'}
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(student.id)}
                    className="text-white rounded-md transition-colors duration-200"
                    style={{ backgroundColor: 'rgb(116, 120, 117)' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgb(96, 100, 97)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgb(116, 120, 117)'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={handlePreviousPage}
              disabled={page === 0}
              className="relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white transition-colors duration-200"
              style={{ backgroundColor: page === 0 ? 'rgb(200, 200, 200)' : 'rgb(116, 120, 117)' }}
              onMouseEnter={(e) => !page === 0 && (e.currentTarget.style.backgroundColor = 'rgb(96, 100, 97)')}
              onMouseLeave={(e) => !page === 0 && (e.currentTarget.style.backgroundColor = 'rgb(116, 120, 117)')}
            >
              Previous
            </button>
            <button
              onClick={handleNextPage}
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
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={handlePreviousPage}
                  disabled={page === 0}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                    page === 0
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={page === totalPages - 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                    page === totalPages - 1
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <span className="sr-only">Next</span>
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentList;