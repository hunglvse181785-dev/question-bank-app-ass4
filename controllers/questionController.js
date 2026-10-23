const Question = require('../models/Question');
const Quiz = require('../models/Quiz');
exports.getAllQuestions = async function (req, res, next) {
  try {
    const questions = await Question.find();
    res.json(questions);
  } catch (error) {
    next(error);
  }
};
exports.createQuestion = async function (req, res, next) {
  try {
    const { text, options, keywords, correctAnswerIndex } = req.body;

    const question = await Question.create({
      author: req.user._id,
      text,
      options,
      keywords,
      correctAnswerIndex
    });

    res.status(201).json(question);
  } catch (error) {
    next(error);
  }
};
exports.getQuestionById = async function (req, res, next) {
  try {
    const question = await Question.findById(req.params.questionId);

    if (!question) {
      return res.status(404).json({
        message: 'Không tìm thấy câu hỏi'
      });
    }

    res.json(question);
  } catch (error) {
    next(error);
  }
};
exports.updateQuestion = async function (req, res, next) {
  try {
    const question = await Question.findById(req.params.questionId);

    if (!question) {
      return res.status(404).json({
        message: 'Không tìm thấy câu hỏi'
      });
    }

    const fields = ['text', 'options', 'keywords', 'correctAnswerIndex'];

    for (const field of fields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        question[field] = req.body[field];
      }
    }

    await question.save();
    res.json(question);
  } catch (error) {
    next(error);
  }
};
exports.deleteQuestion = async function (req, res, next) {
  try {
    const question = await Question.findById(req.params.questionId);

    if (!question) {
      return res.status(404).json({
        message: 'Không tìm thấy câu hỏi'
      });
    }

    await Quiz.updateMany(
      { questions: question._id },
      { $pull: { questions: question._id } }
    );

    await question.deleteOne();

    res.json({
      message: 'Đã xóa câu hỏi',
      deletedId: question._id
    });
  } catch (error) {
    next(error);
  }
};
