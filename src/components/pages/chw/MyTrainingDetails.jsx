/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";

const CommunityHealthWork_ViewTrainingDetails = () => {
  const { id: trainingId } = useParams(); // Use useParams to get the training ID from the URL
  const navigate = useNavigate(); // useNavigate hook for handling navigation
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentModulePage, setCurrentModulePage] = useState(0);
  const [allModulesCompleted, setAllModulesCompleted] = useState(false); // New state to track completion status

  const candidateId = 1; // Or receive as a prop

  useEffect(() => {
    const fetchTraining = async () => {
      if (!trainingId) {
        setErrorMessage("Training ID is required");
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        setErrorMessage("No token found. Please login first.");
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/trainingCandidate/${trainingId}/?candidate_id=${candidateId}`,
          { 
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch training data: ${response.status}`);
        }

        const jsonData = await response.json();
        setData(jsonData);
        // Check if all modules are completed on initial fetch
        setAllModulesCompleted(jsonData.training.modules.every(module => module.is_completed));
      } catch (error) {
        setErrorMessage(`Error fetching training data: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchTraining();
  }, [trainingId, candidateId]);

  const markModuleAsStudied = async (moduleId) => {
    if (!trainingId || !moduleId) {
      console.error("Training ID and Module ID are required");
      return;
    }

    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/trainingCandidate/candidate/${candidateId}/modules/${moduleId}/mark-as-studied/`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to mark module as studied');
      }

      // Update state to reflect the change
      setData(prevData => {
        const updatedModules = prevData.training.modules.map(module =>
          module.id === moduleId ? { ...module, is_completed: true } : module
        );

        // Check if all modules are now completed
        const allCompleted = updatedModules.every(module => module.is_completed);
        setAllModulesCompleted(allCompleted); // Update completion state

        return {
          ...prevData,
          training: {
            ...prevData.training,
            modules: updatedModules
          }
        };
      });

    } catch (error) {
      console.error("Error marking module as studied:", error);
    }
  };

  const handleTakeExam = () => {
    if (!allModulesCompleted) {
      setErrorMessage("You must complete all modules before taking the exam.");
      return;
    }
    
    if (data?.training?.id) {
      navigate(`/chw/takeExam/${data.training.id}`);
    }
  };

  // Handle loading and error states
  if (loading) {
    return <div className="flex justify-center"><Loader2 className="animate-spin" /></div>;
  }

  if (errorMessage) {
    return (
      <div className="text-red-600 text-center mt-4">
        <p>{errorMessage}</p>
      </div>
    );
  }

  if (!data) {
    return null; // Or a loading state
  }

  const currentModule = data?.training?.modules?.[currentModulePage];

  const nextPage = () => {
    if (data?.training?.modules && currentModulePage < data.training.modules.length - 1) {
      setCurrentModulePage(currentModulePage + 1);
    }
  };

  const prevPage = () => {
    if (currentModulePage > 0) {
      setCurrentModulePage(currentModulePage - 1);
    }
  };

  // Early return for missing training ID
  if (!trainingId) {
    return (
      <div className="text-red-600 text-center mt-4">
        <p>Training ID is required</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8 bg-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          {data?.training?.name || "Training Details"}
        </h2>
      </div>

      {errorMessage ? (
        <div className="text-red-600 text-center mt-4">
          <p>{errorMessage}</p>
        </div>
      ) : (
        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-4xl">
          {currentModule ? (
            <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                Module {currentModulePage + 1}: <span className="text-red-700">{currentModule.name}</span> 
              </h3>
              
              <div className="prose max-w-none">
                <p className="text-black mb-6 text-center font-semibold py-4">Description:<br /><br /> </p>
                 <span className="text-gray-700">{currentModule.description}</span>
              </div>

              {currentModule.materials?.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold text-black text-center mb-2">Materials</h4>
                  <div className="space-y-2">
                    {currentModule.materials.map((material, index) => (
                      <a
                        key={index}
                        href={`http://127.0.0.1:8000${material.file}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {material.file.split("/").pop()}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-8 flex items-center justify-between gap-4">
                <button
                  onClick={prevPage}
                  disabled={currentModulePage === 0}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>

                <button
                  onClick={() => markModuleAsStudied(currentModule.id)}
                  disabled={currentModule.is_completed}
                  className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {currentModule.is_completed ? "Completed" : "Mark as Completed"}
                </button>

                <button
                  onClick={nextPage}
                  disabled={currentModulePage >= (data?.training?.modules?.length || 0) - 1}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="text-gray-600 text-center">No module data available.</div>
          )}

          {currentModulePage === (data?.training?.modules?.length - 1) && (
            <div className="mt-8 text-center">
              <button
                onClick={handleTakeExam}
                className="px-6 py-2 bg-green-500 text-white font-bold rounded-md hover:bg-green-600 transition-colors"
              >
                Take Exam
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CommunityHealthWork_ViewTrainingDetails;
