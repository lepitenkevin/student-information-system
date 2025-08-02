import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Webcam from 'react-webcam';

const EditStudent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const webcamRef = useRef(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    age: '',
    gender: '',
    profile: null,
  });

  const [uploadMethod, setUploadMethod] = useState('file');
  const [preview, setPreview] = useState(null);
  const [newImage, setNewImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');

  useEffect(() => {
    axios.get(`http://localhost:8081/students/${id}`)
      .then(res => {
        setForm(res.data);
        setPreview(`http://localhost:8081/uploads/${res.data.profile}`);
      })
      .catch(err => {
        console.error(err);
        alert("Failed to fetch student data.");
      });
  }, [id]);

  const validate = () => {
    const errors = {};
    if (!form.name.trim()) errors.name = 'Name is required';
    if (!form.email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errors.email = 'Invalid email format';
    if (!form.age || isNaN(form.age)) errors.age = 'Valid age is required';
    if (!form.gender) errors.gender = 'Gender is required';
    return errors;
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = e => {
    const file = e.target.files[0];
    setNewImage(file);
    setPreview(URL.createObjectURL(file));
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

    setNewImage(file);
    setPreview(imageSrc);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('email', form.email);
    formData.append('age', form.age);
    formData.append('gender', form.gender);
    if (newImage) formData.append('profile', newImage);

    try {
      await axios.put(`http://localhost:8081/students/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccess('Student updated successfully!');
      setTimeout(() => navigate(`/students/${id}`), 1000);
    } catch (err) {
      if (err.response?.data === 'Email already exists') {
        setErrors({ email: 'Email already exists' });
      } else {
        alert('Failed to update student.');
      }
    }
  };

  return (
    <div className="container mt-4">
      <Link to={`/students/${id}`} className="btn btn-secondary mb-3">← Back</Link>
      <div className="card">
        <div className="card-header">
          <h4>Edit Student</h4>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            {success && <div className="alert alert-success">{success}</div>}

            <div className="mb-3">
              <label>Name</label>
              <input type="text" className={`form-control ${errors.name && 'is-invalid'}`} name="name" value={form.name} onChange={handleChange} />
              {errors.name && <div className="invalid-feedback">{errors.name}</div>}
            </div>

            <div className="mb-3">
              <label>Email</label>
              <input type="email" className={`form-control ${errors.email && 'is-invalid'}`} name="email" value={form.email} onChange={handleChange} />
              {errors.email && <div className="invalid-feedback">{errors.email}</div>}
            </div>

            <div className="mb-3">
              <label>Age</label>
              <input type="number" className={`form-control ${errors.age && 'is-invalid'}`} name="age" value={form.age} onChange={handleChange} />
              {errors.age && <div className="invalid-feedback">{errors.age}</div>}
            </div>

            <div className="mb-3">
              <label>Gender</label>
              <select className={`form-select ${errors.gender && 'is-invalid'}`} name="gender" value={form.gender} onChange={handleChange}>
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
                    id="uploadFile"
                    name="uploadMethod"
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
                    id="useCamera"
                    name="uploadMethod"
                    value="camera"
                    checked={uploadMethod === 'camera'}
                    onChange={() => setUploadMethod('camera')}
                  />
                  <label className="form-check-label" htmlFor="useCamera">Use Camera</label>
                </div>
              </div>

              {uploadMethod === 'file' && (
                <input
                  type="file"
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
                  <div className="mt-2">
                    <button type="button" className="btn btn-secondary me-2" onClick={handleCapture}>
                      Capture
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-danger"
                      onClick={() => {
                        setNewImage(null);
                        setPreview(null);
                      }}
                    >
                      Retake
                    </button>
                  </div>
                </div>
              )}

              {preview && (
                <div className="mt-3">
                  <img src={preview} alt="Preview" width={150} />
                </div>
              )}
            </div>

            <button type="submit" className="btn btn-primary">Update</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditStudent;
