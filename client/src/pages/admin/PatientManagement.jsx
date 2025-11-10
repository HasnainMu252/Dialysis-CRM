import React, { useState, useEffect } from "react";
import "../../styles/PatientTable.css";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import PatientTable from "../../components/PatientTable";
import AddPatientModal from "../../components/AddPatientModal";
import EditPatientModal from "../../components/EditPatientModal";

const PatientManagement = () => {
  const [patients, setPatients] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const token = localStorage.getItem("token");

  // 🧠 Fetch all patients from backend
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/patients", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (Array.isArray(data)) setPatients(data);
      } catch (err) {
        console.error("Error loading patients:", err);
      }
    };
    fetchPatients();
  }, [token]);

  // ➕ Add new patient
  const handleAddPatient = async (newPatient) => {
    try {
      const res = await fetch("http://localhost:4000/api/patients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newPatient),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message);
      setPatients((prev) => [...prev, data]);
      alert("✅ New patient added successfully!");
    } catch (err) {
      alert("❌ Failed to add patient: " + err.message);
    }
  };

  // ✏️ Edit existing patient
  const handleEdit = (patient) => {
    setSelectedPatient(patient);
    setShowEditModal(true);
  };

  // 💾 Save edited patient
  const handleSaveEdit = async (updatedPatient) => {
    try {
      const res = await fetch(
        `http://localhost:4000/api/patients/${updatedPatient._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedPatient),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setPatients((prev) =>
        prev.map((p) => (p._id === updatedPatient._id ? data : p))
      );
      alert("✅ Patient updated successfully!");
    } catch (err) {
      alert("❌ Failed to update: " + err.message);
    } finally {
      setShowEditModal(false);
      setSelectedPatient(null);
    }
  };

  // ❌ Delete patient
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this patient?")) return;
    try {
      const res = await fetch(`http://localhost:4000/api/patients/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setPatients((prev) => prev.filter((p) => p._id !== id));
      alert("🗑️ Patient deleted successfully.");
    } catch (err) {
      alert("❌ Error deleting patient: " + err.message);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container mt-5 p-4">
        {/* Header Section */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold page-title">Patient Management</h2>
            <p className="text-muted">Manage patient profiles and details</p>
          </div>
          <div>
            <button
              className="btn btn-teal me-2"
              onClick={() => setShowAddModal(true)}
            >
              + Add New Patient
            </button>
          </div>
        </div>

        {/* Patient Table */}
        <PatientTable
          patients={patients}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      </div>

      {/* Add Patient Modal */}
      <AddPatientModal
        show={showAddModal}
        handleClose={() => setShowAddModal(false)}
        onSave={handleAddPatient}
      />

      {/* Edit Patient Modal */}
      {selectedPatient && (
        <EditPatientModal
          show={showEditModal}
          handleClose={() => setShowEditModal(false)}
          patient={selectedPatient}
          handleSave={handleSaveEdit}
        />
      )}

      <Footer />
    </>
  );
};

export default PatientManagement;
