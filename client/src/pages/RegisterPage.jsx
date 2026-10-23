import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { registerUser } from '../features/auth/authSlice.js';

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = useSelector((state) => state.auth.token);
  const { status, error } = useSelector((state) => state.auth);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState('');

  if (token) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError('');

    if (password.length < 8) {
      setFormError('Mật khẩu phải có ít nhất 8 ký tự.');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Hai mật khẩu chưa khớp.');
      return;
    }

    const result = await dispatch(
      registerUser({ username: username.trim(), password }),
    );

    if (registerUser.fulfilled.match(result)) {
      navigate('/login', { replace: true, state: { registered: true } });
    }
  }

  return (
    <main className="auth-page">
      <section className="card border-0 shadow-sm auth-card">
        <div className="card-body p-4 p-md-5">
          <p className="text-primary fw-semibold mb-2">SimpleQuiz</p>
          <h1 className="h3 mb-2">Tạo tài khoản</h1>
          <p className="text-secondary mb-4">
            Tạo tài khoản để bắt đầu làm quiz.
          </p>

          {(formError || error) && (
            <div className="alert alert-danger" role="alert">
              {formError || error}
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

            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                Mật khẩu
              </label>
              <input
                id="password"
                type="password"
                className="form-control"
                autoComplete="new-password"
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              <div className="form-text">Tối thiểu 8 ký tự.</div>
            </div>

            <div className="mb-4">
              <label htmlFor="confirmPassword" className="form-label">
                Nhập lại mật khẩu
              </label>
              <input
                id="confirmPassword"
                type="password"
                className="form-control"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
              />
            </div>

            <button
              className="btn btn-primary w-100"
              type="submit"
              disabled={status === 'loading'}
            >
              {status === 'loading' ? 'Đang tạo tài khoản…' : 'Đăng ký'}
            </button>
          </form>

          <p className="text-secondary text-center mt-4 mb-0">
            Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
          </p>
        </div>
      </section>
    </main>
  );
}