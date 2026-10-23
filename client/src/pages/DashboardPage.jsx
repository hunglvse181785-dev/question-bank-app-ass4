import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { logoutUser } from '../features/auth/authSlice.js';
import { fetchQuizzes } from '../features/quiz/quizSlice.js';

export default function DashboardPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const { list, listStatus, error } = useSelector((state) => state.quizzes);

  useEffect(() => {
    dispatch(fetchQuizzes());
  }, [dispatch]);

  async function handleLogout() {
    await dispatch(logoutUser());
    navigate('/login', { replace: true });
  }

  return (
    <div className="min-vh-100 bg-body-tertiary">
      <nav className="navbar bg-white border-bottom">
        <div className="container">
          <Link to="/" className="navbar-brand fw-bold text-primary">SimpleQuiz</Link>
          <div className="d-flex align-items-center gap-2 gap-md-3">
            {user?.admin && (
              <>
                <Link to="/admin/quizzes" className="btn btn-outline-primary btn-sm">Quản lý quiz</Link>
                <Link to="/admin/questions" className="btn btn-outline-primary btn-sm">Quản lý câu hỏi</Link>
              </>
            )}
            <span className="text-secondary d-none d-sm-inline">{user?.username}</span>
            <button className="btn btn-outline-secondary btn-sm" onClick={handleLogout}>Đăng xuất</button>
          </div>
        </div>
      </nav>

      <main className="container py-4 py-md-5">
        <div className="mb-4">
          <h1 className="h3 mb-2">Xin chào, {user?.username || 'bạn'}!</h1>
          <p className="text-secondary mb-0">Chọn một quiz để bắt đầu làm bài.</p>
        </div>

        {listStatus === 'loading' && (
          <div className="text-center py-5" role="status">
            <div className="spinner-border text-primary" aria-hidden="true" />
            <p className="text-secondary mt-3 mb-0">Đang tải danh sách quiz…</p>
          </div>
        )}
        {listStatus === 'failed' && (
          <div className="alert alert-danger" role="alert">
            <p className="mb-2">{error || 'Không tải được danh sách quiz.'}</p>
            <button className="btn btn-sm btn-outline-danger" onClick={() => dispatch(fetchQuizzes())}>Thử lại</button>
          </div>
        )}
        {listStatus === 'succeeded' && list.length === 0 && (
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center py-5">
              <h2 className="h5">Chưa có quiz</h2>
              <p className="text-secondary mb-0">Hiện chưa có bài quiz nào để làm.</p>
              {user?.admin && <Link to="/admin/quizzes" className="btn btn-primary mt-3">Tạo quiz đầu tiên</Link>}
            </div>
          </div>
        )}
        {listStatus === 'succeeded' && list.length > 0 && (
          <div className="row g-3">
            {list.map((quiz) => (
              <div className="col-12 col-md-6 col-lg-4" key={quiz._id}>
                <article className="card h-100 border-0 shadow-sm">
                  <div className="card-body d-flex flex-column">
                    <h2 className="h5">{quiz.title}</h2>
                    <p className="text-secondary">{quiz.description || 'Chưa có mô tả cho quiz này.'}</p>
                    <p className="small text-secondary mt-auto">{quiz.questions?.length ?? 0} câu hỏi</p>
                    <Link to={`/quizzes/${quiz._id}`} className="btn btn-primary">Bắt đầu làm</Link>
                  </div>
                </article>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
