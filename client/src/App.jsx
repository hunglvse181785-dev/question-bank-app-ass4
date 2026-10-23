import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useSelector } from 'react-redux';

import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import QuizPage from './pages/QuizPage.jsx';
import ResultPage from './pages/ResultPage.jsx';
import AdminQuestionsPage from './pages/AdminQuestionsPage.jsx';
import AdminQuizzesPage from './pages/AdminQuizzesPage.jsx';

function RequireAuth({ children }) {
  const token = useSelector((state) => state.auth.token);
  return token ? children : <Navigate to="/login" replace />;
}

function RequireAdmin({ children }) {
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);
  if (!token) return <Navigate to="/login" replace />;
  if (!user?.admin) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<RequireAuth><DashboardPage /></RequireAuth>} />
        <Route path="/quizzes/:quizId" element={<RequireAuth><QuizPage /></RequireAuth>} />
        <Route path="/quiz-result" element={<RequireAuth><ResultPage /></RequireAuth>} />
        <Route path="/admin/quizzes" element={<RequireAdmin><AdminQuizzesPage /></RequireAdmin>} />
        <Route path="/admin/questions" element={<RequireAdmin><AdminQuestionsPage /></RequireAdmin>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
