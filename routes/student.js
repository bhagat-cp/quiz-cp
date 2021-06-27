const express = require('express');
const commonController = require('./../controller/common')
const studentController = require('./../controller/student')

const router = express.Router();

router.get('/performance', commonController.performance);
router.post('/join-quiz-room', studentController.joinQuizRoom);
router.get('/get-participants-list', commonController.getParticipantsList);

module.exports = router;