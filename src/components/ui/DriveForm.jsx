import { useState, useEffect } from "react";
import { X, Calendar, Syringe, Users, AlertCircle, Loader } from "lucide-react";

const DriveForm = ({ 
  drive, 
  availableVaccines, 
  availableClasses, 
  onClose, 
  onSave,
  isSubmitting 
}) => {
  const [formData, setFormData] = useState({
    vaccineId: "",
    vaccineName: "",
    date: "",
    availableDoses: 0,
    targetClasses: [],
    vaccineBatch: "",
    minimumAge: "",
    notes: ""
  });
  const [errors, setErrors] = useState({});
  const [submissionError, setSubmissionError] = useState("");
  
  const isEditing = !!drive?.id;
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 15);
  const minDateString = minDate.toISOString().split('T')[0];

  // Load drive data if editing
  useEffect(() => {
    if (drive) {
      // Format date for date input (YYYY-MM-DD)
      let formattedDate;
      try {
        // Handle both ISO string and date object formats
        const driveDate = drive.date || drive.driveDate;
        if (typeof driveDate === 'string') {
          // If it's already in YYYY-MM-DD format, use it directly
          if (driveDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
            formattedDate = driveDate;
          } else {
            // Otherwise parse and format it
            formattedDate = new Date(driveDate).toISOString().split('T')[0];
          }
        } else if (driveDate instanceof Date) {
          formattedDate = driveDate.toISOString().split('T')[0];
        } else {
          // Fallback to current date if date is invalid
          formattedDate = new Date().toISOString().split('T')[0];
        }
      } catch (error) {
        console.error('Error formatting date:', error);
        formattedDate = new Date().toISOString().split('T')[0];
      }
      
      // Handle target classes - convert string to array of numbers
      let targetClassesArray = [];
      if (drive.applicableGrades) {
        if (typeof drive.applicableGrades === 'string') {
          targetClassesArray = drive.applicableGrades.split(',').map(grade => parseInt(grade.trim()));
        } else if (Array.isArray(drive.applicableGrades)) {
          targetClassesArray = drive.applicableGrades.map(grade => parseInt(grade));
        }
      }
      
      setFormData({
        id: drive.id,
        vaccineId: drive.vaccineId || "",
        vaccineName: drive.vaccineName || "",
        date: formattedDate,
        availableDoses: drive.availableDoses || 0,
        targetClasses: targetClassesArray,
        vaccineBatch: drive.vaccineBatch || "",
        minimumAge: drive.minimumAge || "",
        notes: drive.notes || ""
      });
    }
  }, [drive]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for the field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
    
    // If changing vaccine, update the vaccine name
    if (name === "vaccineId") {
      const selectedVaccine = availableVaccines.find(v => v.id.toString() === value.toString());
      if (selectedVaccine) {
        setFormData(prev => ({
          ...prev,
          vaccineName: selectedVaccine.name
        }));
      }
    }
  };

  // Handle checkbox change for target classes
  const handleClassChange = (classId) => {
    setFormData(prev => {
      const currentSelection = [...prev.targetClasses];
      const classIdNum = Number(classId);
      
      // Toggle the selection
      const newSelection = currentSelection.includes(classIdNum)
        ? currentSelection.filter(id => id !== classIdNum)
        : [...currentSelection, classIdNum];
      
      return {
        ...prev,
        targetClasses: newSelection
      };
    });
    
    // Clear error for target classes
    if (errors.targetClasses) {
      setErrors(prev => ({
        ...prev,
        targetClasses: ""
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const newErrors = {};
    if (!formData.vaccineId) newErrors.vaccineId = "Please select a vaccine";
    if (!formData.date) newErrors.date = "Please select a date";
    if (formData.availableDoses <= 0) newErrors.availableDoses = "Available doses must be greater than 0";
    if (formData.targetClasses.length === 0) newErrors.targetClasses = "Please select at least one class";
    if (!formData.vaccineBatch) newErrors.vaccineBatch = "Please enter vaccine batch number";
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    try {
      setSubmissionError("");
      const result = await onSave(formData);
      if (result?.error) {
        setSubmissionError(result.error);
      }
    } catch (error) {
      setSubmissionError("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">
            {isEditing ? "Edit Vaccination Drive" : "Schedule New Vaccination Drive"}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
            disabled={isSubmitting}
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          {/* Submission Error Message */}
          {submissionError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <AlertCircle className="text-red-500 mr-3 flex-shrink-0 mt-0.5" size={16} />
              <div className="text-red-700 text-sm">{submissionError}</div>
            </div>
          )}
          
          {/* Vaccine Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vaccine <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Syringe size={16} className="text-gray-400" />
              </div>
              <select
                name="vaccineId"
                value={formData.vaccineId}
                onChange={handleChange}
                disabled={isEditing || isSubmitting}
                className={`block w-full pl-10 pr-10 py-2 border ${
                  errors.vaccineId ? 'border-red-300' : 'border-gray-300'
                } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  isEditing ? 'bg-gray-100' : ''
                }`}
              >
                <option value="">Select a vaccine</option>
                {availableVaccines.map(vaccine => (
                  <option key={vaccine.id} value={vaccine.id}>
                    {vaccine.name}
                  </option>
                ))}
              </select>
            </div>
            {errors.vaccineId && (
              <p className="mt-1 text-sm text-red-600">{errors.vaccineId}</p>
            )}
          </div>
          
          {/* Vaccine Batch */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vaccine Batch <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="vaccineBatch"
              value={formData.vaccineBatch}
              onChange={handleChange}
              disabled={isSubmitting}
              placeholder="Enter vaccine batch number"
              className={`block w-full px-3 py-2 border ${
                errors.vaccineBatch ? 'border-red-300' : 'border-gray-300'
              } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
            />
            {errors.vaccineBatch && (
              <p className="mt-1 text-sm text-red-600">{errors.vaccineBatch}</p>
            )}
          </div>
          
          {/* Drive Date */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Drive Date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar size={16} className="text-gray-400" />
              </div>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                min={isEditing ? undefined : minDateString}
                disabled={isSubmitting}
                className={`block w-full pl-10 pr-3 py-2 border ${
                  errors.date ? 'border-red-300' : 'border-gray-300'
                } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
              />
            </div>
            {!isEditing && (
              <p className="mt-1 text-xs text-gray-500">
                Drives must be scheduled at least 15 days in advance.
              </p>
            )}
            {errors.date && (
              <p className="mt-1 text-sm text-red-600">{errors.date}</p>
            )}
          </div>
          
          {/* Available Doses */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Available Doses <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="availableDoses"
              value={formData.availableDoses}
              onChange={handleChange}
              min="1"
              disabled={isSubmitting}
              className={`block w-full px-3 py-2 border ${
                errors.availableDoses ? 'border-red-300' : 'border-gray-300'
              } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
            />
            {errors.availableDoses && (
              <p className="mt-1 text-sm text-red-600">{errors.availableDoses}</p>
            )}
          </div>
          
          {/* Minimum Age */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Age
            </label>
            <input
              type="number"
              name="minimumAge"
              value={formData.minimumAge}
              onChange={handleChange}
              min="0"
              disabled={isSubmitting}
              placeholder="Enter minimum age requirement"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          {/* Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              disabled={isSubmitting}
              placeholder="Enter any additional notes or instructions"
              rows="3"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          {/* Target Classes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Users size={16} className="mr-2" />
              Target Classes <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3 mt-3">
              {availableClasses.map(classItem => {
                const isSelected = formData.targetClasses.includes(Number(classItem.id));
                return (
                  <div key={classItem.id} className="flex items-center">
                    <div className="relative">
                      <input
                        type="checkbox"
                        id={`class-${classItem.id}`}
                        checked={isSelected}
                        onChange={() => handleClassChange(classItem.id)}
                        disabled={isSubmitting}
                        className="peer sr-only"
                      />
                      <div 
                        onClick={() => handleClassChange(classItem.id)}
                        className={`w-5 h-5 border-2 rounded cursor-pointer transition-colors duration-200 flex items-center justify-center
                          ${isSelected 
                            ? 'bg-[rgb(116,120,117)] border-[rgb(116,120,117)]' 
                            : 'bg-white border-gray-300'
                          }
                          ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:border-[rgb(116,120,117)]'}
                        `}
                      >
                        {isSelected && (
                          <svg 
                            className="w-3 h-3 text-white" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={3} 
                              d="M5 13l4 4L19 7" 
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                    <label 
                      htmlFor={`class-${classItem.id}`}
                      onClick={() => handleClassChange(classItem.id)}
                      className={`ml-2 block text-sm text-gray-700 cursor-pointer select-none
                        ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                    >
                      {classItem.name}
                    </label>
                  </div>
                );
              })}
            </div>
            {errors.targetClasses && (
              <p className="mt-1 text-sm text-red-600">{errors.targetClasses}</p>
            )}
          </div>
          
          {/* Form Actions */}
          <div className="flex justify-end space-x-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-white rounded-md transition-colors duration-200"
              style={{ backgroundColor: 'rgb(116, 120, 117)' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgb(96, 100, 97)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgb(116, 120, 117)'}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-white rounded-md transition-colors duration-200 flex items-center"
              style={{ backgroundColor: 'rgb(116, 120, 117)' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgb(96, 100, 97)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgb(116, 120, 117)'}
            >
              {isSubmitting ? (
                <>
                  <Loader className="animate-spin mr-2" size={16} />
                  Saving...
                </>
              ) : (
                isEditing ? "Update Drive" : "Schedule Drive"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DriveForm;