import React, { useState, useRef } from 'react';
import { X, Upload, File, AlertCircle } from 'lucide-react';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (files: FileList) => void;
}

export function UploadModal({ isOpen, onClose, onUpload }: UploadModalProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(e.target.files);
    }
  };

  const handleUpload = () => {
    if (selectedFiles) {
      onUpload(selectedFiles);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg transform transition-all">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Upload className="w-5 h-5 text-blue-500" />
            Upload Documents
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center ${
              isDragging
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-blue-500 hover:bg-gray-50'
            } transition-colors cursor-pointer`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInput}
              className="hidden"
              multiple
            />
            <div className="mx-auto flex flex-col items-center">
              <Upload className="w-12 h-12 text-blue-500 mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-1">
                Drop your files here
              </h4>
              <p className="text-sm text-gray-500 mb-4">
                or click to browse from your computer
              </p>
              <p className="text-xs text-gray-400">
                Maximum file size: 10MB
              </p>
            </div>
          </div>

          {selectedFiles && selectedFiles.length > 0 && (
            <div className="mt-6 space-y-3">
              <h4 className="font-medium text-gray-900">Selected Files</h4>
              {Array.from(selectedFiles).map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <File className="w-5 h-5 text-blue-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedFiles && selectedFiles.length > 0 && (
            <div className="mt-6 flex items-center gap-2 text-sm text-amber-600">
              <AlertCircle className="w-4 h-4" />
              <span>Files will be uploaded when you click the button below</span>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors inline-flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
          <button
            type="button"
            onClick={handleUpload}
            disabled={!selectedFiles || selectedFiles.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2 shadow-lg shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload className="w-4 h-4" />
            Upload Files
          </button>
        </div>
      </div>
    </div>
  );
}