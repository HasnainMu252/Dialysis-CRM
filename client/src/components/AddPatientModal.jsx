// src/pages/Patients/AddPatientModal.jsx
import React, { useState, useEffect } from "react";
import { Modal, Button, Form, ProgressBar } from "react-bootstrap";

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const AddPatientModal = ({ show, handleClose, onSave, editMode, patient }) => {
  const totalSteps = 3;
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    gender: "",
    phone: "",
    email: "",
    address: "",
    dialysis: { modality: "", scheduleDays: [], shift: "" },
    status: "Active",
  });

  // reset step when modal opens
  useEffect(() => {
    if (show) setStep(1);
  }, [show]);

  // fill / reset form
  useEffect(() => {
    if (editMode && patient) {
      setFormData({
        firstName: patient.firstName || "",
        lastName: patient.lastName || "",
        dob: patient.dob ? patient.dob.slice(0, 10) : "", // YYYY-MM-DD
        gender: patient.gender || "",
        phone: patient.phone || "",
        email: patient.email || "",
        address: patient.address || "",
        dialysis: {
          modality: patient.dialysis?.modality || "",
          shift: patient.dialysis?.shift || "",
          scheduleDays: Array.isArray(patient.dialysis?.scheduleDays)
            ? patient.dialysis.scheduleDays
            : [],
        },
        status: patient.status || "Active",
      });
    } else if (!editMode) {
      setFormData({
        firstName: "",
        lastName: "",
        dob: "",
        gender: "",
        phone: "",
        email: "",
        address: "",
        dialysis: { modality: "", scheduleDays: [], shift: "" },
        status: "Active",
      });
    }
  }, [editMode, patient, show]);

  // generic handler for top-level fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // handler for dialysis fields (modality/shift)
  const handleDialysisChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      dialysis: {
        ...prev.dialysis,
        [name]: value,
      },
    }));
  };

  // check / uncheck weekday
  const handleScheduleDayToggle = (e) => {
    const { value, checked } = e.target; // value e.g. "Mon"
    setFormData((prev) => {
      const currentDays = Array.isArray(prev.dialysis.scheduleDays)
        ? prev.dialysis.scheduleDays
        : [];

      return {
        ...prev,
        dialysis: {
          ...prev.dialysis,
          scheduleDays: checked
            ? [...currentDays, value].filter(
                (v, i, arr) => arr.indexOf(v) === i
              ) // unique
            : currentDays.filter((d) => d !== value),
        },
      };
    });
  };

  const handleNext = () => {
    if (step < totalSteps) setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep((prev) => prev - 1);
  };

  const handleSubmit = () => {
    const payload = {
      ...formData,
      dialysis: {
        ...formData.dialysis,
        scheduleDays: Array.isArray(formData.dialysis.scheduleDays)
          ? formData.dialysis.scheduleDays
          : [],
      },
    };
    onSave(payload); // parent (Patients.jsx) POST / PUT karega
  };

  const stepTitles = [
    "Personal Information",
    "Dialysis Information",
    "Additional Information",
  ];

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{editMode ? "Edit Patient" : "Add New Patient"}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="text-center mb-4">
          <p className="fw-semibold mb-1 text-muted">
            Step {step} of {totalSteps} — {stepTitles[step - 1]}
          </p>
          <ProgressBar
            now={(step / totalSteps) * 100}
            variant="success"
            className="rounded-pill"
          />
        </div>

        <Form>
          {/* STEP 1: PERSONAL INFO */}
          {step === 1 && (
            <>
              <h5 className="text-success mb-3">Personal Information</h5>
              <div className="row g-3">
                <div className="col-md-6">
                  <Form.Label>First Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Enter first name"
                    required
                  />
                </div>
                <div className="col-md-6">
                  <Form.Label>Last Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Enter last name"
                    required
                  />
                </div>
                <div className="col-md-6">
                  <Form.Label>Date of Birth</Form.Label>
                  <Form.Control
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <Form.Label>Gender</Form.Label>
                  <Form.Select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </Form.Select>
                </div>
                <div className="col-md-6">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    required
                  />
                </div>
                <div className="col-md-12">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="example@email.com"
                  />
                </div>
                <div className="col-md-12">
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter address"
                  />
                </div>
              </div>
            </>
          )}

          {/* STEP 2: DIALYSIS INFO */}
          {step === 2 && (
            <>
              <h5 className="text-success mb-3">Dialysis Information</h5>
              <div className="row g-3">
                <div className="col-md-6">
                  <Form.Label>Modality</Form.Label>
                  <Form.Select
                    name="modality"
                    value={formData.dialysis.modality}
                    onChange={handleDialysisChange}
                    required
                  >
                    <option value="">Select</option>
                    <option value="HD">HD (Hemodialysis)</option>
                    <option value="PD">PD (Peritoneal Dialysis)</option>
                  </Form.Select>
                </div>
                <div className="col-md-6">
                  <Form.Label>Shift</Form.Label>
                  <Form.Select
                    name="shift"
                    value={formData.dialysis.shift}
                    onChange={handleDialysisChange}
                    required
                  >
                    <option value="">Select</option>
                    <option value="Morning">Morning</option>
                    <option value="Evening">Evening</option>
                    <option value="Night">Night</option>
                  </Form.Select>
                </div>
                <div className="col-md-12">
                  <Form.Label>Schedule Days</Form.Label>
                  <div className="d-flex flex-wrap gap-3">
                    {WEEK_DAYS.map((day) => (
                      <Form.Check
                        key={day}
                        type="checkbox"
                        label={day}
                        value={day}
                        checked={formData.dialysis.scheduleDays.includes(day)}
                        onChange={handleScheduleDayToggle}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* STEP 3: ADDITIONAL INFO */}
          {step === 3 && (
            <>
              <h5 className="text-success mb-3">Additional Information</h5>
              <div className="row g-3">
                <div className="col-md-12">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </Form.Select>
                </div>
              </div>
            </>
          )}
        </Form>
      </Modal.Body>

      <Modal.Footer>
        {step > 1 && (
          <Button variant="outline-secondary" onClick={handleBack}>
            Back
          </Button>
        )}
        {step < totalSteps ? (
          <Button variant="success" onClick={handleNext}>
            Next
          </Button>
        ) : (
          <Button variant="success" onClick={handleSubmit}>
            Save Patient
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default AddPatientModal;
