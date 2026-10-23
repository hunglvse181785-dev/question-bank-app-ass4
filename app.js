require('dotenv').config();

const path = require('path');
const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const { engine } = require('express-handlebars');
const ejs = require('ejs');

const questionRoutes = require('./routes/questionRoutes');
const quizRoutes = require('./routes/quizRoutes');
const authRoutes = require('./routes/authRoutes');
const usersRoutes = require('./routes/users');
const app = express();
const isProduction = process.env.NODE_ENV === 'production';
const clientDistPath = path.join(__dirname, 'client', 'dist');

// Cấu hình Handlebars.
app.engine('hbs', engine({
  extname: '.hbs',
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views', 'layouts'),
  partialsDir: path.join(__dirname, 'views', 'partials')
}));

// Đăng ký thêm EJS.
app.engine('ejs', ejs.__express);

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Middleware.
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.use(express.static(
  path.join(__dirname, 'public'),
  { index: false }
));

// API Assignment 1.
app.use('/api/questions', questionRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);

if (isProduction) {
  // Render React SPA đã build; API vẫn được phục vụ bởi các route bên trên.
  app.use(express.static(clientDistPath, { index: false }));
  app.get('*', function (req, res, next) {
    if (req.path === '/api' || req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(clientDistPath, 'index.html'), function (error) {
      if (error) next(error);
    });
  });
} else {
  // Giao diện EJS cũ dùng khi chạy local/dev.
  // Chỉ nạp các route này local vì chúng dùng chứng chỉ HTTPS tự ký.
  const indexRoutes = require('./routes/index');
  const questionPageRoutes = require('./routes/questionPageRoutes');

  app.get('/', function (req, res) {
    res.render('home', {
      title: 'Ngân hàng câu hỏi'
    });
  });

  app.use('/', indexRoutes);
  app.use('/questions', questionPageRoutes);
}

// Xử lý đường dẫn không tồn tại.
app.use(function (req, res, next) {
  const error = new Error('Không tìm thấy đường dẫn');
  error.status = 404;
  next(error);
});

// Xử lý lỗi.
app.use(function (err, req, res, next) {
  let status = err.status || 500;

  if (err.name === 'ValidationError' || err.name === 'CastError') {
    status = 400;
  }

  const message = err.message || 'Lỗi máy chủ';

  if (req.originalUrl.startsWith('/api/')) {
    return res.status(status).json({ message });
  }

  res.status(status).render('error', {
    title: 'Thông báo lỗi',
    message
  });
});

module.exports = app;
