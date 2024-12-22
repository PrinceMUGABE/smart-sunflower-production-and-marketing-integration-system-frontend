/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import Mammoth from 'mammoth'; // For Word document parsing
import { PDFDocument } from 'pdf-lib'; // For PDF parsing (lightweight)

const CreatePolicy = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '', // New field for policy name
    description: '',
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileType = file.type;

    try {
      if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const reader = new FileReader();
        reader.onload = async (event) => {
          const result = await Mammoth.extractRawText({ arrayBuffer: event.target.result });
          setFormData((prev) => ({ ...prev, description: result.value }));
        };
        reader.readAsArrayBuffer(file);
      } else if (fileType === 'application/pdf') {
        const reader = new FileReader();
        reader.onload = async (event) => {
          const pdfDoc = await PDFDocument.load(event.target.result);
          const text = await extractTextFromPDF(pdfDoc);
          setFormData((prev) => ({ ...prev, description: text }));
        };
        reader.readAsArrayBuffer(file);
      } else {
        setErrors((prev) => ({ ...prev, file: 'Unsupported file type. Only .docx and .pdf files are allowed.' }));
      }
    } catch (error) {
      setErrors((prev) => ({ ...prev, file: 'Error reading file. Please try again.' }));
      console.error('File reading error:', error);
    }
  };

  const extractTextFromPDF = async (pdfDoc) => {
    const pages = pdfDoc.getPages();
    let text = '';
    for (const page of pages) {
      text += page.getTextContent();
    }
    return text;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        'http://127.0.0.1:8000/policy/create/',
        { name: formData.name, description: formData.description }, // Include name in submission
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );

      if (response.status === 201) {
        setMessage('Policy added successfully!');
        setTimeout(() => navigate('/admin/policies'), 2000);
      }
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        form: error.response?.data?.error || 'An error occurred. Please try again.',
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="flex justify-center items-center rounded-lg shadow-xl w-full max-w-4xl bg-white p-8">
        <div className="w-full sm:max-w-md">
          <h2 className="mt-3 text-center text-2xl font-bold text-green-900">Create New Policy</h2>

          {errors.form && <p className="text-red-500 text-sm">{errors.form}</p>}
          {message && <p className="text-green-500 text-sm">{message}</p>}

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            {/* New Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Policy Name</label>
              <input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                type="text"
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                placeholder="Enter the policy name"
                required
              />
              {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                placeholder="Enter policy description or upload a document"
                required
              />
              {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
            </div>

            <div>
              <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700">Upload Document</label>
              <input
                id="file-upload"
                type="file"
                accept=".pdf, .docx"
                onChange={handleFileUpload}
                className="mt-1 block w-full text-sm text-gray-700"
              />
              {errors.file && <p className="text-red-500 text-sm">{errors.file}</p>}
            </div>

            <div>
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                disabled={loading}
              >
                {loading ? <AiOutlineLoading3Quarters className="animate-spin h-5 w-5" /> : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePolicy;
