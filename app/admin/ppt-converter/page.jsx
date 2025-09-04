"use client"
import React, { useState } from 'react';
import { FaFileUpload, FaDownload, FaFilePowerpoint, FaFileExcel, FaTrash, FaEye, FaInfoCircle, FaCheckCircle } from 'react-icons/fa';
import { useSession } from 'next-auth/react';
import AdminNav from '@/app/component/AdminNav';

const PPTConverter = () => {
  const { data: session, status } = useSession();
  const [files, setFiles] = useState([]);
  const [converting, setConverting] = useState(false);
  const [convertedFiles, setConvertedFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);

  // Handle file selection
  const handleFileSelect = (event) => {
    const selectedFiles = Array.from(event.target.files);
    addFiles(selectedFiles);
  };

  // Handle drag and drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      addFiles(droppedFiles);
    }
  };

  // Add files to the list
  const addFiles = (newFiles) => {
    const pptFiles = newFiles.filter(file => {
      const fileType = file.type;
      const fileName = file.name.toLowerCase();
      return fileType.includes('presentation') || 
             fileName.endsWith('.ppt') || 
             fileName.endsWith('.pptx') ||
             fileType === 'application/vnd.ms-powerpoint' ||
             fileType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
    });

    if (pptFiles.length !== newFiles.length) {
      alert('Please select only PowerPoint files (.ppt, .pptx)');
    }

    const filesWithId = pptFiles.map(file => ({
      id: Date.now() + Math.random(),
      file: file,
      name: file.name,
      size: formatFileSize(file.size),
      status: 'pending'
    }));

    setFiles(prev => [...prev, ...filesWithId]);
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Remove file from list
  const removeFile = (fileId) => {
    setFiles(prev => prev.filter(file => file.id !== fileId));
  };

  // Convert PPT to Excel
  const convertFiles = async () => {
    if (files.length === 0) {
      alert('Please select files to convert');
      return;
    }

    setConverting(true);
    const results = [];

    for (const fileItem of files) {
      try {
        // Update status to converting
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id ? { ...f, status: 'converting' } : f
        ));

        const formData = new FormData();
        formData.append('file', fileItem.file);

        const response = await fetch('/api/ppt-converter', {
          method: 'POST',
          body: formData
        });

        if (response.ok) {
          const blob = await response.blob();
          const excelFileName = fileItem.name.replace(/\.(ppt|pptx)$/i, '_JMD_Quotation.xlsx');
          
          // Create download URL
          const url = window.URL.createObjectURL(blob);
          
          results.push({
            id: fileItem.id,
            originalName: fileItem.name,
            excelName: excelFileName,
            downloadUrl: url,
            size: formatFileSize(blob.size),
            convertedAt: new Date().toLocaleString('en-US')
          });

          // Update status to completed
          setFiles(prev => prev.map(f => 
            f.id === fileItem.id ? { ...f, status: 'completed' } : f
          ));
        } else {
          const errorData = await response.json();
          console.error('Conversion error:', errorData);
          
          // Update status to error
          setFiles(prev => prev.map(f => 
            f.id === fileItem.id ? { ...f, status: 'error', error: errorData.error } : f
          ));
        }
      } catch (error) {
        console.error('Error converting file:', fileItem.name, error);
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id ? { ...f, status: 'error', error: 'Network error' } : f
        ));
      }
    }

    setConvertedFiles(prev => [...prev, ...results]);
    setConverting(false);
  };

  // Download converted file
  const downloadFile = (convertedFile) => {
    const a = document.createElement('a');
    a.href = convertedFile.downloadUrl;
    a.download = convertedFile.excelName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Clear all files
  const clearAll = () => {
    setFiles([]);
    // Clean up blob URLs
    convertedFiles.forEach(file => {
      window.URL.revokeObjectURL(file.downloadUrl);
    });
    setConvertedFiles([]);
  };

  return (
    <AdminNav>
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                <FaFilePowerpoint className="text-orange-500" />
                Enhanced PPT to Excel Converter
              </h1>
              <p className="text-gray-600 mt-2">
                Convert PowerPoint presentations to professional Excel quotations with automatic state detection and enhanced parsing
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={convertFiles}
                disabled={files.length === 0 || converting}
                className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <FaFileExcel /> {converting ? 'Converting...' : 'Convert All'}
              </button>
              <button
                onClick={clearAll}
                disabled={files.length === 0}
                className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <FaTrash /> Clear All
              </button>
            </div>
          </div>
        </div>

        {/* Required Format Info */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-6">
          <div className="flex items-start gap-3">
            <FaInfoCircle className="text-blue-500 text-xl mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-blue-800 mb-2">
                📋 PPT Format Requirements
              </h3>
              <div className="text-blue-700 space-y-2">
                <p className="font-medium">Your PPT text supports multiple formats:</p>
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <code className="text-sm font-mono text-gray-800">
                    1) Delhi - Railway Station - 20*10 - FL<br/>
                    2) Mumbai, Andheri East 15x10 NL Unipole<br/>
                    3) Bangalore - MG Road - 12x8 - Billboard - BL<br/>
                    4) Jamshedpur, Station Road 25*15 FFL Hoarding
                  </code>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <h4 className="font-medium text-blue-800">Supported Patterns:</h4>
                    <ul className="text-sm space-y-1 mt-1">
                      <li>• <strong>n)</strong> City - Title - Size - Lighting</li>
                      <li>• City, Location SizexSize Lighting Type</li>
                      <li>• City - Location - Size - Type - Lighting</li>
                      <li>• <strong>Mixed formats</strong> with auto-detection</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-800">Lighting Codes:</h4>
                    <ul className="text-sm space-y-1 mt-1">
                      <li>• <strong>FL</strong> = Front Light</li>
                      <li>• <strong>BL</strong> = Back Light</li>
                      <li>• <strong>FFL/FLL</strong> = Fully Light</li>
                      <li>• <strong>NL</strong> = No Light</li>
                      <li>• <strong>SL</strong> = Side Light</li>
                      <li>• <strong>LL</strong> = LED Light</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* File Upload Area */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <FaFileUpload className="mx-auto text-6xl text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Drop PowerPoint files here or click to browse
            </h3>
            <p className="text-gray-500 mb-4">
              Supports .ppt and .pptx files (.pptx recommended for better extraction)
            </p>
            <input
              type="file"
              multiple
              accept=".ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg cursor-pointer inline-flex items-center gap-2"
            >
              <FaFileUpload /> Select Files
            </label>
          </div>
        </div>

        {/* Files to Convert */}
        {files.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FaFilePowerpoint className="text-orange-500" />
              Files to Convert ({files.length})
            </h2>
            <div className="space-y-3">
              {files.map((fileItem) => (
                <div key={fileItem.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FaFilePowerpoint className="text-orange-500 text-xl" />
                    <div>
                      <p className="font-medium">{fileItem.name}</p>
                      <p className="text-sm text-gray-500">{fileItem.size}</p>
                      {fileItem.error && (
                        <p className="text-sm text-red-500">Error: {fileItem.error}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      fileItem.status === 'pending' ? 'bg-gray-100 text-gray-700' :
                      fileItem.status === 'converting' ? 'bg-blue-100 text-blue-700' :
                      fileItem.status === 'completed' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {fileItem.status === 'pending' ? 'Pending' :
                       fileItem.status === 'converting' ? 'Converting...' :
                       fileItem.status === 'completed' ? 'Completed' :
                       'Error'}
                    </span>
                    <button
                      onClick={() => removeFile(fileItem.id)}
                      disabled={fileItem.status === 'converting'}
                      className="text-red-500 hover:text-red-700 disabled:opacity-50"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Converted Files */}
        {convertedFiles.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FaFileExcel className="text-green-500" />
              Converted Files ({convertedFiles.length})
            </h2>
            <div className="space-y-3">
              {convertedFiles.map((convertedFile) => (
                <div key={convertedFile.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3">
                    <FaFileExcel className="text-green-500 text-xl" />
                    <div>
                      <p className="font-medium">{convertedFile.excelName}</p>
                      <p className="text-sm text-gray-600">
                        From: {convertedFile.originalName} • Size: {convertedFile.size} • {convertedFile.convertedAt}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => downloadFile(convertedFile)}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <FaDownload /> Download
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Enhanced Usage Instructions */}
        {/* <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6 mt-6">
          <div className="flex items-start gap-3">
            <FaCheckCircle className="text-yellow-500 text-xl mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-800 mb-3">
                🚀 Enhanced Features & Usage
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-yellow-800 mb-2">Key Features:</h4>
                  <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                    <li>Multiple format pattern detection</li>
                    <li>Automatic state detection for 150+ Indian cities</li>
                    <li>Enhanced visibility code recognition</li>
                    <li>Billboard = Hoarding classification</li>
                    <li>Professional Excel output with JMD branding</li>
                    <li>Duplicate prevention system</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-yellow-800 mb-2">Excel Output Columns:</h4>
                  <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                    <li><strong>Sr No</strong> - Serial number</li>
                    <li><strong>State</strong> - Auto-detected from city</li>
                    <li><strong>City</strong> - Location city</li>
                    <li><strong>Media Type</strong> - Hoarding, Unipole, etc.</li>
                    <li><strong>Visibility</strong> - Front Light, Back Light, etc.</li>
                    <li><strong>Title, Width, Height, SQFT</strong> - Details</li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 p-4 bg-yellow-100 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>💡 Pro Tip:</strong> The converter automatically skips first and last slides, 
                  detects various text formats, and generates professional quotations with company branding.
                  If some slides aren't detected properly, check the format requirements above.
                </p>
              </div>
            </div>
          </div>
        </div> */}
      </div>
    </div>
    </AdminNav>
  );
};

export default PPTConverter;