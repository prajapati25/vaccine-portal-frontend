import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Plus, Edit, AlertCircle, Check, X, Clock, Loader, Trash2, Info } from "lucide-react";
import axios, { API_ENDPOINTS } from "../api/axios";
import Layout from "../components/ui/Layout";
import DriveForm from "../components/ui/DriveForm";
import { useAuth } from "../context/AuthContext";
import Tooltip from "../components/ui/Tooltip";

const DrivesManagement = () => {
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingDrive, setEditingDrive] = useState(null);
  const [availableVaccines, setAvailableVaccines] = useState([]);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [selectedDriveRecords, setSelectedDriveRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to beginning of day for accurate comparison

  // Fetch initial data
  useEffect(() => {
    fetchDrives();
    fetchVaccines();
    fetchClasses();
  }, [navigate]);

  // Fetch drives
  const fetchDrives = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(API_ENDPOINTS.DRIVES);
      
      // Handle paginated response
      if (response.data && response.data.content) {
        setDrives(response.data.content);
        setTotalPages(response.data.totalPages);
        setTotalElements(response.data.totalElements);
      } else {
        setDrives([]);
        setTotalPages(0);
        setTotalElements(0);
      }
    } catch (error) {
      console.error("Failed to fetch drives", error);
      setError("Failed to load vaccination drives. Please try again later.");
      setDrives([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  };

  // Fetch available vaccines
  const fetchVaccines = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.VACCINES);
      setAvailableVaccines(response.data || []);
    } catch (error) {
      console.error("Failed to fetch vaccines", error);
      setAvailableVaccines([]);
    }
  };

  // Fetch available classes/grades
  const fetchClasses = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.GRADES);
      setAvailableClasses(response.data.map(grade => ({ id: grade.split(' ')[1], name: grade })) || []);
    } catch (error) {
      console.error("Failed to fetch grades", error);
      // Fallback to common grades if API fails
      setAvailableClasses([
        { id: 1, name: "Grade 1" },
        { id: 2, name: "Grade 2" },
        { id: 3, name: "Grade 3" },
        { id: 4, name: "Grade 4" },
        { id: 5, name: "Grade 5" },
        { id: 6, name: "Grade 6" },
        { id: 7, name: "Grade 7" },
        { id: 8, name: "Grade 8" },
        { id: 9, name: "Grade 9" },
        { id: 10, name: "Grade 10" },
        { id: 11, name: "Grade 11" },
        { id: 12, name: "Grade 12" }
      ]);
    }
  };

  // Handle edit drive
  const handleEditDrive = (drive) => {
    // Check if drive is in the past
    if (isPastDrive(drive.driveDate)) {
      return; // Don't allow editing past drives
    }
    
    // Format the date properly for the form
    const formattedDrive = {
      ...drive,
      date: new Date(drive.driveDate).toISOString().split('T')[0], // Format as YYYY-MM-DD
      vaccineId: drive.vaccine?.id,
      targetClasses: drive.applicableGrades.split(',').map(grade => grade.trim())
    };
    setEditingDrive(formattedDrive);
    setShowForm(true);
  };

  // Handle delete drive
  const handleDeleteDrive = async (driveId) => {
    if (window.confirm("Are you sure you want to delete this vaccination drive?")) {
      try {
        await axios.delete(API_ENDPOINTS.DRIVE_BY_ID(driveId));
        fetchDrives(); // Refresh the list
      } catch (err) {
        console.error("Failed to delete drive", err);
      }
    }
  };

  // Handle save drive
  const handleSaveDrive = async (driveData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Make sure drive date is at least 15 days in the future
      const driveDate = new Date(driveData.date);
      const minimumDate = new Date();
      minimumDate.setDate(minimumDate.getDate() + 15);
      
      if (driveDate < minimumDate && !driveData.id) {
        setError("Vaccination drives must be scheduled at least 15 days in advance.");
        return { error: "Vaccination drives must be scheduled at least 15 days in advance." };
      }

      // Check for overlapping drives
      const overlappingDrive = drives.find(drive => {
        if (drive.id === driveData.id) return false;
        
        const existingDate = new Date(drive.date);
        existingDate.setHours(0, 0, 0, 0);
        
        driveDate.setHours(0, 0, 0, 0);
        
        if (existingDate.getTime() === driveDate.getTime() && 
            drive.vaccineId === driveData.vaccineId) {
          return drive.targetClasses.some(classId => 
            driveData.targetClasses.includes(classId)
          );
        }
        
        return false;
      });
      
      if (overlappingDrive) {
        setError("An overlapping vaccination drive exists for the same date, vaccine, and some of the selected classes.");
        return { 
          error: "An overlapping vaccination drive exists for the same date, vaccine, and some of the selected classes." 
        };
      }

      // Map form data to backend expected format
      const drivePayload = {
        id: driveData.id,
        vaccine: { id: driveData.vaccineId },
        driveDate: driveData.date,
        availableDoses: driveData.availableDoses,
        applicableGrades: driveData.targetClasses.join(','),
        status: "SCHEDULED",
        isActive: true
      };

      if (driveData.id) {
        // Update existing drive
        await axios.put(API_ENDPOINTS.DRIVE_BY_ID(driveData.id), drivePayload);
      } else {
        // Add new drive
        await axios.post(API_ENDPOINTS.DRIVES, drivePayload);
      }
      
      // Refresh drives list
      fetchDrives();
      setShowForm(false);
      setEditingDrive(null);
      return { success: true };
    } catch (error) {
      console.error("Failed to save drive", error);
      const errorMessage = error.response?.data?.message || "Failed to save vaccination drive";
      setError(errorMessage);
      return { error: errorMessage };
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Check if a drive is in the past
  const isPastDrive = (dateString) => {
    const driveDate = new Date(dateString);
    driveDate.setHours(0, 0, 0, 0);
    return driveDate < today;
  };
  
  // Check if drive is upcoming (within next 7 days)
  const isUpcomingDrive = (dateString) => {
    const driveDate = new Date(dateString);
    driveDate.setHours(0, 0, 0, 0);
    return driveDate > today;
  };

  // Get status of drive
  const getDriveStatus = (drive) => {
    if (drive.isCompleted) {
      return { 
        label: "Completed", 
        icon: <Check size={16} className="text-green-500" />,
        color: "text-green-600 bg-green-100"
      };
    }
    if (isPastDrive(drive.driveDate)) {
      return { 
        label: "Overdue", 
        icon: <AlertCircle size={16} className="text-red-500" />,
        color: "text-red-600 bg-red-100"
      };
    }
    if (isUpcomingDrive(drive.driveDate)) {
      return { 
        label: "Upcoming", 
        icon: <Clock size={16} className="text-yellow-500" />,
        color: "text-yellow-600 bg-yellow-100"
      };
    }
    return { 
      label: "Scheduled", 
      icon: <Calendar size={16} className="text-indigo-500" />,
      color: "text-indigo-600 bg-indigo-100"
    };
  };

  // Update fetchDriveRecords to handle paginated response
  const fetchDriveRecords = async (driveId) => {
    try {
      // If records are already shown for this drive, hide them
      if (selectedDriveRecords.length > 0 && selectedDriveRecords[0].vaccinationDriveId === driveId) {
        setSelectedDriveRecords([]);
        return;
      }

      setLoadingRecords(true);
      const response = await axios.get(`/vaccination-drives/${driveId}/records`);
      // Handle paginated response for records
      if (response.data && response.data.content) {
        setSelectedDriveRecords(response.data.content);
      } else {
        setSelectedDriveRecords([]);
      }
    } catch (error) {
      console.error("Failed to fetch drive records", error);
      setError("Failed to load vaccination records");
      setSelectedDriveRecords([]);
    } finally {
      setLoadingRecords(false);
    }
  };

  // Update the drive list rendering to show records in a better format
  const renderDriveList = () => (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-800">Scheduled Vaccination Drives</h2>
        <div className="text-sm text-gray-500">{drives.length} drives found</div>
      </div>
      
      {drives.length === 0 ? (
        <div className="p-12 text-center">
          <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-lg font-medium text-gray-500">No vaccination drives scheduled</p>
          <p className="text-sm text-gray-400 mt-2 mb-6">Schedule a new vaccination drive to get started.</p>
          <button
            onClick={() => {
              setEditingDrive(null);
              setShowForm(true);
            }}
            className="inline-flex items-center px-4 py-2 text-white rounded-md transition-colors duration-200"
            style={{ backgroundColor: 'rgb(116, 120, 117)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgb(96, 100, 97)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgb(116, 120, 117)'}
          >
            <Plus size={16} className="mr-1" />
            Schedule Drive
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vaccine
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Available Doses
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Target Grades
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {drives.map((drive) => {
                const isPast = isPastDrive(drive.driveDate);
                const status = getDriveStatus(drive);
                
                return (
                  <>
                    <tr key={drive.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{drive.vaccine?.name || 'Unknown Vaccine'}</div>
                        <div className="text-sm text-gray-500">Batch: {drive.vaccineBatch || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(drive.driveDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${status.color}`}>
                          {status.icon}
                          <span className="ml-1">{status.label}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {drive.availableDoses}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {drive.applicableGrades}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-3">
                          <button
                            onClick={() => fetchDriveRecords(drive.id)}
                            className={`px-3 py-1 text-sm rounded-md transition ${
                              selectedDriveRecords.length > 0 && selectedDriveRecords[0].vaccinationDriveId === drive.id
                                ? 'bg-blue-600 text-white'
                                : 'text-white'
                            }`}
                            style={{ backgroundColor: 'rgb(116, 120, 117)' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgb(96, 100, 97)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgb(116, 120, 117)'}
                          >
                            {selectedDriveRecords.length > 0 && selectedDriveRecords[0].vaccinationDriveId === drive.id
                              ? 'Hide Records'
                              : 'View Records'}
                          </button>
                          
                          {isPast ? (
                            <Tooltip content="Cannot modify past drives">
                              <span className="p-2 text-gray-300 cursor-not-allowed">
                                <Edit size={16} />
                              </span>
                            </Tooltip>
                          ) : (
                            <button
                              onClick={() => handleEditDrive(drive)}
                              className="text-white rounded-md transition-colors duration-200"
                              style={{ backgroundColor: 'rgb(116, 120, 117)' }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgb(96, 100, 97)'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgb(116, 120, 117)'}
                            >
                              <Edit size={16} />
                            </button>
                          )}
                          
                          {isPast ? (
                            <Tooltip content="Cannot delete past drives">
                              <span className="p-2 text-gray-300 cursor-not-allowed">
                                <Trash2 size={16} />
                              </span>
                            </Tooltip>
                          ) : (
                            <button
                              onClick={() => handleDeleteDrive(drive.id)}
                              className="text-white rounded-md transition-colors duration-200"
                              style={{ backgroundColor: 'rgb(116, 120, 117)' }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgb(96, 100, 97)'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgb(116, 120, 117)'}
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {selectedDriveRecords.length > 0 && selectedDriveRecords[0].vaccinationDriveId === drive.id && (
                      <tr>
                        <td colSpan="6" className="px-6 py-4 bg-gray-50">
                          <div className="rounded-lg border border-gray-200 bg-white">
                            <div className="p-4 border-b border-gray-200">
                              <h4 className="text-sm font-medium text-gray-700">Vaccination Records ({selectedDriveRecords.length})</h4>
                            </div>
                            {loadingRecords ? (
                              <div className="text-center py-4">
                                <Loader className="animate-spin text-blue-600 mx-auto" size={16} />
                              </div>
                            ) : (
                              <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dose</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Administered By</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Side Effects</th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-200">
                                    {selectedDriveRecords.map((record) => (
                                      <tr key={record.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-2 text-sm text-gray-900">
                                          {record.studentName}
                                          <div className="text-xs text-gray-500">{record.studentId}</div>
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-900">Dose {record.doseNumber}</td>
                                        <td className="px-4 py-2 text-sm text-gray-900">
                                          {new Date(record.vaccinationDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-2 text-sm">
                                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            record.status === 'COMPLETED' 
                                              ? 'bg-green-100 text-green-800'
                                              : record.status === 'SCHEDULED'
                                              ? 'bg-blue-100 text-blue-800'
                                              : 'bg-yellow-100 text-yellow-800'
                                          }`}>
                                            {record.status}
                                          </span>
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-900">{record.administeredBy}</td>
                                        <td className="px-4 py-2 text-sm text-gray-900">{record.sideEffects || 'None reported'}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  if (loading) return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-xl flex items-center space-x-3">
        <Loader className="animate-spin text-blue-600" size={24} />
        <span className="text-gray-700">Loading vaccination drives...</span>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="w-full h-full">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Vaccination Drives</h2>
          <p className="text-sm text-gray-600 mt-1">Manage and schedule vaccination drives</p>
        </div>

        <div className="flex justify-end mb-6">
          <div className="flex space-x-4">
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 text-white rounded-md transition-colors duration-200"
              style={{ backgroundColor: 'rgb(116, 120, 117)' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgb(96, 100, 97)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgb(116, 120, 117)'}
            >
              <Plus size={16} className="mr-1" />
              Schedule Drive
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center text-red-600">
              <AlertCircle size={20} className="mr-2" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="p-6 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SummaryCard 
              title="Total Drives" 
              value={totalElements} 
              icon={<Calendar size={20} className="text-blue-600" />}
              color="bg-blue-50 border-blue-200"
            />
            <SummaryCard 
              title="Upcoming Drives" 
              value={drives.filter(d => new Date(d.driveDate) > today).length} 
              icon={<Clock size={20} className="text-yellow-600" />}
              color="bg-yellow-50 border-yellow-200"
            />
            <SummaryCard 
              title="Completed Drives" 
              value={drives.filter(d => new Date(d.driveDate) < today).length}
              icon={<Check size={20} className="text-green-600" />}
              color="bg-green-50 border-green-200"
            />
          </div>

          {/* Updated Drives List */}
          {renderDriveList()}
        </div>

        {/* Drive Form Modal */}
        {showForm && (
          <DriveForm
            drive={editingDrive}
            onClose={() => {
              setShowForm(false);
              setEditingDrive(null);
              setError(null);
            }}
            onSave={handleSaveDrive}
            availableVaccines={availableVaccines}
            availableClasses={availableClasses}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </Layout>
  );
};

// Helper Component
const SummaryCard = ({ title, value, icon, color }) => (
  <div className={`${color} rounded-xl p-6 shadow-md border flex items-center`}>
    <div className="mr-4 p-3 rounded-full bg-white shadow-sm">
      {icon}
    </div>
    <div>
      <div className="text-2xl font-bold text-gray-800">{value}</div>
      <div className="text-sm text-gray-600">{title}</div>
    </div>
  </div>
);

export default DrivesManagement;