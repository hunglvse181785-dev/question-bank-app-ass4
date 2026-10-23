const express = require('express');
const ejs = require('ejs');
const path = require('path');
const apiClient = require('../config/apiClient');

const router = express.Router();

async function renderPage(res, view, title, data = {}) {
  const content = await ejs.renderFile(
    path.join(__dirname, '../views/questions', `${view}.ejs`),
    data
  );

  return res.render('quizzes', { title, content });
}

// Đọc dữ liệu từ form.
function readQuestion(body) {
  const options = Array.isArray(body.options)
    ? body.options
    : [body.options || ''];

  return {
    text: String(body.text || '').trim(),
    options: options.map(option => String(option).trim()),
    keywords: String(body.keywords || '')
      .split(',')
      .map(keyword => keyword.trim())
      .filter(Boolean),
    correctAnswerIndex: Number(body.correctAnswerIndex)
  };
}

function validateQuestion(question) {
  if (!question.text) {
    return 'Vui lòng nhập nội dung câu hỏi.';
  }

  if (
    question.options.length < 2 ||
    question.options.some(option => !option)
  ) {
    return 'Cần ít nhất hai lựa chọn và không được để trống.';
  }

  if (
    !Number.isInteger(question.correctAnswerIndex) ||
    question.correctAnswerIndex < 0 ||
    question.correctAnswerIndex >= question.options.length
  ) {
    return 'Vui lòng chọn đáp án đúng.';
  }

  return '';
}

// Danh sách.
router.get('/', async function (req, res, next) {
  try {
    const response = await apiClient.get('/questions');

    await renderPage(res, 'list', 'Danh sách câu hỏi', {
      questions: response.data
    });
  } catch (error) {
    next(error);
  }
});

// Form tạo.
router.get('/create', async function (req, res, next) {
  try {
    await renderPage(res, 'form', 'Tạo câu hỏi', {
      question: {
        text: '',
        options: ['', '', '', ''],
        keywords: [],
        correctAnswerIndex: 0
      },
      editing: false,
      error: ''
    });
  } catch (error) {
    next(error);
  }
});

// Tạo câu hỏi.
router.post('/', async function (req, res, next) {
  const question = readQuestion(req.body);

  try {
    const error = validateQuestion(question);

    if (error) {
      res.status(400);

      return await renderPage(res, 'form', 'Tạo câu hỏi', {
        question,
        editing: false,
        error
      });
    }

    await apiClient.post('/questions', question);
    res.redirect('/questions');
  } catch (error) {
    next(error);
  }
});

// Form sửa.
router.get('/:id/edit', async function (req, res, next) {
  try {
    const response = await apiClient.get(`/questions/${req.params.id}`);

    await renderPage(res, 'form', 'Sửa câu hỏi', {
      question: response.data,
      editing: true,
      error: ''
    });
  } catch (error) {
    next(error);
  }
});

// Cập nhật.
router.put('/:id', async function (req, res, next) {
  const question = {
    ...readQuestion(req.body),
    _id: req.params.id
  };

  try {
    const error = validateQuestion(question);

    if (error) {
      res.status(400);

      return await renderPage(res, 'form', 'Sửa câu hỏi', {
        question,
        editing: true,
        error
      });
    }

    await apiClient.put(`/questions/${req.params.id}`, {
      text: question.text,
      options: question.options,
      keywords: question.keywords,
      correctAnswerIndex: question.correctAnswerIndex
    });

    res.redirect('/questions');
  } catch (error) {
    next(error);
  }
});

// Xóa.
router.delete('/:id', async function (req, res, next) {
  try {
    await apiClient.delete(`/questions/${req.params.id}`);
    res.redirect('/questions');
  } catch (error) {
    next(error);
  }
});

// Chi tiết.
router.get('/:id', async function (req, res, next) {
  try {
    const response = await apiClient.get(`/questions/${req.params.id}`);

    await renderPage(res, 'details', 'Chi tiết câu hỏi', {
      question: response.data
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
