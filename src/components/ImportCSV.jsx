import { useState } from "react";
import { X, Upload, AlertCircle, Check, Download } from "lucide-react";
import axios from "../api/axios";

const ImportCSV = ({ onClose, onImportComplete }) => {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState(null);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState([]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === "text/csv") {
      setFile(droppedFile);
      setError("");
      
      // Preview the CSV content
      const reader = new FileReader();
      reader.onload = (event) => {
        const csvText = event.target.result;
        const lines = csvText.split("\n");
        const headers = lines[0].split(",");
        const previewData = lines.slice(1, 6).map(line => {
          const values = line.split(",");
          return headers.reduce((obj, header, index) => {
            obj[header.trim()] = values[index]?.trim() || "";
            return obj;
          }, {});
        });
        setPreview(previewData);
      };
      reader.readAsText(droppedFile);
    } else {
      setError("Please upload a valid CSV file");
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile);
      setError("");
      
      // Preview the CSV content
      const reader = new FileReader();
      reader.onload = (event) => {
        const csvText = event.target.result;
        const lines = csvText.split("\n");
        const headers = lines[0].split(",");
        const previewData = lines.slice(1, 6).map(line => {
          const values = line.split(",");
          return headers.reduce((obj, header, index) => {
            obj[header.trim()] = values[index]?.trim() || "";
            return obj;
          }, {});
        });
        setPreview(previewData);
      };
      reader.readAsText(selectedFile);
    } else {
      setError("Please upload a valid CSV file");
      setFile(null);
      setPreview([]);
    }
  };

  const downloadTemplate = () => {
    // Create CSV content
    const csvContent = [
      "firstname,lastname,dateofbirth,gender,class,section,parentname,parentemail,contactnumber,address",
      "John,Doe,2010-05-15,Male,Grade 5,A,Jane Doe,jane@example.com,0987654321,123 Main St",
      "Mary,Smith,2011-02-20,Female,Grade 4,B,Bob Smith,bob@example.com,5559876543,456 Oak Ave"
    ].join("\n");
    
    // Create blob and download link
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("hidden", "");
    a.setAttribute("href", url);
    a.setAttribute("download", "student_import_template.csv");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleImport = async () => {
    if (!file) {
      setError("Please select a file to import");
      return;
    }
    
    setImporting(true);
    setError("");
    
    const formData = new FormData();
    formData.append("file", file);
    
    try {
      const response = await axios.post("/students/import", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      
      setImportResults(response.data);
      
      // Call the callback after successful import
      if (response.data.success) {
        setTimeout(() => {
          onImportComplete();
        }, 2000);
      }
    } catch (error) {
      console.error("Import failed", error);
      setError(error.response?.data?.message || "Failed to import students");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-screen overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-800">
            Import Students from CSV
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {importResults ? (
            <div className="text-center py-6">
              <div className="flex flex-col items-center mb-6">
                {importResults.success ? (
                  <>
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <Check size={32} className="text-green-600" />
                    </div>
                    <h4 className="text-xl font-medium text-gray-800 mb-2">Import Successful</h4>
                    <p className="text-gray-600 mb-4">
                      Successfully imported {importResults.imported} student(s)
                    </p>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                      <AlertCircle size={32} className="text-yellow-600" />
                    </div>
                    <h4 className="text-xl font-medium text-gray-800 mb-2">Import Completed with Issues</h4>
                    <p className="text-gray-600 mb-4">
                      Imported {importResults.imported} out of {importResults.total} student(s)
                    </p>
                  </>
                )}
              </div>
              
              {importResults.errors && importResults.errors.length > 0 && (
                <div className="mt-4 border border-red-200 rounded-md bg-red-50 p-4">
                  <h5 className="font-medium text-red-800 mb-2">Issues Found:</h5>
                  <ul className="text-sm text-red-700 ml-4 list-disc">
                    {importResults.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="mt-6">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-gray-600 mb-6">
                Upload a CSV file to import multiple students at once. Make sure your file follows the correct format.
              </p>
              
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md">
                  {error}
                </div>
              )}
              
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center ${
                  isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="flex flex-col items-center">
                  <Upload size={48} className="text-gray-400 mb-4" />
                  <p className="text-gray-700 font-medium mb-2">
                    {file ? file.name : "Drag & Drop your CSV file here"}
                  </p>
                  <p className="text-gray-500 text-sm mb-4">or</p>
                  <input
                    id="csv-file"
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="csv-file"
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 cursor-pointer"
                  >
                    Browse Files
                  </label>
                </div>
              </div>
              
              <div className="mt-6">
                <button
                  onClick={downloadTemplate}
                  className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
                >
                  <Download size={16} className="mr-1" />
                  Download CSV Template
                </button>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
                  <h5 className="font-medium text-yellow-800 mb-2">CSV Format Requirements:</h5>
                  <ul className="text-sm text-yellow-700 ml-4 list-disc space-y-1">
                    <li>The first row should contain column headers</li>
                    <li>Required fields: firstName, lastName, dateOfBirth, gender, class</li>
                    <li>Date format should be YYYY-MM-DD</li>
                    <li>Gender should be "Male", "Female", or "Other"</li>
                  </ul>
                </div>
              </div>
            </>
          )}
        </div>
        
        {/* Footer */}
        {!importResults && (
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 mr-2"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={!file || importing}
              className={`px-4 py-2 rounded-md text-white ${
                !file || importing ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {importing ? "Importing..." : "Import Students"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportCSV;