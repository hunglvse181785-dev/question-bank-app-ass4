const Quiz = require('../models/Quiz');
const Question = require('../models/Question');

exports.getAllQuizzes = async function (req, res, next) {
  try {
    const quizzes = await Quiz.find().populate({
      path: 'questions',
      select: 'text options keywords',
    });

    res.json(quizzes);
  } catch (error) {
    next(error);
  }
};

exports.createQuiz = async function (req, res, next) {
  try {
    const { title, description } = req.body;

    const quiz = await Quiz.create({
      title,
      description,
      questions: [],
    });

    res.status(201).json(quiz);
  } catch (error) {
    next(error);
  }
};

exports.getQuizById = async function (req, res, next) {
  try {
    const quiz = await Quiz.findById(req.params.quizId).populate({
      path: 'questions',
      select: 'text options keywords',
    });

    if (!quiz) {
      return res.status(404).json({
        message: 'Không tìm thấy quiz',
      });
    }

    res.json(quiz);
  } catch (error) {
    next(error);
  }
};

exports.updateQuiz = async function (req, res, next) {
  try {
    const quiz = await Quiz.findById(req.params.quizId);

    if (!quiz) {
      return res.status(404).json({
        message: 'Không tìm thấy quiz',
      });
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'title')) {
      quiz.title = req.body.title;
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'description')) {
      quiz.description = req.body.description;
    }

    await quiz.save();
    res.json(quiz);
  } catch (error) {
    next(error);
  }
};

exports.deleteQuiz = async function (req, res, next) {
  try {
    const quiz = await Quiz.findByIdAndDelete(req.params.quizId);

    if (!quiz) {
      return res.status(404).json({
        message: 'Không tìm thấy quiz',
      });
    }

    res.json({
      message: 'Đã xóa quiz',
      deletedId: quiz._id,
    });
  } catch (error) {
    next(error);
  }
};

exports.getQuizWithCapitalQuestions = async function (req, res, next) {
  try {
    const quiz = await Quiz.findById(req.params.quizId).populate({
      path: 'questions',
      select: 'text options keywords',
      match: {
        text: {
          $regex: '\\bcapital\\b',
          $options: 'i',
        },
      },
    });

    if (!quiz) {
      return res.status(404).json({
        message: 'Không tìm thấy quiz',
      });
    }

    res.json(quiz);
  } catch (error) {
    next(error);
  }
};

exports.addQuestionToQuiz = async function (req, res, next) {
  let question;

  try {
    const quiz = await Quiz.findById(req.params.quizId);

    if (!quiz) {
      return res.status(404).json({
        message: 'Không tìm thấy quiz',
      });
    }

    const {
      text,
      options,
      keywords,
      correctAnswerIndex,
    } = req.body;

    question = await Question.create({
      author: req.user._id,
      text,
      options,
      keywords,
      correctAnswerIndex,
    });

    quiz.questions.push(question._id);
    await quiz.save();

    return res.status(201).json(question);
  } catch (error) {
    if (question) {
      try {
        await Question.findByIdAndDelete(question._id);
      } catch (cleanupError) {
        console.error('Lỗi dọn câu hỏi:', cleanupError.message);
      }
    }

    next(error);
  }
};

exports.addManyQuestionsToQuiz = async function (req, res, next) {
  let questionDocuments = [];

  try {
    const quiz = await Quiz.findById(req.params.quizId);

    if (!quiz) {
      return res.status(404).json({
        message: 'Không tìm thấy quiz',
      });
    }

    if (!Array.isArray(req.body) || req.body.length === 0) {
      return res.status(400).json({
        message: 'Body phải là mảng câu hỏi không rỗng',
      });
    }

    const documents = req.body.map(function (item) {
      const {
        text,
        options,
        keywords,
        correctAnswerIndex,
      } = item || {};

      return new Question({
        author: req.user._id,
        text,
        options,
        keywords,
        correctAnswerIndex,
      });
    });

    // Kiểm tra toàn bộ câu hỏi trước khi lưu.
    await Promise.all(
      documents.map(function (document) {
        return document.validate();
      }),
    );

    questionDocuments = documents;
    const questions = await Question.insertMany(documents);

    quiz.questions.push(
      ...questions.map(function (question) {
        return question._id;
      }),
    );

    await quiz.save();

    return res.status(201).json({
      message: 'Đã thêm các câu hỏi vào quiz',
      count: questions.length,
      questions,
    });
  } catch (error) {
    if (questionDocuments.length > 0) {
      try {
        await Question.deleteMany({
          _id: {
            $in: questionDocuments.map(function (question) {
              return question._id;
            }),
          },
        });
      } catch (cleanupError) {
        console.error('Lỗi dọn câu hỏi:', cleanupError.message);
      }
    }

    next(error);
  }
};
exports.submitQuiz = async function (req, res, next) {
  try {
    const quiz = await Quiz.findById(req.params.quizId).populate({
      path: 'questions',
      select: 'text options correctAnswerIndex',
    });

    if (!quiz) {
      return res.status(404).json({
        message: 'Không tìm thấy quiz',
      });
    }

    const questions = quiz.questions.filter(Boolean);
    const answers = req.body.answers;

    if (!Array.isArray(answers) || answers.length !== questions.length) {
      return res.status(400).json({
        message: 'Cần gửi câu trả lời cho tất cả câu hỏi trong quiz',
      });
    }

    const answerByQuestionId = new Map();

    for (const answer of answers) {
      if (
        !answer ||
        typeof answer.questionId !== 'string' ||
        answerByQuestionId.has(answer.questionId)
      ) {
        return res.status(400).json({
          message: 'Danh sách câu trả lời không hợp lệ',
        });
      }

      const question = questions.find(
        (item) => String(item._id) === answer.questionId,
      );

      if (!question) {
        return res.status(400).json({
          message: 'Câu trả lời có questionId không thuộc quiz này',
        });
      }

      const selectedAnswerIndex = answer.selectedAnswerIndex;

      if (
        selectedAnswerIndex !== null &&
        (!Number.isInteger(selectedAnswerIndex) ||
          selectedAnswerIndex < 0 ||
          selectedAnswerIndex >= question.options.length)
      ) {
        return res.status(400).json({
          message: 'Vị trí lựa chọn không hợp lệ',
        });
      }

      answerByQuestionId.set(answer.questionId, selectedAnswerIndex);
    }

    if (
      questions.some((question) => !answerByQuestionId.has(String(question._id)))
    ) {
      return res.status(400).json({
        message: 'Bạn chưa gửi câu trả lời cho tất cả câu hỏi',
      });
    }

    const results = questions.map((question) => {
      const selectedAnswerIndex = answerByQuestionId.get(String(question._id));

      return {
        questionId: String(question._id),
        selectedAnswerIndex,
        isCorrect: selectedAnswerIndex === question.correctAnswerIndex,
      };
    });

    const score = results.filter((result) => result.isCorrect).length;
    const total = questions.length;
    const percentage = total === 0 ? 0 : Math.round((score / total) * 100);

    return res.json({
      quizId: String(quiz._id),
      title: quiz.title,
      score,
      total,
      percentage,
      results,
    });
  } catch (error) {
    next(error);
  }
};