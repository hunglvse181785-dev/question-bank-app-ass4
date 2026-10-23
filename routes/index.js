const express = require('express');
const ejs = require('ejs');
const path = require('path');
const apiClient = require('../config/apiClient');

const router = express.Router();

// Render EJS bên trong layout Handlebars.
async function renderPage(res, view, title, data = {}) {
  const content = await ejs.renderFile(
    path.join(__dirname, '../views/quizzes', `${view}.ejs`),
    data
  );

  return res.render('quizzes', { title, content });
}

// Tạo dữ liệu cho một khung câu hỏi trống.
function emptyQuestion() {
  return {
    text: '',
    options: ['', '', '', ''],
    keywords: '',
    correctAnswerIndex: -1
  };
}

// Chuyển dữ liệu form thành mảng.
// Một trường cùng tên có thể được gửi dưới dạng chuỗi hoặc mảng.
function toArray(value) {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

// Danh sách quiz.
router.get('/quizzes', async function (req, res, next) {
  try {
    const response = await apiClient.get('/quizzes');

    await renderPage(res, 'list', 'Danh sách quiz', {
      quizzes: response.data
    });
  } catch (error) {
    next(error);
  }
});

// Form tạo quiz.
router.get('/quizzes/create', async function (req, res, next) {
  try {
    await renderPage(res, 'form', 'Tạo quiz', {
      quiz: {
        title: '',
        description: ''
      },
      editing: false,
      error: ''
    });
  } catch (error) {
    next(error);
  }
});

// Tạo quiz.
router.post('/quizzes', async function (req, res, next) {
  const quiz = {
    title: String(req.body.title || '').trim(),
    description: String(req.body.description || '').trim()
  };

  try {
    if (!quiz.title) {
      res.status(400);

      return await renderPage(res, 'form', 'Tạo quiz', {
        quiz,
        editing: false,
        error: 'Vui lòng nhập tên quiz.'
      });
    }

    await apiClient.post('/quizzes', quiz);
    res.redirect('/quizzes');
  } catch (error) {
    next(error);
  }
});

// Form sửa quiz.
router.get('/quizzes/:id/edit', async function (req, res, next) {
  try {
    const response = await apiClient.get(`/quizzes/${req.params.id}`);

    await renderPage(res, 'form', 'Sửa quiz', {
      quiz: response.data,
      editing: true,
      error: ''
    });
  } catch (error) {
    next(error);
  }
});

// Cập nhật quiz.
router.put('/quizzes/:id', async function (req, res, next) {
  const quiz = {
    _id: req.params.id,
    title: String(req.body.title || '').trim(),
    description: String(req.body.description || '').trim()
  };

  try {
    if (!quiz.title) {
      res.status(400);

      return await renderPage(res, 'form', 'Sửa quiz', {
        quiz,
        editing: true,
        error: 'Vui lòng nhập tên quiz.'
      });
    }

    await apiClient.put(`/quizzes/${req.params.id}`, {
      title: quiz.title,
      description: quiz.description
    });

    res.redirect('/quizzes');
  } catch (error) {
    next(error);
  }
});

// Xóa quiz.
router.delete('/quizzes/:id', async function (req, res, next) {
  try {
    await apiClient.delete(`/quizzes/${req.params.id}`);
    res.redirect('/quizzes');
  } catch (error) {
    next(error);
  }
});

// Form thêm một hoặc nhiều câu hỏi vào quiz.
router.get('/quizzes/:id/add-questions', async function (req, res, next) {
  try {
    const response = await apiClient.get(`/quizzes/${req.params.id}`);

    await renderPage(res, 'add-questions', 'Thêm câu hỏi vào quiz', {
      quiz: response.data,
      error: '',
      questions: [emptyQuestion()]
    });
  } catch (error) {
    next(error);
  }
});

// Lưu một hoặc nhiều câu hỏi từ form.
router.post('/quizzes/:id/add-questions', async function (req, res, next) {
  try {
    const body = req.body || {};

    const texts = toArray(body.text);
    const optionA = toArray(body.optionA);
    const optionB = toArray(body.optionB);
    const optionC = toArray(body.optionC);
    const optionD = toArray(body.optionD);
    const keywords = toArray(body.keywords);
    const answers = toArray(body.correctAnswerIndex);

    const questions = texts.map((text, index) => ({
      text: String(text || '').trim(),
      options: [
        String(optionA[index] || '').trim(),
        String(optionB[index] || '').trim(),
        String(optionC[index] || '').trim(),
        String(optionD[index] || '').trim()
      ],
      keywords: String(keywords[index] || '').trim(),
      correctAnswerIndex:
        /^[0-3]$/.test(String(answers[index]))
          ? Number(answers[index])
          : -1
    }));

    let errorMessage = '';

    if (questions.length === 0) {
      errorMessage = 'Vui lòng thêm ít nhất một câu hỏi.';
    }

    // Kiểm tra tất cả câu hỏi trước khi gửi đến API.
    for (let index = 0; index < questions.length; index++) {
      const question = questions[index];

      if (!question.text) {
        errorMessage =
          `Câu hỏi ${index + 1}: vui lòng nhập nội dung.`;
        break;
      }

      if (question.options.some(option => !option)) {
        errorMessage =
          `Câu hỏi ${index + 1}: vui lòng nhập đủ 4 lựa chọn.`;
        break;
      }

      if (
        !Number.isInteger(question.correctAnswerIndex) ||
        question.correctAnswerIndex < 0 ||
        question.correctAnswerIndex > 3
      ) {
        errorMessage =
          `Câu hỏi ${index + 1}: vui lòng chọn đáp án đúng.`;
        break;
      }
    }

    // Hiển thị lỗi và giữ lại dữ liệu đã nhập.
    if (errorMessage) {
      const response = await apiClient.get(`/quizzes/${req.params.id}`);

      res.status(400);

      return await renderPage(
        res,
        'add-questions',
        'Thêm câu hỏi vào quiz',
        {
          quiz: response.data,
          error: errorMessage,
          questions: questions.length
            ? questions
            : [emptyQuestion()]
        }
      );
    }

    // Chuyển dữ liệu form thành định dạng API yêu cầu.
    const payload = questions.map(question => ({
      text: question.text,
      options: question.options,
      keywords: question.keywords
        .split(',')
        .map(keyword => keyword.trim())
        .filter(Boolean),
      correctAnswerIndex: question.correctAnswerIndex
    }));

    if (payload.length === 1) {
      await apiClient.post(
        `/quizzes/${req.params.id}/question`,
        payload[0]
      );
    } else {
      await apiClient.post(
        `/quizzes/${req.params.id}/questions`,
        payload
      );
    }

    res.redirect(`/quizzes/${req.params.id}`);
  } catch (error) {
    next(error);
  }
});

// Lọc câu hỏi chứa capital bằng API.
router.get('/quizzes/:id/capital', async function (req, res, next) {
  try {
    const response = await apiClient.get(
      `/quizzes/${req.params.id}/populate`
    );

    await renderPage(res, 'details', 'Câu hỏi chứa capital', {
      quiz: response.data,
      capitalOnly: true
    });
  } catch (error) {
    next(error);
  }
});

// Chi tiết quiz.
router.get('/quizzes/:id', async function (req, res, next) {
  try {
    const response = await apiClient.get(`/quizzes/${req.params.id}`);

    await renderPage(res, 'details', 'Chi tiết quiz', {
      quiz: response.data
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;