/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEdit, faTrash, faPlus } from "@fortawesome/free-solid-svg-icons";

function AdminManageExamQuestions() {
  const { id } = useParams(); // Get the exam ID from the URL parameters
  const [questionsData, setQuestionsData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [questionsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false); // Modal visibility state
  const [newQuestion, setNewQuestion] = useState({
    text: '',
    choices: [{ text: '', is_correct: false }]
  });
  const navigate = useNavigate();

  const storedUserData = localStorage.getItem("userData");
  const accessToken = storedUserData ? JSON.parse(storedUserData).access_token : null;

  useEffect(() => {
    if (!accessToken) {
      alert("Unauthorized! Please log in again.");
      navigate("/login");
    }
  }, [accessToken, navigate]);

  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  };

  const handleFetchQuestions = async () => {
    try {
      const res = await axios.get(`http://127.0.0.1:8000/exam/${id}/`, axiosConfig);
      console.log("Fetched Questions Data:", res.data);
      setQuestionsData(res.data.questions || []);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        alert("Session expired. Please log in again.");
        navigate("/login");
      } else {
        console.error("Error fetching questions:", err);
      }
    }
  };

  useEffect(() => {
    if (accessToken) {
      handleFetchQuestions();
    }
  }, [accessToken]);

  const handleDeleteQuestion = async (questionId) => {
    const confirmDelete = window.confirm("Do you want to delete this question?");
    if (confirmDelete) {
      try {
        const res = await axios.delete(`http://127.0.0.1:8000/exam/question/delete/${questionId}/`, axiosConfig);
        if (res.status === 204) {
          setQuestionsData((prevData) => prevData.filter((question) => question.id !== questionId));
        } else {
          alert("Failed to delete question");
        }
      } catch (err) {
        alert("An error occurred while deleting the question");
      }
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredQuestions = questionsData.filter(
    (question) => question.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const indexOfLastQuestion = currentPage * questionsPerPage;
  const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
  const currentQuestions = filteredQuestions.slice(indexOfFirstQuestion, indexOfLastQuestion);
  const totalPages = Math.ceil(filteredQuestions.length / questionsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const toggleModal = () => {
    setShowModal(!showModal);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewQuestion((prev) => ({ ...prev, [name]: value }));
  };

  const handleChoiceChange = (index, e) => {
    const { name, value } = e.target;
    const updatedChoices = [...newQuestion.choices];
    if (name === "is_correct") {
      updatedChoices[index].is_correct = e.target.checked;
    } else {
      updatedChoices[index].text = value;
    }
    setNewQuestion((prev) => ({ ...prev, choices: updatedChoices }));
  };

  const addChoice = () => {
    setNewQuestion((prev) => ({
      ...prev,
      choices: [...prev.choices, { text: '', is_correct: false }]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`http://127.0.0.1:8000/exam/${id}/add-question/`, {
        text: newQuestion.text,
        choices: newQuestion.choices
      }, axiosConfig);
      if (response.status === 201) {
        // Reset form and close modal
        setShowModal(false);
        setNewQuestion({ text: '', choices: [{ text: '', is_correct: false }] });
        handleFetchQuestions(); // Refresh questions list
      }
    } catch (error) {
      console.error("Error adding question:", error);
      alert("Failed to add question.");
    }
  };

  return (
    <>
      <h1 className="text-center text-black font-bold text-xl capitalize mb-4">Manage Exam Questions</h1>

      <div className="flex flex-col md:flex-row justify-between mb-4">
        <button onClick={toggleModal} className="px-4 py-2 bg-blue-500 text-white rounded mb-4 md:mb-0">
          <FontAwesomeIcon icon={faPlus} /> Create New Question
        </button>

        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="px-4 py-2 bg-white text-black border rounded-full"
        />
      </div>

      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        {currentQuestions.length > 0 ? (
          currentQuestions.map((question, index) => (
            <div key={question.id} className="bg-white border-b px-6 py-4 mb-4">
              <div>
                <strong className="text-red-800">Question {index + 1}:</strong> <span className="text-black">{question.text}</span> 
              </div>
              <div>
                <strong className="text-black">Choices:</strong>
                <ul className=" pl-5 text-black">
                  {question.choices.map((choice, choiceIndex) => (
                    <li key={choice.id}>
                      {String.fromCharCode(97 + choiceIndex)}) {choice.text} 
                    </li>
                  ))}  
                </ul>
              </div>
              <div className="text-black">
                <strong>Correct Answer:</strong>{" "}
                {question.choices.find(choice => choice.is_correct === true)?.text || "Not specified"}
              </div>
              <div className="flex items-center space-x-2 mt-2">
                {/* <Link to={`/admin/editquestion/${question.id}`}>
                  <FontAwesomeIcon icon={faEdit} className="text-green-500" />
                </Link> */}
                <span onClick={() => handleDeleteQuestion(question.id)} className="cursor-pointer">
                  <FontAwesomeIcon icon={faTrash} className="text-red-500" />
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="px-6 py-4 text-center">No questions found</div>
        )}
      </div>

      {/* Modal for adding new question */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-1/3">
            <h2 className="text-xl mb-4 text-black">Create New Question</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block mb-2">Question Text:</label>
                <textarea
                  name="text"
                  value={newQuestion.text}
                  onChange={handleInputChange}
                  className="w-full border rounded p-2 text-gray-950"
                  required
                />
              </div>
              <div className="mb-4">
                <strong>Choices:</strong>
                {newQuestion.choices.map((choice, index) => (
                  <div key={index} className="flex items-center mb-2">
                    <input
                      type="text"
                      name={`choice_${index}`}
                      value={choice.text}
                      onChange={(e) => handleChoiceChange(index, e)}
                      className="border rounded p-2 w-2/3 text-gray-900"
                      placeholder={`Choice ${index + 1}`}
                      required
                    />
                    <label className="ml-2">
                      <input
                        type="checkbox"
                        checked={choice.is_correct}
                        onChange={(e) => handleChoiceChange(index, e)}
                        name="is_correct"
                      />
                      Correct
                    </label>
                  </div>
                ))}
                <button type="button" onClick={addChoice} className="text-blue-500">Add Another Choice</button>
              </div>
              <div className="flex justify-end">
                <button type="button" onClick={toggleModal} className="mr-2 bg-gray-300 text-black rounded px-4 py-2">Cancel</button>
                <button type="submit" className="bg-blue-500 text-white rounded px-4 py-2">Create Question</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex justify-center mt-4">
        <nav className="relative z-0 inline-flex shadow-sm rounded-md">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => paginate(i + 1)}
              className={`px-4 py-2 border text-sm font-medium ${
                currentPage === i + 1
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-500 hover:bg-gray-100"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}

export default AdminManageExamQuestions;
