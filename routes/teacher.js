const express = require('express');
const teacherController = require('./../controller/teacher');
const commonController = require('./../controller/common')
const router = express.Router();

router.get('/get-question', teacherController.getQuestion);
router.post('/question-answered', teacherController.questionAnswered);
router.post('/question-skipped', teacherController.questionSkipped);
router.post('/create-quiz-room', teacherController.createQuizRooms);
router.get('/performance', commonController.performance);

module.exports = router;