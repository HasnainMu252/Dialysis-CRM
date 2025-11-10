import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import "bootstrap/dist/css/bootstrap.min.css";

const PatientDetails = () => {
  const { id } = useParams(); // 👈 MongoDB _id from URL
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const res = await fetch(`http://localhost:4000/api/patients/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || "Patient not found");
        }

        const data = await res.json();
        setPatient(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [id, token]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container text-center mt-5">
          <h5 className="text-muted">Loading patient details...</h5>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !patient) {
    return (
      <>
        <Navbar />
        <div className="container text-center mt-5">
          <h3 className="text-danger">{error || "Patient not found"}</h3>
          <button
            className="btn btn-outline-secondary mt-3"
            onClick={() => navigate(-1)}
          >
            <i className="bi bi-arrow-left"></i> Back
          </button>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mt-5 p-4">
        <button
          className="btn btn-outline-secondary mb-3"
          onClick={() => navigate(-1)}
        >
          <i className="bi bi-arrow-left"></i> Back
        </button>

        <h2 className="fw-bold mb-4">
          {`${patient.firstName} ${patient.lastName}`}
        </h2>

        {/* 🧍 Personal Info */}
        <div className="card mb-3 shadow-sm">
          <div className="card-header bg-success text-white fw-bold">
            Personal Information
          </div>
          <div className="card-body">
            <p><strong>MRN:</strong> {patient.mrn}</p>
            <p><strong>DOB:</strong> {patient.dob?.split("T")[0]}</p>
            <p><strong>Gender:</strong> {patient.gender}</p>
            <p><strong>Phone:</strong> {patient.contact || patient.phone}</p>
            <p><strong>Email:</strong> {patient.email}</p>
            <p><strong>Address:</strong> {patient.address}</p>
          </div>
        </div>

        {/* 💳 Insurance Info */}
        {patient.insurance && (
          <div className="card mb-3 shadow-sm">
            <div className="card-header bg-primary text-white fw-bold">
              Insurance Information
            </div>
            <div className="card-body">
              <p><strong>Provider:</strong> {patient.insurance.provider}</p>
              <p><strong>Member ID:</strong> {patient.insurance.memberId}</p>
              <p><strong>Group Number:</strong> {patient.insurance.groupNumber}</p>
            </div>
          </div>
        )}

        {/* 💉 Dialysis Info */}
        {patient.dialysis && (
          <div className="card shadow-sm">
            <div className="card-header bg-info text-white fw-bold">
              Dialysis Information
            </div>
            <div className="card-body">
              <p><strong>Modality:</strong> {patient.dialysis.modality}</p>
              <p>
                <strong>Schedule:</strong>{" "}
                {patient.dialysis.scheduleDays?.join(", ")}
              </p>
              <p><strong>Shift:</strong> {patient.dialysis.shift}</p>
              <p><strong>Status:</strong> {patient.status}</p>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default PatientDetails;
