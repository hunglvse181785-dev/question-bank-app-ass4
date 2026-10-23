const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const { verifyUser, verifyAdmin } = require('../authenticate');

router.get('/', verifyUser, quizController.getAllQuizzes);
router.post('/', verifyUser, verifyAdmin, quizController.createQuiz);

router.get('/:quizId/populate', verifyUser, quizController.getQuizWithCapitalQuestions);
router.post('/:quizId/question', verifyUser, verifyAdmin, quizController.addQuestionToQuiz);
router.post('/:quizId/questions', verifyUser, verifyAdmin, quizController.addManyQuestionsToQuiz);

router.get('/:quizId', verifyUser, quizController.getQuizById);
router.put('/:quizId', verifyUser, verifyAdmin, quizController.updateQuiz);
router.delete('/:quizId', verifyUser, verifyAdmin, quizController.deleteQuiz);
router.post('/:quizId/submit', verifyUser, quizController.submitQuiz);

module.exports = router;