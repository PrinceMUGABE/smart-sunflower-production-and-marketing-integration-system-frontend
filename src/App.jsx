// eslint-disable-next-line no-unused-vars
import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./components/MainLayout.jsx";
import Login from "./components/auth/Login.jsx";
import Register from "./components/auth/Register.jsx";
import VerifyPassword from "./components/auth/VerifyPassword.jsx";
import Home from './components/pages/chw/Home.jsx';
import Users from './components/pages/ceho/Users.jsx';



// user

import EditUsers from "./components/pages/ceho/EditUsers.jsx";
import ResetPassword from "./components/auth/ResetPassword.jsx";
import ChangePassword from "./components/auth/ChangePassword.jsx";
import CommunityHealthWorkHome from "./components/pages/chw/Home.jsx";
import Communit_Health_Work_Layout from "./components/community_health_work/Communit_Health_Work_Layout.jsx";
import Citizen_Layout from "./components/citizen/Citizen_Layout.jsx";
import Layout from "./components/ceho(admin)/Layout.jsx";
import ManageTrainings from "./components/pages/ceho/Training.jsx";
import EditTraining from "./components/pages/ceho/EditTraining.jsx";
import AdminViewTraining from "./components/pages/ceho/ViewTraining.jsx";
import CreateTraining from "./components/pages/ceho/CreateTraining.jsx";
import ManagetrainingCandidates from "./components/pages/ceho/TraningCandidates.jsx";
import AdminViewTrainingCandidateDetails from "./components/pages/ceho/ViewTrainingCandidateDeatails.jsx";
import AdminCreateTrainingCandidate from "./components/pages/ceho/CreateNewTrainingCandidate.jsx";
import AdminEditTrainingCandidate from "./components/pages/ceho/EditTrainingCandidate.jsx";
import ManageWorkers from "./components/pages/ceho/Workers.jsx";
import AdminViewWorkerDetails from "./components/pages/ceho/ViewHealthWork.jsx";
import AdminEditWorkerDetails from "./components/pages/ceho/EditWorkerDetails.jsx";
import AdminCreateWorker from "./components/pages/ceho/CreateNewWorker.jsx";
import AdminManageAppointments from "./components/pages/ceho/Appointments.jsx";
import AdminViewAppointmentDetails from "./components/pages/ceho/ViewAppointmentDetails.jsx";
import CommunityHealthWorkTrainings from "./components/pages/chw/MyTrainings.jsx";
import CommunityHealthWork_ViewTrainingDetails from "./components/pages/chw/MyTrainingDetails.jsx";
import CommunityHealthWork_ApplyNewTraining from "./components/pages/chw/TakeNewTraining.jsx";
import CommunityHealthWorker_ManageAppointments from "./components/pages/chw/MyAppointments.jsx";
import CommunityHealthWorkerViewAppointmentDetails from "./components/pages/chw/ViewAppointmentDetails.jsx";
import AdminHome from "./components/pages/ceho/Home.jsx";
import AdminManageExams from "./components/pages/ceho/ManageExams.jsx";
import AdminCreateExam from "./components/pages/ceho/CreateNewExam.jsx";
import AdminManageExamQuestions from "./components/pages/ceho/ManageExamQuestions.jsx";
import AdminManageExamResults from "./components/pages/ceho/ManageResults.jsx";
import CommunityHealthWork_TakeTrainingExam from "./components/pages/chw/TakeNewTraingExam.jsx";
import CommunityHealthWorkResults from "./components/pages/chw/MyAwards.jsx";



const App = () => {
  useEffect(() => {
    AOS.init({
      offset: 100,
      duration: 800,
      easing: "ease-in",
      delay: 100,
    });


    AOS.refresh();
  }, []);

  return (
    <div className="bg-white dark:bg-black dark:text-white text-black overflow-x-hidden">
      <BrowserRouter>
        <Routes>

          {/* Home view */}
          <Route path="/" element={<MainLayout />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Register />} />
          <Route path="/verifypassword" element={<VerifyPassword />} />
          <Route path="/passwordreset"  element={<ResetPassword />} />
          <Route path="/changePassword" element={<ChangePassword />} />

           {/* End Home view */}

            {/* Admin */}

          <Route path="/admin" element={<Layout />} >
            <Route index element={<AdminHome />} />
            <Route path="/admin/users" element={<Users />} />
            <Route path="/admin/edituser/:id" element={<EditUsers />} />

            <Route path="/admin/training" element={<ManageTrainings />} />
            <Route path="/admin/viewtraining/:id" element={<AdminViewTraining />} />
            <Route path="/admin/edittraining/:id" element={<EditTraining />} />
            <Route path="/admin/createtraining/" element={<CreateTraining />} />

            <Route path="/admin/learner" element={<ManagetrainingCandidates />} />
            <Route path="/admin/viewTrainingCandidate/:id" element={<AdminViewTrainingCandidateDetails />} />
            <Route path="/admin/createTrainingCandidate/" element={<AdminCreateTrainingCandidate />} />
            <Route path="/admin/editTrainingCandidate/:id" element={<AdminEditTrainingCandidate />} />

            <Route path="/admin/worker" element={<ManageWorkers />} />
            <Route path="/admin/viewWorker/:id" element={<AdminViewWorkerDetails />} />
            <Route path="/admin/editWorker/:id" element={<AdminEditWorkerDetails />} />
            <Route path="/admin/createWorker/" element={<AdminCreateWorker />} />

            <Route path="/admin/appointments" element={<AdminManageAppointments />} />
            <Route path="/admin/viewAppointmentDetails/:id" element={<AdminViewAppointmentDetails />} />

            <Route path="/admin/exams" element={<AdminManageExams />} />
            {/* <Route path="/admin/editexam/:id" element={<AdminManageExams />} /> */}
            <Route path="/admin/createExam" element={<AdminCreateExam />} />
            <Route path="/admin/viewExam/:id" element={<AdminManageExamQuestions />} />

            <Route path="/admin/results" element={<AdminManageExamResults />} />

          </Route>

           {/* End of Admin route*/}

          {/* Community Health Work Route */}

          <Route path="/chw" element={<Communit_Health_Work_Layout />}>
            <Route index element={<CommunityHealthWorkHome />} />
            <Route path="/chw/trainings" element={<CommunityHealthWorkTrainings />} />
            <Route path="/chw/myTrainingDetails/:id" element={<CommunityHealthWork_ViewTrainingDetails />} />
            <Route path="/chw/apply-training/:trainingId" element={<CommunityHealthWork_ApplyNewTraining />} />

            <Route path="/chw/appointments" element={<CommunityHealthWorker_ManageAppointments />} />
            <Route path="/chw/viewAppointmentDetails/:id" element={<CommunityHealthWorkerViewAppointmentDetails />} />

            <Route path="/chw/takeExam/:id" element={<CommunityHealthWork_TakeTrainingExam />} />
            <Route path="/chw/myCertificates" element={<CommunityHealthWorkResults />} />


            {/* <Route path="/organizer/profile" element={<OrganizerProfile />} /> */}
          </Route>
              {/* End of organizer route*/}

              {/* User Route */}

          <Route path="/citizen" element={<Citizen_Layout />}>

              <Route index element={<Home />} />

            

          </Route>
              {/* End of User route */}

        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;
