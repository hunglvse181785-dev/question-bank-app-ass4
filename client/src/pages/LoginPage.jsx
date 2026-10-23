import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { loginUser } from '../features/auth/authSlice.js';

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { token, status, error } = useSelector((state) => state.auth);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  if (token) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const result = await dispatch(loginUser({ username, password }));

    if (loginUser.fulfilled.match(result)) {
      navigate('/', { replace: true });
    }
  }

  return (
    <main className="auth-page">
      <section className="card border-0 shadow-sm auth-card">
        <div className="card-body p-4 p-md-5">
          <p className="text-primary fw-semibold mb-2">SimpleQuiz</p>
          <h1 className="h3 mb-2">Đăng nhập</h1>
          <p className="text-secondary mb-4">
            Đăng nhập để xem và làm các bài quiz.
          </p>

          {location.state?.registered && (
            <div className="alert alert-success" role="status">
              Tạo tài khoản thành công. Hãy đăng nhập để tiếp tục.
            </div>
          )}

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="username" className="form-label">
                Tên tài khoản
              </label>
              <input
                id="username"
                className="form-control"
                autoComplete="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="form-label">
                Mật khẩu
              </label>
              <input
                id="password"
                type="password"
                className="form-control"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>

            <button
              className="btn btn-primary w-100"
              type="submit"
              disabled={status === 'loading'}
            >
              {status === 'loading' ? 'Đang đăng nhập…' : 'Đăng nhập'}
            </button>
          </form>

          <p className="text-secondary text-center mt-4 mb-0">
            Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
          </p>
        </div>
      </section>
    </main>
  );
}