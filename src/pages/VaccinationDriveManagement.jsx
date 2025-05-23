import React, { useState } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../api/axios';

const VaccinationDriveManagement = () => {
  const [formData, setFormData] = useState({
    vaccine: {
      id: ''
    },
    vaccineBatch: '',
    driveDate: '',
    availableDoses: '',
    applicableGrades: '',
    minimumAge: '',
    maximumAge: '',
    status: 'SCHEDULED',
    isActive: true,
    notes: ''
  });
  const [editingDrive, setEditingDrive] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const driveData = {
        vaccine: {
          id: parseInt(formData.vaccine.id)
        },
        vaccineBatch: formData.vaccineBatch,
        driveDate: formData.driveDate,
        availableDoses: parseInt(formData.availableDoses),
        applicableGrades: formData.applicableGrades,
        minimumAge: parseInt(formData.minimumAge),
        maximumAge: parseInt(formData.maximumAge),
        status: formData.status,
        isActive: formData.isActive,
        notes: formData.notes
      };

      if (editingDrive) {
        await axios.put(API_ENDPOINTS.DRIVE_BY_ID(editingDrive.id), driveData);
        setSuccess('Vaccination drive updated successfully');
      } else {
        await axios.post(API_ENDPOINTS.DRIVES, driveData);
        setSuccess('Vaccination drive created successfully');
      }

      setFormData({
        vaccine: {
          id: ''
        },
        vaccineBatch: '',
        driveDate: '',
        availableDoses: '',
        applicableGrades: '',
        minimumAge: '',
        maximumAge: '',
        status: 'SCHEDULED',
        isActive: true,
        notes: ''
      });
      setEditingDrive(null);
      fetchDrives();
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while saving the drive');
    }
  };

  const handleEdit = (drive) => {
    // Check if drive is in the past
    if (new Date(drive.driveDate) < new Date()) {
      setError('Cannot edit past vaccination drives');
      return;
    }

    setEditingDrive(drive);
    setFormData({
      vaccine: {
        id: drive.vaccine.id
      },
      vaccineBatch: drive.vaccineBatch,
      driveDate: drive.driveDate.split('T')[0],
      availableDoses: drive.availableDoses.toString(),
      applicableGrades: drive.applicableGrades.join(', '),
      minimumAge: drive.minimumAge.toString(),
      maximumAge: drive.maximumAge.toString(),
      status: drive.status,
      isActive: drive.isActive,
      notes: drive.notes || ''
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Vaccination Drive Management</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      {/* ... rest of the JSX ... */}
    </div>
  );
};

export default VaccinationDriveManagement; 