import { pool } from '../config/database.js'
import { logger } from '../utils/logger.js'

export const createClassroom = async (req, res) => {
  try {
    // Chỉ role_id = 3 (instructor) được tạo
    const userRole = req.user?.role_id || req.user?.roleId || req.user?.role;
    if (Number(userRole) !== 3) {
      return res.status(403).json({
        success: false,
        message: 'Only instructors (role_id = 3) can create classrooms'
      });
    }

    const {
      name,
      certificate_id,
      capacity,
      status = 'draft',
      start_date,
      end_date
    } = req.body

    const instructor_id = req.user?.id || req.body.instructor_id;

    if (!name || !instructor_id || !certificate_id || !capacity || !start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      })
    }

    const [result] = await pool.query(
      `INSERT INTO classrooms 
       (name, instructor_id, certificate_id, capacity, status, start_date, end_date) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, instructor_id, certificate_id, capacity, status, start_date, end_date]
    )

    res.status(201).json({
      success: true,
      message: 'Classroom created successfully',
      data: {
        id: result.insertId,
        name,
        instructor_id,
        certificate_id,
        capacity,
        status,
        start_date,
        end_date
      }
    })
  } catch (error) {
    logger.error('Error creating classroom:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to create classroom',
      error: error.message
    })
  }
}

export const getClassrooms = async (req, res) => {
  try {
    const userRole = req.user?.role_id || req.user?.roleId || req.user?.role;
    let query = `SELECT c.*, u.name as instructor_name FROM classrooms c LEFT JOIN users u ON c.instructor_id = u.id`;
    let params = [];

    // Nếu là instructor thì chỉ thấy lớp của mình
    if (Number(userRole) === 3) {
      query += ` WHERE c.instructor_id = ?`;
      params.push(req.user.id);
    }

    query += ` ORDER BY c.created_at DESC`;

    const [rows] = await pool.query(query, params);
    // Count total students (role_id = 1) in the system
    const [countResult] = await pool.query('SELECT COUNT(*) as total FROM users WHERE role_id = 1');
    const totalStudents = countResult[0].total;

    // Retrieve counts per license type
    const [typeCounts] = await pool.query('SELECT license_type, COUNT(*) as cnt FROM users WHERE role_id = 1 GROUP BY license_type');
    const mapping = {};
    typeCounts.forEach(c => mapping[c.license_type] = c.cnt);

    // Calculate upcoming sessions
    let upcomingQuery = `SELECT COUNT(*) as upcoming FROM classrooms WHERE start_date > CURRENT_DATE`;
    let upcomingParams = [];
    if (Number(userRole) === 3) {
      upcomingQuery += ` AND instructor_id = ?`;
      upcomingParams.push(req.user.id);
    }
    const [upcomingResult] = await pool.query(upcomingQuery, upcomingParams);
    const upcomingSessions = upcomingResult[0].upcoming;

    const dataWithCounts = rows.map(row => {
      const type = Number(row.certificate_id) === 1 ? 'A1' : 'B1';
      return { ...row, student_count: mapping[type] || 0 };
    });

    res.json({
      success: true,
      data: dataWithCounts,
      totalStudents,
      upcomingSessions
    })
  } catch (error) {
    logger.error('Error fetching classrooms:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch classrooms' })
  }
}

export const updateClassroom = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, capacity, status, start_date, end_date } = req.body;

    // Check if the classroom exists and is owned by the instructor
    const [existing] = await pool.query('SELECT * FROM classrooms WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Classroom not found' });
    }

    const [result] = await pool.query(
      `UPDATE classrooms SET name = ?, capacity = ?, status = ?, start_date = ?, end_date = ? WHERE id = ?`,
      [name, capacity, status, start_date, end_date, id]
    );

    res.json({ success: true, message: 'Classroom updated successfully' });
  } catch (error) {
    logger.error('Error updating classroom:', error)
    res.status(500).json({ success: false, message: 'Failed to update classroom' });
  }
}

export const getClassroomById = async (req, res) => {
  try {
    const { id } = req.params;

    const [classRows] = await pool.query(
      `SELECT c.*, u.name as instructor_name, cert.code as license_type
       FROM classrooms c 
       LEFT JOIN users u ON c.instructor_id = u.id
       LEFT JOIN certificates cert ON c.certificate_id = cert.id
       WHERE c.id = ?`,
      [id]
    );

    if (classRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Classroom not found' });
    }

    const classroom = classRows[0];

    // Fetch students matching the license_type of the classroom
    // The requirement says: students with license_type = A1 belong to A1 class
    const [students] = await pool.query(
      `SELECT id, name, email, phone, avatar_url, created_at 
       FROM users 
       WHERE role_id = 1 AND license_type = ?`,
      [classroom.license_type]
    );

    res.json({
      success: true,
      data: {
        ...classroom,
        students
      }
    });

  } catch (error) {
    logger.error('Error fetching classroom by id:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch classroom metadata' });
  }
}

export const deleteClassroom = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query(`DELETE FROM classrooms WHERE id = ?`, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Classroom not found' });
    }

    res.json({ success: true, message: 'Classroom deleted successfully' });
  } catch (error) {
    logger.error('Error deleting classroom:', error)
    res.status(500).json({ success: false, message: 'Failed to delete classroom' });
  }
}

export const getAllStudents = async (req, res) => {
  try {
    const [students] = await pool.query(
      `SELECT id, name, email, phone, license_type, created_at 
       FROM users 
       WHERE role_id = 1 
       ORDER BY created_at DESC`
    );

    res.json({
      success: true,
      data: students
    });
  } catch (error) {
    logger.error('Error fetching all students:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch all students' });
  }
}
