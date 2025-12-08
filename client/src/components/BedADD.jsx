import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";

 const BedAdd = ({ showModal, handleClose, bedCode, handleAction }) => {
  const [name, setName] = useState("");
  const [type, setType] = useState("ICU");
  const [status, setStatus] = useState("Available");
  const [location, setLocation] = useState({ ward: "", room: "", floor: "" });
  const [capacity, setCapacity] = useState(1);
  const [notes, setNotes] = useState("");

  // Fetch Bed Data for Edit
  useEffect(() => {
    if (bedCode) {
      const fetchBedData = async () => {
        try {
          const response = await fetch(
            `http://localhost:4000/api/beds/${bedCode}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          const data = await response.json();
          if (data.success) {
            const { name, type, status, location, capacity, notes } = data.bed;
            setName(name);
            setType(type);
            setStatus(status);
            setLocation(location);
            setCapacity(capacity);
            setNotes(notes);
          }
        } catch (error) {
          console.error("Error fetching bed data", error);
        }
      };
      fetchBedData();
    }
  }, [bedCode]);

 const handleSubmit = async (e) => {
  e.preventDefault();
  const bedData = {
    name,
    type,
    status,
    location,
    capacity,
    notes,
  };

  const url = bedCode
    ? `http://localhost:4000/api/beds/${bedCode}`
    : "http://localhost:4000/api/beds";
  const method = bedCode ? "PUT" : "POST"; // POST for adding, PUT for updating

  try {
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(bedData), // Make sure the payload is properly formatted
    });

    const data = await response.json(); // Parse response

    if (data.success) {
      handleAction(data.bed);
      handleClose(); // Close the modal
    } else {
      console.error("Failed to create bed:", data.message); // Log the error message
    }
  } catch (error) {
    console.error("Error adding or updating bed:", error); // Log any errors
  }
};

  const handleDelete = async () => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/beds/${bedCode}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        handleAction(null); // Remove the deleted bed from the UI
        handleClose();
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error("Error deleting bed:", error);
    }
  };

  return (
    <Modal show={showModal} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{bedCode ? "Update Bed" : "Add New Bed"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Bed Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter bed name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Type</Form.Label>
            <Form.Select
              value={type}
              onChange={(e) => setType(e.target.value)}
              required
            >
              <option value="ICU">ICU</option>
              <option value="General">General</option>
              <option value="Isolation">Isolation</option>
              <option value="Pediatric">Pediatric</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Status</Form.Label>
            <Form.Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              required
            >
              <option value="Available">Available</option>
              <option value="Busy">Busy</option>
              <option value="UnderMaintenance">Under Maintenance</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Location</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ward"
              value={location.ward}
              onChange={(e) => setLocation({ ...location, ward: e.target.value })}
              required
            />
            <Form.Control
              type="text"
              placeholder="Room"
              value={location.room}
              onChange={(e) => setLocation({ ...location, room: e.target.value })}
              className="mt-2"
              required
            />
            <Form.Control
              type="text"
              placeholder="Floor"
              value={location.floor}
              onChange={(e) => setLocation({ ...location, floor: e.target.value })}
              className="mt-2"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Capacity</Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter capacity"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Notes</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes"
            />
          </Form.Group>

          <div className="d-flex justify-content-between">
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
            <Button variant="primary" type="submit">
              {bedCode ? "Update Bed" : "Add Bed"}
            </Button>
            {bedCode && (
              <Button
                variant="danger"
                onClick={handleDelete}
                className="ms-2"
              >
                Delete Bed
              </Button>
            )}
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default BedAdd;
