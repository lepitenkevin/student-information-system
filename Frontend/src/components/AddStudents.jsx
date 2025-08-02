import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';

const AddStudent = () => {
  const [uploadMethod, setUploadMethod] = useState('file');
  const [form, setForm] = useState({
    name: '',
    email: '',
    age: '',
    gender: '',
  });
  const [profilePic, setProfilePic] = useState(null);
  const [students, setStudents] = useState([]);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const webcamRef = useRef(null);

  useEffect(() => {
    axios.get('http://localhost:8081/students')
      .then(res => setStudents(res.data))
      .catch(err => console.error('Error fetching students:', err));
  }, []);

  const validate = () => {
    const errors = {};
    if (!form.name.trim()) errors.name = 'Name is required';
    if (!form.email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errors.email = 'Email is invalid';
    if (!form.age) errors.age = 'Age is required';
    if (!form.gender) errors.gender = 'Gender is required';
    return errors;
  };

  const handleCapture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    const byteString = atob(imageSrc.split(',')[1]);
    const mimeString = imageSrc.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: mimeString });
    const file = new File([blob], 'webcam-image.png', { type: mimeString });
    setProfilePic(file);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const existing = students.find(student => student.email === form.email);
    if (existing) {
      setErrors({ email: 'Email already exists' });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('email', form.email);
      formData.append('age', form.age);
      formData.append('gender', form.gender);
      if (profilePic) formData.append('profilePic', profilePic);
      await axios.post('http://localhost:8081/students', formData);
      setSuccess('Student added successfully!');
      setForm({ name: '', email: '', age: '', gender: '' });
      setProfilePic(null);
      setTimeout(() => navigate('/'), 1000);
    } catch (err) {
      console.error(err);
      alert('Error adding student');
    }
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleFileChange = e => {
    setProfilePic(e.target.files[0]);
  };

  return (
    <div className="card shadow p-4">
      <h3 className="mb-4">Add New Student</h3>
      {success && <div className="alert alert-success">{success}</div>}
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="mb-3">
          <label>Name</label>
          <input
            type="text"
            name="name"
            className={`form-control ${errors.name && 'is-invalid'}`}
            value={form.name}
            onChange={handleChange}
          />
          {errors.name && <div className="invalid-feedback">{errors.name}</div>}
        </div>

        <div className="mb-3">
          <label>Email</label>
          <input
            type="email"
            name="email"
            className={`form-control ${errors.email && 'is-invalid'}`}
            value={form.email}
            onChange={handleChange}
          />
          {errors.email && <div className="invalid-feedback">{errors.email}</div>}
        </div>

        <div className="mb-3">
          <label>Age</label>
          <input
            type="number"
            name="age"
            className={`form-control ${errors.age && 'is-invalid'}`}
            value={form.age}
            onChange={handleChange}
          />
          {errors.age && <div className="invalid-feedback">{errors.age}</div>}
        </div>

        <div className="mb-3">
          <label>Gender</label>
          <select
            name="gender"
            className={`form-control ${errors.gender && 'is-invalid'}`}
            value={form.gender}
            onChange={handleChange}
          >
            <option value="">-- Select Gender --</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
          {errors.gender && <div className="invalid-feedback">{errors.gender}</div>}
        </div>

        <div className="mb-3">
          <label>Profile Picture</label>
          <div className="mb-2">
            <div className="form-check form-check-inline">
              <input
                className="form-check-input"
                type="radio"
                name="uploadMethod"
                id="uploadFile"
                value="file"
                checked={uploadMethod === 'file'}
                onChange={() => setUploadMethod('file')}
              />
              <label className="form-check-label" htmlFor="uploadFile">Upload File</label>
            </div>
            <div className="form-check form-check-inline">
              <input
                className="form-check-input"
                type="radio"
                name="uploadMethod"
                id="uploadCamera"
                value="camera"
                checked={uploadMethod === 'camera'}
                onChange={() => setUploadMethod('camera')}
              />
              <label className="form-check-label" htmlFor="uploadCamera">Use Camera</label>
            </div>
          </div>

          {uploadMethod === 'file' && (
            <input
              type="file"
              name="profilePic"
              accept="image/*"
              className="form-control"
              onChange={handleFileChange}
            />
          )}

          {uploadMethod === 'camera' && (
            <div>
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/png"
                width={250}
                videoConstraints={{ width: 250, facingMode: 'user' }}
              />
              <button type="button" className="btn btn-secondary mt-2" onClick={handleCapture}>
                Capture
              </button>
            </div>
          )}
        </div>

        <button type="submit" className="btn btn-primary">Add Student</button>
      </form>
    </div>
  );
};

export default AddStudent;
