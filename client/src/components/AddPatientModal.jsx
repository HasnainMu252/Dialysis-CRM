import React, { useState } from "react";
import { Modal, Button, Form, ProgressBar } from "react-bootstrap";
import "../styles/AddPatientModal.css"; // optional for custom tweaks

const AddPatientModal = ({ show, handleClose, onSave }) => {
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  const [formData, setFormData] = useState({
    mrn: "",
    firstName: "",
    lastName: "",
    dob: "",
    gender: "",
    phone: "",
    email: "",
    address: "",
    insuranceProvider: "",
    memberId: "",
    groupNumber: "",
    modality: "",
    scheduleDays: [],
    shift: "",
    status: "Active",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    console.log("New Patient Data:", formData);
    onSave(formData);
    handleClose();
  };

  // Step headings for display
  const stepTitles = ["Personal Information", "Insurance Information", "Dialysis Information"];

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton className="border-0">
        <Modal.Title className="fw-bold text-success">
          Add New Patient
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* Step Indicator */}
        <div className="text-center mb-4">
          <p className="fw-semibold mb-1 text-muted">
            Step {step} of {totalSteps} — {stepTitles[step - 1]}
          </p>
          <ProgressBar now={(step / totalSteps) * 100} variant="success" className="rounded-pill" />
        </div>

        {/* Form Content */}
        <Form>
          {step === 1 && (
            <>
              <h5 className="text-success mb-3">Personal Information</h5>
              <div className="row g-3">
                <div className="col-md-6">
                  <Form.Label>MRN</Form.Label>
                  <Form.Control
                    type="text"
                    name="mrn"
                    value={formData.mrn}
                    onChange={handleChange}
                    placeholder="Enter MRN"
                    required
                  />
                </div>
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
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                  </Form.Select>
                </div>
                <div className="col-md-6">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="923XXXXXXXXX"
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

          {step === 2 && (
            <>
              <h5 className="text-success mb-3">Insurance Information</h5>
              <div className="row g-3">
                <div className="col-md-6">
                  <Form.Label>Insurance Provider</Form.Label>
                  <Form.Control
                    type="text"
                    name="insuranceProvider"
                    value={formData.insuranceProvider}
                    onChange={handleChange}
                    placeholder="e.g. BlueCross"
                  />
                </div>
                <div className="col-md-6">
                  <Form.Label>Member ID</Form.Label>
                  <Form.Control
                    type="text"
                    name="memberId"
                    value={formData.memberId}
                    onChange={handleChange}
                    placeholder="e.g. BC12345"
                  />
                </div>
                <div className="col-md-6">
                  <Form.Label>Group Number</Form.Label>
                  <Form.Control
                    type="text"
                    name="groupNumber"
                    value={formData.groupNumber}
                    onChange={handleChange}
                    placeholder="e.g. GRP67890"
                  />
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h5 className="text-success mb-3">Dialysis Information</h5>
              <div className="row g-3">
                <div className="col-md-6">
                  <Form.Label>Modality</Form.Label>
                  <Form.Select
                    name="modality"
                    value={formData.modality}
                    onChange={handleChange}
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
                    value={formData.shift}
                    onChange={handleChange}
                  >
                    <option value="">Select</option>
                    <option value="Morning">Morning</option>
                    <option value="Evening">Evening</option>
                    <option value="Night">Night</option>
                  </Form.Select>
                </div>
                <div className="col-md-12">
                  <Form.Label>Schedule Days</Form.Label>
                  <Form.Control
                    type="text"
                    name="scheduleDays"
                    value={formData.scheduleDays}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        scheduleDays: e.target.value.split(","),
                      })
                    }
                    placeholder="Enter days separated by commas (Mon, Wed, Fri)"
                  />
                </div>
              </div>
            </>
          )}
        </Form>
      </Modal.Body>

      {/* Footer Buttons */}
      <Modal.Footer className="border-0">
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
