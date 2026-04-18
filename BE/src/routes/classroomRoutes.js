import express from 'express'
import { authenticate } from '../middleware/authMiddleware.js'
import {
  createClassroom,
  getClassrooms,
  getClassroomById,
  updateClassroom,
  deleteClassroom,
  getAllStudents
} from '../controllers/classroomController.js'

const router = express.Router()

router.get('/', authenticate, getClassrooms)
router.get('/students/all', authenticate, getAllStudents)
router.get('/:id', authenticate, getClassroomById)
router.post('/', authenticate, createClassroom)
router.put('/:id', authenticate, updateClassroom)
router.delete('/:id', authenticate, deleteClassroom)

export default router
