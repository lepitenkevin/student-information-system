const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "students"
});

// Promisify db.query for async/await usage
const util = require('util');
db.query = util.promisify(db.query);

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = uuidv4() + ext;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// Routes

// Home
app.get('/', (req, res) => {
  return res.json("From Backend Site");
});

// Get all students
app.get('/students', async (req, res) => {
  try {
    const data = await db.query("SELECT * FROM student_details");
    res.json(data);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Add student
app.post('/students', upload.single('profilePic'), async (req, res) => {
  const { name, email, age, gender } = req.body;
  const profilePic = req.file ? req.file.filename : null;

  try {
    await db.query(
      'INSERT INTO student_details (name, email, age, gender, profile) VALUES (?, ?, ?, ?, ?)',
      [name, email, age, gender, profilePic]
    );
    res.json({ message: 'Student added successfully' });
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get single student
app.get('/students/:id', async (req, res) => {
  try {
    const data = await db.query("SELECT * FROM student_details WHERE id = ?", [req.params.id]);
    if (data.length === 0) return res.status(404).json("Student not found");
    res.json(data[0]);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Update student
app.put('/students/:id', upload.single('profile'), async (req, res) => {
  const { id } = req.params;
  const { name, email, age, gender } = req.body;

  try {
    const rows = await db.query('SELECT * FROM student_details WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Student not found' });

    const oldImage = rows[0].profile;
    let newImage = oldImage;

    if (req.file) {
      newImage = req.file.filename;
      const oldImagePath = path.join(__dirname, 'uploads', oldImage);
      if (oldImage && fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    await db.query(
      'UPDATE student_details SET name = ?, email = ?, age = ?, gender = ?, profile = ? WHERE id = ?',
      [name, email, age, gender, newImage, id]
    );

    res.json({ message: 'Student updated successfully.' });
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete student
app.delete('/students/:id', async (req, res) => {
  try {
    const data = await db.query("SELECT profile FROM student_details WHERE id = ?", [req.params.id]);
    if (data.length > 0) {
      const image = data[0].profile;
      const imagePath = path.join(__dirname, 'uploads', image);
      if (image && fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await db.query("DELETE FROM student_details WHERE id = ?", [req.params.id]);
    res.json("Student deleted successfully");
  } catch (err) {
    res.status(500).json(err);
  }
});

// Search students
app.get('/students/search', async (req, res) => {
  try {
    const search = req.query.name;
    const data = await db.query("SELECT * FROM student_details WHERE name LIKE ?", [`%${search}%`]);
    res.json(data);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Start server
app.listen(8081, () => {
  console.log("Server running on port 8081");
});
