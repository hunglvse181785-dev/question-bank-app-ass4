import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import apiClient from '../api/apiClient.js';

const emptyForm = {
  text: '',
  options: ['', '', '', ''],
  keywords: '',
  correctAnswerIndex: '0',
};

export default function AdminQuestionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [questions, setQuestions] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [quizId, setQuizId] = useState(() => searchParams.get('quizId') || '');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadData = useCallback(async () => {
    try {
      const [questionResponse, quizResponse] = await Promise.all([
        apiClient.get('/questions'),
        apiClient.get('/quizzes'),
      ]);

      setQuestions(questionResponse.data);
      setQuizzes(quizResponse.data);
      const preferredId = quizId;
      const selectedId = quizResponse.data.some(
        (quiz) => quiz._id === preferredId,
      )
        ? preferredId
        : quizResponse.data[0]?._id || '';

      setQuizId(selectedId);
      if (searchParams.get('quizId') !== selectedId) {
        setSearchParams(selectedId ? { quizId: selectedId } : {}, {
          replace: true,
        });
      }
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'Không tải được dữ liệu. Hãy kiểm tra đăng nhập và quyền Admin.',
      );
    } finally {
      setLoading(false);
    }
  }, [quizId, searchParams, setSearchParams]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const selectedQuiz = quizzes.find((quiz) => quiz._id === quizId);
  const linkedQuestionIds = new Set(
    (selectedQuiz?.questions || []).map((question) =>
      String(question?._id || question),
    ),
  );
  const visibleQuestions = questions.filter((question) =>
    linkedQuestionIds.has(String(question._id)),
  );

  function handleQuizChange(nextQuizId) {
    setQuizId(nextQuizId);
    setSearchParams(nextQuizId ? { quizId: nextQuizId } : {}, {
      replace: true,
    });
  }

  function updateOption(index, value) {
    setForm((current) => ({
      ...current,
      options: current.options.map((option, optionIndex) =>
        optionIndex === index ? value : option,
      ),
    }));
  }

  function startEditing(question) {
    setEditingId(question._id);
    setForm({
      text: question.text || '',
      options: question.options || ['', '', '', ''],
      keywords: Array.isArray(question.keywords)
        ? question.keywords.join(', ')
        : '',
      correctAnswerIndex: String(question.correctAnswerIndex ?? 0),
    });
    setError('');
    setSuccess('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEditing() {
    setEditingId(null);
    setForm(emptyForm);
    setError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!form.text.trim() || form.options.some((option) => !option.trim())) {
      setError('Hãy nhập nội dung câu hỏi và đủ 4 lựa chọn.');
      return;
    }

    if (!editingId && !quizId) {
      setError('Hãy chọn quiz để thêm câu hỏi vào.');
      return;
    }

    const payload = {
      text: form.text.trim(),
      options: form.options.map((option) => option.trim()),
      keywords: form.keywords
        .split(',')
        .map((keyword) => keyword.trim())
        .filter(Boolean),
      correctAnswerIndex: Number(form.correctAnswerIndex),
    };

    setSaving(true);

    try {
      if (editingId) {
        await apiClient.put(`/questions/${editingId}`, payload);
        setSuccess('Đã cập nhật câu hỏi.');
      } else {
        await apiClient.post(`/quizzes/${quizId}/question`, payload);
        setSuccess('Đã tạo câu hỏi và thêm vào quiz.');
      }

      setEditingId(null);
      setForm(emptyForm);
      await loadData();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || 'Không lưu được câu hỏi.',
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(question) {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa câu hỏi "${question.text}" không?`,
    );

    if (!confirmed) return;

    setError('');
    setSuccess('');

    try {
      await apiClient.delete(`/questions/${question._id}`);
      setSuccess('Đã xóa câu hỏi khỏi hệ thống và các quiz liên quan.');
      if (editingId === question._id) cancelEditing();
      await loadData();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || 'Không xóa được câu hỏi.',
      );
    }
  }

  return (
    <div className="min-vh-100 bg-body-tertiary">
      <nav className="navbar bg-white border-bottom">
        <div className="container">
          <Link to="/" className="navbar-brand fw-bold text-primary">
            SimpleQuiz
          </Link>
          <Link to="/" className="btn btn-outline-secondary btn-sm">
            Về danh sách quiz
          </Link>
        </div>
      </nav>

      <main className="container py-4 py-md-5">
        <h1 className="h3 mb-4">Quản lý câu hỏi</h1>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <section className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <h2 className="h5 mb-3">
              {editingId ? 'Sửa câu hỏi' : 'Tạo câu hỏi'}
            </h2>

            <form onSubmit={handleSubmit}>
              {!editingId && (
                <div className="mb-3">
                  <label className="form-label" htmlFor="quiz">
                    Thêm vào quiz
                  </label>
                  <select
                    id="quiz"
                    className="form-select"
                    value={quizId}
                    onChange={(event) => handleQuizChange(event.target.value)}
                    required
                  >
                    {quizzes.length === 0 && (
                      <option value="">Chưa có quiz</option>
                    )}
                    {quizzes.map((quiz) => (
                      <option key={quiz._id} value={quiz._id}>
                        {quiz.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="mb-3">
                <label className="form-label" htmlFor="questionText">
                  Nội dung câu hỏi
                </label>
                <textarea
                  id="questionText"
                  className="form-control"
                  rows="2"
                  value={form.text}
                  onChange={(event) =>
                    setForm({ ...form, text: event.target.value })
                  }
                  required
                />
              </div>

              {form.options.map((option, index) => (
                <div className="mb-3" key={index}>
                  <label className="form-label" htmlFor={`option-${index}`}>
                    Lựa chọn {index + 1}
                  </label>
                  <input
                    id={`option-${index}`}
                    className="form-control"
                    value={option}
                    onChange={(event) =>
                      updateOption(index, event.target.value)
                    }
                    required
                  />
                </div>
              ))}

              <div className="mb-3">
                <label className="form-label" htmlFor="correctAnswer">
                  Đáp án đúng
                </label>
                <select
                  id="correctAnswer"
                  className="form-select"
                  value={form.correctAnswerIndex}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      correctAnswerIndex: event.target.value,
                    })
                  }
                >
                  {form.options.map((_, index) => (
                    <option key={index} value={index}>
                      Lựa chọn {index + 1}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="keywords">
                  Từ khóa (phân cách bằng dấu phẩy)
                </label>
                <input
                  id="keywords"
                  className="form-control"
                  value={form.keywords}
                  onChange={(event) =>
                    setForm({ ...form, keywords: event.target.value })
                  }
                  placeholder="ví dụ: toán, phép cộng"
                />
              </div>

              <div className="d-flex gap-2">
                <button
                  className="btn btn-primary"
                  type="submit"
                  disabled={saving || (!editingId && quizzes.length === 0)}
                >
                  {saving
                    ? 'Đang lưu…'
                    : editingId
                      ? 'Lưu thay đổi'
                      : 'Tạo câu hỏi'}
                </button>

                {editingId && (
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={cancelEditing}
                  >
                    Hủy sửa
                  </button>
                )}
              </div>
            </form>
          </div>
        </section>

        <h2 className="h5 mb-3">
          Câu hỏi trong quiz: {selectedQuiz?.title || 'Chưa chọn quiz'}
        </h2>

        {loading ? (
          <p role="status">Đang tải câu hỏi…</p>
        ) : !selectedQuiz ? (
          <div className="alert alert-info">Hãy chọn quiz để xem câu hỏi.</div>
        ) : visibleQuestions.length === 0 ? (
          <div className="alert alert-info">Quiz này chưa có câu hỏi nào.</div>
        ) : (
          <div className="d-grid gap-3">
            {visibleQuestions.map((question) => (
              <article
                className="card border-0 shadow-sm"
                key={question._id}
              >
                <div className="card-body">
                  <h3 className="h6">{question.text}</h3>
                  <ol className="mb-3">
                    {question.options?.map((option, index) => (
                      <li key={index}>
                        {option}
                        {index === question.correctAnswerIndex && (
                          <span className="badge text-bg-success ms-2">
                            Đáp án đúng
                          </span>
                        )}
                      </li>
                    ))}
                  </ol>

                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      type="button"
                      onClick={() => startEditing(question)}
                    >
                      Sửa
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      type="button"
                      onClick={() => handleDelete(question)}
                    >
                      Xóa
                    </button>
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
