// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { LockClosedIcon, ArrowPathIcon } from "@heroicons/react/20/solid"; // Using ArrowPathIcon for spinner
import Mammoth from 'mammoth'; // For Word document parsing
import { PDFDocument } from 'pdf-lib'; // For PDF parsing (lightweight)

const EditPolicy = () => {
  const { id } = useParams();
  const [data, setData] = useState({}); // Store the policy data
  const [loading, setLoading] = useState(false); // Loading state for spinner
  const [errorMessage, setErrorMessage] = useState(""); // Error message to show on the page
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
 

  // Fetch the policy data by ID
  useEffect(() => {
    const token = localStorage.getItem("token"); // Retrieve the token from local storage

    if (!token) {
      console.error("No token found. user is not authenticated.");
      setErrorMessage("No token found. Please login first.");
      return; // Stop the request if there's no token
    }

    setLoading(true); // Start loading before making the request
    axios
      .get(`http://127.0.0.1:8000/policy/${id}/`, {
        headers: {
          Authorization: `Bearer ${token}`, // Include the token in the headers
        },
      })
      .then((res) => {
        if (res.data) {
          console.log("The related data is:", res.data);
          setData(res.data); // Set the fetched policy data
        }
      })
      .catch((err) => {
        console.error("Error fetching policy data:", err); // Log the error
        setErrorMessage(err.response?.data?.message || "Error fetching policy data.");
      })
      .finally(() => {
        setLoading(false); // Stop loading after the request finishes
      });
  }, [id]);


  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileType = file.type;

    try {
      if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const reader = new FileReader();
        reader.onload = async (event) => {
          const result = await Mammoth.extractRawText({ arrayBuffer: event.target.result });
          setData((prev) => ({ ...prev, description: result.value }));
        };
        reader.readAsArrayBuffer(file);
      } else if (fileType === 'application/pdf') {
        const reader = new FileReader();
        reader.onload = async (event) => {
          const pdfDoc = await PDFDocument.load(event.target.result);
          const text = await extractTextFromPDF(pdfDoc);
          setData((prev) => ({ ...prev, description: text }));
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

  // Update the policy data
  const handleSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
  
    setLoading(true);
    setErrorMessage("");
  
    const updatedData = { description: data.description }; // Extract only the necessary field
  
    axios
  .put(`http://127.0.0.1:8000/policy/update/${id}/`, updatedData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  .then(() => {
    alert("Data updated successfully");
    navigate("/admin/policies");
  })
  .catch((err) => {
    console.error("Error updating policy:", err);
    setErrorMessage(err.response?.data?.error || "Error updating policy.");
  })
  .finally(() => {
    setLoading(false);
  });

  };
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8 bg-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-green-900">
          Update policy
        </h2>
      </div>

      {errorMessage && (
        <div className="text-red-600 text-center">
          <p>{errorMessage}</p>
        </div>
      )}

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form className="space-y-6" onSubmit={handleSubmit}>


        <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                id="description"
                name="description"
                value={data.description}
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
              className="group relative flex w-full justify-center rounded-md bg-green-500 px-3 py-2 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                {loading ? (
                  <ArrowPathIcon
                    className="h-5 w-5 text-white animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <LockClosedIcon
                    className="h-5 w-5 text-purple-400 group-hover:text-indigo-400"
                    aria-hidden="true"
                  />
                )}
              </span>
              {loading ? "Updating..." : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPolicy;
