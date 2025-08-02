import React from 'react';
import Dashboard from './components/Dashboard';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import StudentDetail from './components/StudentDetail';
import AddStudent from './components/AddStudents';
import EditStudent from './components/EditStudent';

const App = () => {
  return (
    <Router>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container-fluid">
          {/* Brand */}
          <Link className="navbar-brand" to="/">Student Information System</Link>

          {/* Toggler button for mobile */}
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Collapsible links */}
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <Link className="nav-link" to="./">Dashboard</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/students/new">Add New Student</Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mt-4">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/students/new" element={<AddStudent />} />
          <Route path="/students/:id" element={<StudentDetail />} />
          <Route path="/edit/:id" element={<EditStudent />} />

        </Routes>
      </main>

      {/* Footer */}
      <footer className="text-center mt-5 mb-3 text-muted">
        <small>&copy; {new Date().getFullYear()} School Name</small>
      </footer>
    </Router>
  );
};

export default App;