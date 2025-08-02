import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const StudentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:8081/students/${id}`)
      .then(res => setStudent(res.data))
      .catch(err => console.error(err));
  }, [id]);

  const handleDelete = () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this student?");
    if (!confirmDelete) return;

    axios.delete(`http://localhost:8081/students/${id}`)
      .then(() => {
        alert("Student deleted successfully.");
        navigate('/');
      })
      .catch(err => {
        console.error(err);
        alert("Failed to delete student.");
      });
  };

  if (!student) return <div className="text-center mt-5">Loading...</div>;

  return (
    <div className="container mt-4">
      <Link to="/" className="btn btn-secondary mb-3">← Back</Link>
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Student Details</h4>
          <div>
            <Link to={`/edit/${student.id}`} className="btn btn-primary btn-sm me-2">Edit</Link>
            <button className="btn btn-danger btn-sm" onClick={handleDelete}>Delete</button>
          </div>
        </div>
        <div className="card-body">
        {student.profile && (
          <img
            src={`http://localhost:8081/uploads/${student.profile}`}
            alt="Profile"
            className="img-thumbnail mb-3"
            style={{ maxWidth: '200px' }}
          />
        )}

          <p><strong>Name:</strong> {student.name}</p>
          <p><strong>Email:</strong> {student.email}</p>
          <p><strong>Age:</strong> {student.age}</p>
          <p><strong>Gender:</strong> {student.gender}</p>
        </div>
      </div>
    </div>
  );
};

export default StudentDetail;
