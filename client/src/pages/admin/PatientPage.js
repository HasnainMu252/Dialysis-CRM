import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Spinner, InputGroup } from "react-bootstrap";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import "../../styles/global.css";

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const patientsPerPage = 15;

  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    mrn: "",
    firstName: "",
    lastName: "",
    dob: "",
    gender: "",
    phone: "",
    email: "",
    address: "",
    insurance: { provider: "", memberId: "", groupNumber: "" },
    dialysis: { modality: "", scheduleDays: [], shift: "" },
    status: "Active",
  });

  // ---------------- FETCH PATIENTS ----------------
  const fetchPatients = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/patients", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setPatients(data);
      setFilteredPatients(data);
    } catch (err) {
      console.error("Error fetching patients:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // ---------------- SEARCH FUNCTION ----------------
  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const filtered = patients.filter(
      (p) =>
        p.firstName?.toLowerCase().includes(term) ||
        p.lastName?.toLowerCase().includes(term) ||
        p.mrn?.toString().includes(term) ||
        p.phone?.includes(term)
    );
    setFilteredPatients(filtered);
    setCurrentPage(1);
  }, [searchTerm, patients]);

  // ---------------- PAGINATION ----------------
  const indexOfLast = currentPage * patientsPerPage;
  const indexOfFirst = indexOfLast - patientsPerPage;
  const currentPatients = filteredPatients.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // ---------------- ADD NEW PATIENT ----------------
  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:4000/api/patients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to add patient");
      setShowModal(false);
      fetchPatients();
    } catch (err) {
      alert(err.message);
    }
  };

  // ---------------- UPDATE PATIENT ----------------
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(
        `http://localhost:4000/api/patients/${selectedId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        }
      );
      if (!res.ok) throw new Error("Failed to update patient");
      setShowModal(false);
      fetchPatients();
    } catch (err) {
      alert(err.message);
    }
  };

  // ---------------- DELETE PATIENT ----------------
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this patient?")) return;
    try {
      await fetch(`http://localhost:4000/api/patients/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPatients();
    } catch (err) {
      alert("Failed to delete");
    }
  };

  // ---------------- OPEN MODAL ----------------
  const openAddModal = () => {
    setEditMode(false);
    setForm({
      mrn: "",
      firstName: "",
      lastName: "",
      dob: "",
      gender: "",
      phone: "",
      email: "",
      address: "",
      insurance: { provider: "", memberId: "", groupNumber: "" },
      dialysis: { modality: "", scheduleDays: [], shift: "" },
      status: "Active",
    });
    setShowModal(true);
  };

  const openEditModal = (patient) => {
    setEditMode(true);
    setSelectedId(patient._id);
    setForm(patient);
    setShowModal(true);
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

        {/* Search Bar */}
        <InputGroup className="mb-4">
          <Form.Control
            type="text"
            placeholder="Search by name, MRN, or phone..."
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

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="text-muted mt-2">Loading patients...</p>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="text-center text-muted py-4">
            No patients found.
          </div>
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
                    <td>{indexOfFirst + index + 1}</td>
                    <td>{p.mrn}</td>
                    <td>{`${p.firstName} ${p.lastName}`}</td>
                    <td>{new Date(p.dob).toLocaleDateString("en-GB")}</td>
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
                        {p.status}
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
                        onClick={() => handleDelete(p._id)}
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
                  {Array.from({ length: totalPages }, (_, i) => (
                    <li
                      key={i}
                      className={`page-item ${
                        currentPage === i + 1 ? "active" : ""
                      }`}
                    >
                      <Button
                        className="page-link"
                        onClick={() => paginate(i + 1)}
                      >
                        {i + 1}
                      </Button>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </>
        )}
      </div>

      {/* Modal for Add / Edit */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editMode ? "Edit Patient" : "Add New Patient"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={editMode ? handleUpdate : handleAdd}>
            <div className="row">
              <div className="col-md-4 mb-3">
                <Form.Label>MRN</Form.Label>
                <Form.Control
                  type="text"
                  value={form.mrn}
                  onChange={(e) => setForm({ ...form, mrn: e.target.value })}
                  required
                />
              </div>
              <div className="col-md-4 mb-3">
                <Form.Label>First Name</Form.Label>
                <Form.Control
                  type="text"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  required
                />
              </div>
              <div className="col-md-4 mb-3">
                <Form.Label>Last Name</Form.Label>
                <Form.Control
                  type="text"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-4 mb-3">
                <Form.Label>Date of Birth</Form.Label>
                <Form.Control
                  type="date"
                  value={form.dob?.split("T")[0] || ""}
                  onChange={(e) => setForm({ ...form, dob: e.target.value })}
                />
              </div>
              <div className="col-md-4 mb-3">
                <Form.Label>Gender</Form.Label>
                <Form.Select
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                >
                  <option value="">Select</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                </Form.Select>
              </div>
              <div className="col-md-4 mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </Form.Select>
              </div>
            </div>

            <Form.Group className="mb-3">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </Form.Group>

            <Button variant="success" type="submit" className="mt-3 w-100">
              {editMode ? "Update Patient" : "Add Patient"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      <Footer />
    </>
  );
};

export default Patients;
