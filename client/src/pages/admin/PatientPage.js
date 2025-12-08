// src/pages/Patients/Patients.jsx  (ya PatientPage.js – naam apne project ke mutabiq rakho)
import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Spinner,
  InputGroup,
  Form,
} from "react-bootstrap";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import "../../styles/global.css";
import AddPatientModal from "../../components/AddPatientModal"; // ⚠️ path apne folder structure ke hisaab se adjust karo

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const patientsPerPage = 15;

  const token = localStorage.getItem("token");

  // ------------ FETCH PATIENTS ------------
  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:4000/api/patients", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success && Array.isArray(data.patients)) {
        setPatients(data.patients);
        setFilteredPatients(data.patients);
      } else if (Array.isArray(data)) {
        // in case API directly returns array
        setPatients(data);
        setFilteredPatients(data);
      } else {
        setPatients([]);
        setFilteredPatients([]);
      }
    } catch (err) {
      console.error("Failed to fetch patients:", err);
      setPatients([]);
      setFilteredPatients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ------------ SEARCH (name + phone + MRN) ------------
  useEffect(() => {
    const term = searchTerm.toLowerCase();

    const filtered = patients.filter((p) => {
      const firstName = p.firstName?.toLowerCase() || "";
      const lastName = p.lastName?.toLowerCase() || "";
      const phone = p.phone || "";
      const mrn = p.mrn?.toLowerCase() || "";

      return (
        firstName.includes(term) ||
        lastName.includes(term) ||
        phone.includes(term) ||
        mrn.includes(term)
      );
    });

    setFilteredPatients(filtered);
    setCurrentPage(1);
  }, [searchTerm, patients]);

  // ------------ PAGINATION ------------
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = filteredPatients.slice(
    indexOfFirstPatient,
    indexOfLastPatient
  );

  // ------------ MODAL HANDLERS ------------
  const openAddModal = () => {
    setEditMode(false);
    setSelectedPatient(null);
    setShowModal(true);
  };

  const openEditModal = (patient) => {
    setEditMode(true);
    setSelectedPatient(patient); // MRN iss object me hai
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  // ------------ SAVE (ADD / EDIT) USING MRN ------------
  const handleSavePatient = async (formData) => {
    try {
      const isEdit = editMode && selectedPatient?.mrn;

      const url = isEdit
        ? `http://localhost:4000/api/patients/${selectedPatient.mrn}` // ✅ MRN based
        : "http://localhost:4000/api/patients";

      const method = isEdit ? "PUT" : "POST";

      const payload = {
        ...formData,
        dialysis: {
          ...formData.dialysis,
          scheduleDays: Array.isArray(formData.dialysis.scheduleDays)
            ? formData.dialysis.scheduleDays
            : [],
        },
      };

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok || json.success === false) {
        throw new Error(json.message || "Failed to save patient");
      }

      await fetchPatients();
      setShowModal(false);
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to save patient");
    }
  };

  // ------------ DELETE USING MRN ------------
  const handleDelete = async (mrn) => {
    if (!window.confirm("Are you sure you want to delete this patient?")) return;

    console.log("Deleting patient by MRN:", mrn);

    try {
      const res = await fetch(`http://localhost:4000/api/patients/${mrn}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok || json.success === false) {
        throw new Error(json.message || "Failed to delete patient");
      }

      await fetchPatients();
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to delete patient");
    }
  };

  return (
    <>
      <Navbar />

      <div className="container py-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="fw-bold">Patient Management</h3>
          <Button variant="primary" onClick={openAddModal}>
            + Add Patient
          </Button>
        </div>

        {/* Search */}
        <InputGroup className="mb-4">
          <Form.Control
            type="text"
            placeholder="Search by name, phone, or MRN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button
            variant="outline-secondary"
            onClick={() => setSearchTerm("")}
          >
            Clear
          </Button>
        </InputGroup>

        {/* Table / Loading / Empty states */}
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="text-muted mt-2">Loading patients...</p>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="text-center text-muted py-4">No patients found.</div>
        ) : (
          <>
            <Table bordered hover responsive className="shadow-sm rounded-3">
              <thead className="table-success text-center">
                <tr>
                  <th>#</th>
                  <th>MRN</th>
                  <th>Name</th>
                  <th>DOB</th>
                  <th>Gender</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className="text-center align-middle">
                {currentPatients.map((p, index) => (
                  <tr key={p._id}>
                    <td>{indexOfFirstPatient + index + 1}</td>
                    <td>{p.mrn || "-"}</td>
                    <td>{`${p.firstName} ${p.lastName}`}</td>
                    <td>
                      {p.dob
                        ? new Date(p.dob).toLocaleDateString("en-GB")
                        : "-"}
                    </td>
                    <td>{p.gender}</td>
                    <td>{p.phone}</td>
                    <td>{p.email}</td>
                    <td>
                      <span
                        className={`badge px-3 py-2 rounded-pill ${
                          p.status === "Active"
                            ? "bg-success text-white"
                            : "bg-secondary text-white"
                        }`}
                      >
                        {p.status || "Active"}
                      </span>
                    </td>
                    <td>
                      <Button
                        size="sm"
                        variant="outline-primary"
                        className="me-2"
                        onClick={() => openEditModal(p)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => handleDelete(p.mrn)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

            {/* Pagination */}
            <div className="d-flex justify-content-center mt-3">
              <nav>
                <ul className="pagination">
                  {Array.from(
                    {
                      length: Math.ceil(
                        filteredPatients.length / patientsPerPage
                      ),
                    },
                    (_, i) => (
                      <li key={i} className="page-item">
                        <Button
                          className="page-link"
                          onClick={() => paginate(i + 1)}
                        >
                          {i + 1}
                        </Button>
                      </li>
                    )
                  )}
                </ul>
              </nav>
            </div>
          </>
        )}
      </div>

      {/* Multi-step Add / Edit modal */}
      <AddPatientModal
        show={showModal}
        handleClose={handleCloseModal}
        onSave={handleSavePatient}
        editMode={editMode}
        patient={selectedPatient}
      />

      <Footer />
    </>
  );
};

export default Patients;
