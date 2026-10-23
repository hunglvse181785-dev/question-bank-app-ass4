import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function ResultPage() {
  const { result, current: quiz } = useSelector((state) => state.quizzes);

  // Chưa có kết quả trong Redux, ví dụ vừa tải lại trang
  if (!result) {
    return (
      <main className="container py-5">
        <div className="alert alert-info">
          Chưa có kết quả bài làm. Hãy chọn một quiz và làm bài trước.
        </div>
        <Link to="/" className="btn btn-primary">
          Về danh sách quiz
        </Link>
      </main>
    );
  }

  const questions = quiz?.questions || [];

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
        <section className="card border-0 shadow-sm mb-4">
          <div className="card-body text-center p-4 p-md-5">
            <h1 className="h3 mb-2">Hoàn thành quiz</h1>
            <p className="text-secondary">{result.title}</p>

            <div className="display-4 fw-bold text-primary">
              {result.score}/{result.total}
            </div>
            <p className="fs-5 mb-0">Điểm: {result.percentage}%</p>
          </div>
        </section>

        <h2 className="h5 mb-3">Kết quả từng câu</h2>

        <div className="d-grid gap-3">
          {result.results.map((item, index) => {
            const question = questions.find(
              (entry) => String(entry._id) === item.questionId,
            );

            const selectedOption =
              item.selectedAnswerIndex == null
                ? 'Bạn chưa chọn câu trả lời.'
                : question?.options?.[item.selectedAnswerIndex] ??
                  'Không tìm thấy nội dung lựa chọn.';

            return (
              <section
                className="card border-0 shadow-sm"
                key={item.questionId}
              >
                <div className="card-body">
                  <div className="d-flex justify-content-between gap-3">
                    <h3 className="h6">
                      Câu {index + 1}. {question?.text || 'Câu hỏi'}
                    </h3>

                    <span
                      className={`badge align-self-start ${
                        item.isCorrect ? 'text-bg-success' : 'text-bg-danger'
                      }`}
                    >
                      {item.isCorrect ? 'Đúng' : 'Sai'}
                    </span>
                  </div>

                  <p className="mb-0 text-secondary">
                    Câu trả lời của bạn: {selectedOption}
                  </p>
                </div>
              </section>
            );
          })}
        </div>

        <div className="mt-4">
          <Link to="/" className="btn btn-primary">
            Làm quiz khác
          </Link>
        </div>
      </main>
    </div>
  );
}