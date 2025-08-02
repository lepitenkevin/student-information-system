const db = require('../config/db');
const path = require('path');
const fs = require('fs');

exports.getAll = async (req, res) => {
  try {
    const data = await db.query("SELECT * FROM student_details");
    res.json(data);
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.create = async (req, res) => {
  const { name, email, age, gender } = req.body;
  const profilePic = req.file?.filename || null;
  try {
    await db.query(
      'INSERT INTO student_details (name, email, age, gender, profile) VALUES (?, ?, ?, ?, ?)',
      [name, email, age, gender, profilePic]
    );
    res.json({ message: 'Student added successfully' });
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.getOne = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM student_details WHERE id = ?", [req.params.id]);
    if (result.length === 0) return res.status(404).json("Student not found");
    res.json(result[0]);
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.update = async (req, res) => {
  const { id } = req.params;
  const { name, email, age, gender } = req.body;

  try {
    const rows = await db.query("SELECT * FROM student_details WHERE id = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Student not found' });

    const oldImage = rows[0].profile;
    let newImage = oldImage;

    if (req.file) {
      newImage = req.file.filename;
      const oldImagePath = path.join(__dirname, '../uploads', oldImage);
      if (oldImage && fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
    }

    await db.query(
      'UPDATE student_details SET name = ?, email = ?, age = ?, gender = ?, profile = ? WHERE id = ?',
      [name, email, age, gender, newImage, id]
    );

    res.json({ message: 'Student updated successfully' });
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.remove = async (req, res) => {
  try {
    const data = await db.query("SELECT profile FROM student_details WHERE id = ?", [req.params.id]);
    if (data.length > 0) {
      const image = data[0].profile;
      const imagePath = path.join(__dirname, '../uploads', image);
      if (image && fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }
    await db.query("DELETE FROM student_details WHERE id = ?", [req.params.id]);
    res.json("Student deleted successfully");
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.search = async (req, res) => {
  try {
    const search = req.query.name || '';
    const data = await db.query("SELECT * FROM student_details WHERE name LIKE ?", [`%${search}%`]);
    res.json(data);
  } catch (err) {
    res.status(500).json(err);
  }
};
