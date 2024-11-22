import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Camera, Upload, Loader } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const AdminCreateNewExpense = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);

  const [formData, setFormData] = useState({
    video: null,
    receipt: null,
    category: 'Choose Category',
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [videoPreview, setVideoPreview] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');

  // Webcam handling functions
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      streamRef.current = stream;
    } catch (err) {
      setErrors(prev => ({ ...prev, video: 'Failed to access camera' }));
    }
  };

  const startRecording = () => {
    if (!streamRef.current) return;

    const mediaRecorder = new MediaRecorder(streamRef.current);
    const chunks = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunks.push(e.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const videoURL = URL.createObjectURL(blob);
      setVideoPreview(videoURL);
      setFormData(prev => ({ ...prev, video: blob }));
    };

    mediaRecorder.start();
    mediaRecorderRef.current = mediaRecorder;
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  };

  // File upload handling
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type === 'application/pdf') {
        setFormData(prev => ({ ...prev, receipt: file }));
        setSelectedFileName(file.name);
        setErrors(prev => ({ ...prev, receipt: '' }));
      } else {
        setErrors(prev => ({ ...prev, receipt: 'Please upload a PDF file' }));
      }
    }
  };

  const validateFields = () => {
    const newErrors = {};

    if (formData.category === 'Choose Category') {
      newErrors.category = 'You must select a category.';
    }
    if (!formData.video) {
      newErrors.video = 'You must record a video.';
    }
    if (!formData.receipt) {
      newErrors.receipt = 'You must upload a receipt.';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateFields();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const formDataToSubmit = new FormData();
    formDataToSubmit.append('video', formData.video);
    formDataToSubmit.append('receipt', formData.receipt);
    formDataToSubmit.append('category', formData.category);

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://127.0.0.1:8000/expense/create/',
        formDataToSubmit,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.status === 201) {
        setMessage('Expense saved successfully!');
        setTimeout(() => navigate('/admin/expenses'), 2000);
      }
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        form: error.response?.data?.error || 'An unexpected error occurred. Please try again.',
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      stopCamera();
      if (videoPreview) {
        URL.revokeObjectURL(videoPreview);
      }
    };
  }, []);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="flex justify-center items-center rounded-lg shadow-xl w-full max-w-4xl bg-white p-8">
        <div className="w-full sm:max-w-md">
          <h2 className="mt-3 text-center text-2xl font-bold text-gray-900">Create New Expense</h2>

          {errors.form && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{errors.form}</AlertDescription>
            </Alert>
          )}
          
          {message && (
            <Alert className="mt-4 bg-green-50">
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {/* Video Recording Section */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">Record Video</label>
              <div className="relative">
                <video
                  ref={videoRef}
                  className="w-full h-48 bg-black rounded-lg"
                  autoPlay
                  muted
                />
                {videoPreview && (
                  <video
                    src={videoPreview}
                    className="w-full h-48 bg-black rounded-lg mt-2"
                    controls
                  />
                )}
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={!streamRef.current ? startCamera : stopCamera}
                    className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    {!streamRef.current ? 'Start Camera' : 'Stop Camera'}
                  </button>
                  <button
                    type="button"
                    onClick={!isRecording ? startRecording : stopRecording}
                    className={`flex items-center px-4 py-2 ${
                      isRecording ? 'bg-red-600' : 'bg-blue-600'
                    } text-white rounded-md hover:opacity-90`}
                    disabled={!streamRef.current}
                  >
                    {isRecording ? 'Stop Recording' : 'Start Recording'}
                  </button>
                </div>
                {errors.video && <p className="text-red-500 text-sm mt-1">{errors.video}</p>}
              </div>
            </div>

            {/* Receipt Upload Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Upload Receipt (PDF)</label>
              <div className="mt-1 flex items-center">
                <label className="flex items-center justify-center w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                  <Upload className="w-4 h-4 mr-2" />
                  {selectedFileName || 'Choose PDF file'}
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
              {errors.receipt && <p className="text-red-500 text-sm mt-1">{errors.receipt}</p>}
            </div>

            {/* Category Selection */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              >
                <option value="Choose Category" disabled>Choose Category</option>
                <option value="toll">Toll</option>
                <option value="fuel">Fuel</option>
                <option value="parking">Parking</option>
                <option value="maintenance">Maintenance</option>
                <option value="other">Other</option>
              </select>
              {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                disabled={loading}
              >
                {loading ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  'Save Expense'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminCreateNewExpense;