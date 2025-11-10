import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { Table, Button, Modal, Form } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../styles/global.css";
import { mongooseDateTransform } from "../././../utils/mongooseTransform";

const NurseDashboard = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [selectedScheduleId, setSelectedScheduleId] = useState(null);

  const token = localStorage.getItem("token");

  // 🩺 Fetch all schedules for nurse view
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/schedules", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setSchedules(Array.isArray(data) ? data : []);
        console.log(schedules)
      } catch (err) {
        console.error("Error fetching schedules:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, [token]);

  // 🟢 Update schedule status (Completed / In Progress)
  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await fetch(`http://localhost:4000/api/schedules/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (res.ok) {
        setSchedules((prev) =>
          prev.map((s) => (s._id === id ? { ...s, status: newStatus } : s))
        );
        alert(`✅ Status updated to "${newStatus}"`);
      } else {
        alert(data.message || "Error updating status");
      }
    } catch (err) {
      console.error("Error updating schedule:", err);
    }
  };

  // ❌ Handle cancel request (show modal)
  const handleCancelRequest = (id) => {
    setSelectedScheduleId(id);
    setCancelReason("");
    setShowCancelModal(true);
  };

  // ✅ Submit cancel request with message
  const submitCancelRequest = async () => {
    if (!cancelReason.trim()) {
      alert("Please provide a reason for cancellation.");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:4000/api/schedules/${selectedScheduleId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: "Cancel Requested",
            message: cancelReason,
          }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        setSchedules((prev) =>
          prev.map((s) =>
            s._id === selectedScheduleId
              ? { ...s, status: "Cancel Requested", message: cancelReason }
              : s
          )
        );
        alert("🟠 Cancel request sent to admin.");
      } else {
        alert(data.message || "Error sending cancel request.");
      }
    } catch (err) {
      console.error("Cancel request error:", err);
    } finally {
      setShowCancelModal(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container py-5 text-center">
          <h5 className="text-muted">Loading schedules...</h5>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mt-5 p-4">
        <h2 className="fw-bold mb-4">Nurse Dashboard</h2>
        <p className="text-muted">Manage dialysis appointments and update statuses.</p>

        <Table bordered hover responsive className="shadow-sm rounded">
          <thead className="table-info text-center">
            <tr>
              <th>#</th>
              <th>Patient</th>
              <th>Bed</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody className="text-center align-middle">
            {schedules.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-muted">
                  No schedules available.
                </td>
              </tr>
            ) : (
              schedules.map((s, index) => (
                <tr key={s._id}>
                  <td>{index + 1}</td>
                  <td>{s.patient?.firstName || "N/A"}</td>
                  <td>{s.bed?.name || "No Bed Assigned"}</td>
                  <td>{mongooseDateTransform(s.date)}</td>
                  <td>
                    {s.startTime} - {s.endTime}
                  </td>
                  <td>
                    <span
                      className={`fw-semibold ${s.status === "Completed"
                          ? "text-success"
                          : s.status === "In Progress"
                            ? "text-primary"
                            : s.status === "Cancel Requested"
                              ? "text-warning"
                              : "text-secondary"
                        }`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td>
                    <div className="d-flex justify-content-center gap-2">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleStatusChange(s._id, "In Progress")}
                      >
                        In Progress
                      </Button>
                      <Button
                        variant="outline-success"
                        size="sm"
                        onClick={() => handleStatusChange(s._id, "Completed")}
                      >
                        Complete
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleCancelRequest(s._id)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      {/* 🟠 Cancel Modal */}
      <Modal
        show={showCancelModal}
        onHide={() => setShowCancelModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Cancel Appointment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Reason for Cancellation</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Enter reason (e.g., patient no-show, machine issue...)"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
            Close
          </Button>
          <Button variant="danger" onClick={submitCancelRequest}>
            Send Request
          </Button>
        </Modal.Footer>
      </Modal>

      <Footer />
    </>
  );
};

export default NurseDashboard;
