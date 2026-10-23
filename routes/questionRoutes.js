const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const { verifyUser, verifyAdmin } = require('../authenticate');

router.get('/', verifyUser, verifyAdmin, questionController.getAllQuestions);
router.post('/', verifyUser, verifyAdmin, questionController.createQuestion);

router.get('/:questionId', verifyUser, verifyAdmin, questionController.getQuestionById);
router.put('/:questionId', verifyUser, verifyAdmin, questionController.updateQuestion);
router.delete('/:questionId', verifyUser, verifyAdmin, questionController.deleteQuestion);

module.exports = router;