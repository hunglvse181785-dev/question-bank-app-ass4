import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import apiClient from '../api/apiClient.js';
import { fetchQuizzes } from '../features/quiz/quizSlice.js';

const emptyForm = { title: '', description: '' };

export default function AdminQuizzesPage() {
  const dispatch = useDispatch();
  const [quizzes, setQuizzes] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function loadQuizzes() {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.get('/quizzes');
      setQuizzes(response.data);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'Không tải được danh sách quiz. Hãy kiểm tra đăng nhập và quyền Admin.',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadQuizzes();
  }, []);

  function startEditing(quiz) {
    setEditingId(quiz._id);
    setForm({ title: quiz.title || '', description: quiz.description || '' });
    setError('');
    setSuccess('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSuccess('');
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
    };

    if (!payload.title) {
      setError('Vui lòng nhập tên quiz.');
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await apiClient.put(`/quizzes/${editingId}`, payload);
        setSuccess('Đã cập nhật quiz.');
      } else {
        await apiClient.post('/quizzes', payload);
        setSuccess('Đã tạo quiz. Bây giờ bạn có thể thêm câu hỏi cho quiz.');
      }
      resetForm();
      await loadQuizzes();
      dispatch(fetchQuizzes());
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Không lưu được quiz.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(quiz) {
    if (!window.confirm(`Bạn có chắc muốn xóa quiz “${quiz.title}” không?`)) {
      return;
    }
    setError('');
    setSuccess('');
    try {
      await apiClient.delete(`/quizzes/${quiz._id}`);
      if (editingId === quiz._id) resetForm();
      setSuccess('Đã xóa quiz.');
      await loadQuizzes();
      dispatch(fetchQuizzes());
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Không xóa được quiz.');
    }
  }

  return (
    <div className="min-vh-100 bg-body-tertiary">
      <nav className="navbar bg-white border-bottom">
        <div className="container">
          <Link to="/" className="navbar-brand fw-bold text-primary">SimpleQuiz</Link>
          <div className="d-flex gap-2">
            <Link to="/admin/questions" className="btn btn-outline-primary btn-sm">Quản lý câu hỏi</Link>
            <Link to="/" className="btn btn-outline-secondary btn-sm">Về Dashboard</Link>
          </div>
        </div>
      </nav>

      <main className="container py-4 py-md-5">
        <h1 className="h3 mb-4">Quản lý quiz</h1>
        {error && <div className="alert alert-danger" role="alert">{error}</div>}
        {success && <div className="alert alert-success" role="status">{success}</div>}

        <section className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <h2 className="h5 mb-3">{editingId ? 'Sửa quiz' : 'Tạo quiz mới'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label" htmlFor="quiz-title">Tên quiz</label>
                <input
                  id="quiz-title"
                  className="form-control"
                  value={form.title}
                  onChange={(event) => setForm({ ...form, title: event.target.value })}
                  maxLength={120}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label" htmlFor="quiz-description">Mô tả</label>
                <textarea
                  id="quiz-description"
                  className="form-control"
                  rows="3"
                  value={form.description}
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
                />
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-primary" type="submit" disabled={saving}>
                  {saving ? 'Đang lưu…' : editingId ? 'Lưu thay đổi' : 'Tạo quiz'}
                </button>
                {editingId && (
                  <button className="btn btn-outline-secondary" type="button" onClick={resetForm}>
                    Hủy sửa
                  </button>
                )}
              </div>
            </form>
          </div>
        </section>

        <h2 className="h5 mb-3">Danh sách quiz</h2>
        {loading ? (
          <div className="text-center py-4" role="status">
            <div className="spinner-border text-primary" aria-hidden="true" />
            <p className="text-secondary mt-2">Đang tải quiz…</p>
          </div>
        ) : quizzes.length === 0 ? (
          <div className="alert alert-info">Chưa có quiz. Tạo quiz đầu tiên bằng biểu mẫu phía trên.</div>
        ) : (
          <div className="d-grid gap-3">
            {quizzes.map((quiz) => (
              <article className="card border-0 shadow-sm" key={quiz._id}>
                <div className="card-body d-flex flex-column flex-md-row justify-content-between gap-3">
                  <div>
                    <h3 className="h5">{quiz.title}</h3>
                    <p className="text-secondary mb-1">{quiz.description || 'Chưa có mô tả.'}</p>
                    <small className="text-secondary">{quiz.questions?.length ?? 0} câu hỏi</small>
                  </div>
                  <div className="d-flex align-items-start gap-2 flex-wrap">
                    <Link to="/admin/questions" className="btn btn-sm btn-success">Thêm câu hỏi</Link>
                    <button className="btn btn-sm btn-outline-primary" type="button" onClick={() => startEditing(quiz)}>Sửa</button>
                    <button className="btn btn-sm btn-outline-danger" type="button" onClick={() => handleDelete(quiz)}>Xóa</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

