import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  clearQuizResult,
  fetchQuizById,
  submitQuizAttempt,
} from '../features/quiz/quizSlice.js';

export default function QuizPage() {
  const { quizId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    current: quiz,
    detailStatus,
    submitStatus,
    error,
  } = useSelector((state) => state.quizzes);

  const [answers, setAnswers] = useState({});

  useEffect(() => {
    setAnswers({});
    dispatch(clearQuizResult());
    dispatch(fetchQuizById(quizId));
  }, [dispatch, quizId]);

  const questions = quiz?.questions || [];
  const answeredCount = Object.values(answers).filter(
    (answer) => answer !== null && answer !== undefined,
  ).length;

  function handleAnswerChange(questionId, selectedAnswerIndex) {
    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [questionId]: selectedAnswerIndex,
    }));
  }

  async function handleSubmit() {
    const result = await dispatch(
      submitQuizAttempt({
        quizId,
        answers: questions.map((question) => ({
          questionId: String(question._id),
          selectedAnswerIndex: answers[question._id] ?? null,
        })),
      }),
    );

    if (submitQuizAttempt.fulfilled.match(result)) {
      navigate('/quiz-result');
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
        {detailStatus === 'loading' && (
          <div className="text-center py-5" role="status">
            <div className="spinner-border text-primary" aria-hidden="true" />
            <p className="text-secondary mt-3">Đang tải quiz…</p>
          </div>
        )}

        {detailStatus === 'failed' && (
          <div className="alert alert-danger" role="alert">
            {error || 'Không tải được quiz.'}
          </div>
        )}

        {detailStatus === 'succeeded' && quiz && (
          <>
            <header className="mb-4">
              <h1 className="h3">{quiz.title}</h1>
              {quiz.description && (
                <p className="text-secondary">{quiz.description}</p>
              )}
              <p className="small text-secondary mb-0">
                Đã trả lời {answeredCount}/{questions.length} câu
              </p>
            </header>

            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            {questions.length === 0 ? (
              <div className="alert alert-info">
                Quiz này chưa có câu hỏi.
              </div>
            ) : (
              <>
                <div className="d-grid gap-3">
                  {questions.map((question, questionIndex) => (
                    <section
                      className="card border-0 shadow-sm"
                      key={question._id}
                    >
                      <div className="card-body">
                        <h2 className="h5">
                          Câu {questionIndex + 1}. {question.text}
                        </h2>

                        <div className="d-grid gap-2 mt-3">
                          {question.options.map((option, optionIndex) => (
                            <label
                              className="border rounded p-3 d-flex align-items-center gap-2"
                              key={`${question._id}-${optionIndex}`}
                            >
                              <input
                                className="form-check-input m-0"
                                type="radio"
                                name={`question-${question._id}`}
                                checked={
                                  answers[question._id] === optionIndex
                                }
                                onChange={() =>
                                  handleAnswerChange(
                                    question._id,
                                    optionIndex,
                                  )
                                }
                              />
                              <span>{option}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </section>
                  ))}
                </div>

                <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mt-4">
                  <span className="text-secondary">
                    Câu chưa chọn sẽ được tính là sai.
                  </span>

                  <button
                    className="btn btn-primary"
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitStatus === 'loading'}
                  >
                    {submitStatus === 'loading'
                      ? 'Đang chấm bài…'
                      : 'Nộp bài'}
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}