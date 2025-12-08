import React, { useState, useEffect, useCallback } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import { Button, Modal, Form, Spinner } from "react-bootstrap";
import { format } from "date-fns";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const localizer = momentLocalizer(moment);

const ScheduleCalendar = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [patients, setPatients] = useState([]);
  const [beds, setBeds] = useState([]);
  const [form, setForm] = useState({
    patient: "",
    bed: "",
    date: "",
    startTime: "",
    endTime: "",
  });
  const token = localStorage.getItem("token");

  // Fetch patients
  const fetchPatients = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/patients", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setPatients(data);
    } catch (err) {
      console.error("Error fetching patients:", err);
    }
  };

  // Fetch beds
  const fetchBeds = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/beds", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setBeds(data);
    } catch (err) {
      console.error("Error fetching beds:", err);
    }
  };

  useEffect(() => {
    if (showModal) {
      fetchPatients();
      fetchBeds();
    }
  }, [showModal]);

  // Fetch all schedules
  const fetchSchedules = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:4000/api/schedules", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const mapped = data.map((s) => ({
        id: s._id,
        title: `${s.patient?.firstName || "Unknown"} ${s.patient?.lastName || ""
          } (${s.bed?.name || "Unassigned"})`,
        start: new Date(`${s.date.split("T")[0]}T${s.startTime}`),
        end: new Date(`${s.date.split("T")[0]}T${s.endTime}`),
        status: s.status,
      }));
      setEvents(mapped);
    } catch (err) {
      console.error("Error loading schedules:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  // Create schedule
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:4000/api/schedules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to create schedule");
      setShowModal(false);
      await fetchSchedules();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  // Delete single schedule
  const handleDelete = async (eventId) => {
    if (!window.confirm("Delete this schedule?")) return;
    try {
      await fetch(`http://localhost:4000/api/schedules/${eventId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchSchedules();
    } catch (err) {
      alert("Failed to delete");
    }
  };

  // Delete all schedules
  const handleDeleteAll = async () => {
    if (!window.confirm("Delete ALL schedules?")) return;
    try {
      await fetch("http://localhost:4000/api/schedules?confirm=true", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchSchedules();
    } catch (err) {
      alert("Failed to delete all");
    }
  };

  // Event color
  const eventStyleGetter = (event) => {
    let bgColor = "#3498db";
    if (event.status === "Completed") bgColor = "#2ecc71";
    else if (event.status === "Cancel Requested") bgColor = "#e74c3c";
    else if (event.status === "In Progress") bgColor = "#f1c40f";
    return {
      style: {
        backgroundColor: bgColor,
        borderRadius: "6px",
        color: "white",
        border: "0px",
        display: "block",
      },
    };
  };

  // Only show hours, not minutes
  const formats = {
    timeGutterFormat: (date) => format(date, "HH"),
  };

  return (
    <>
      <Navbar />
      <div className="container my-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="fw-bold">Scheduling Calendar</h3>
          <div className="d-flex gap-2">
            <Button variant="primary" onClick={() => setShowModal(true)}>
              + New Schedule
            </Button>
            <Button variant="danger" onClick={handleDeleteAll}>
              Delete All
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="text-muted mt-2">Loading schedules...</p>
          </div>
        ) : (
          <div className="rotated-calendar">
            <Calendar
  localizer={localizer}
  events={events}
  formats={formats}
  defaultView="week"
  views={["day", "week", "month"]}
  step={60}
  timeslots={1}
  defaultDate={new Date()}
  style={{ height: "80vh" }}
  eventPropGetter={eventStyleGetter}
  onSelectEvent={(event) => handleDelete(event.id)}

  // ✅ Fully allow navigation (Fixes Next / Back / Today)
  onNavigate={(newDate, view) => {
    // Do nothing — allow free navigation
  }}

  components={{
    timeGutterHeader: () => <strong>Hours</strong>,
  }}
/>


          </div>
        )}
      </div>

      {/* Modal: Create Schedule */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>New Schedule</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCreate}>
            <Form.Group className="mb-3">
              <Form.Label>Patient ID</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter patient _id"
                value={form.patient}
                onChange={(e) =>
                  setForm({ ...form, patient: e.target.value })
                }
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                min={new Date().toISOString().split("T")[0]} // hide past dates
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
              />
            </Form.Group>

            <div className="row">
              <div className="col">
                <Form.Group>
                  <Form.Label>Start Time</Form.Label>
                  <Form.Control
                    type="time"
                    step="3600"
                    value={form.startTime}
                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    required
                  />
                </Form.Group>
              </div>
              <div className="col">
                <Form.Group>
                  <Form.Label>End Time</Form.Label>
                  <Form.Control
                    type="time"
                    step="3600"
                    value={form.endTime}
                    onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                    required
                  />
                </Form.Group>
              </div>
            </div>

            {/* Fetch available beds once all three fields filled */}
            {form.date && form.startTime && form.endTime && (
              <Button
                className="mt-3"
                variant="secondary"
                onClick={async () => {
                  const res = await fetch(
                    `http://localhost:4000/api/beds/availability?date=${form.date}&start=${form.startTime}&end=${form.endTime}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                  );
                  const data = await res.json();
                  setBeds(data);
                }}
              >
                Check Bed Availability
              </Button>
            )}

            {/* Show available beds */}
            {beds.length > 0 && (
              <Form.Group className="mt-4 mb-3">
                <Form.Label>Select Bed</Form.Label>
                <div className="d-flex flex-wrap gap-2">
                  {beds.map((b) => (
                    <div
                      key={b._id}
                      onClick={() => b.isFree && setForm({ ...form, bed: b._id })}
                      className={`p-2 border rounded text-center ${form.bed === b._id ? "bg-primary text-white" : ""
                        }`}
                      style={{
                        width: "100px",
                        cursor: b.isFree ? "pointer" : "not-allowed",
                        opacity: b.isFree ? 1 : 0.5,
                      }}
                    >
                      {b.name}
                      <div
                        className={`small ${b.isFree ? "text-success" : "text-danger"
                          } fw-semibold`}
                      >
                        {b.isFree ? "Available" : "Booked"}
                      </div>
                    </div>
                  ))}
                </div>
              </Form.Group>
            )}


            <Form.Group className="mb-3">
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm({ ...form, date: e.target.value })
                }
                required
              />
            </Form.Group>

            <div className="row">
              <div className="col">
                <Form.Group>
                  <Form.Label>Start Time</Form.Label>
                  <Form.Control
                    type="time"
                    step="3600"
                    value={form.startTime}
                    onChange={(e) =>
                      setForm({ ...form, startTime: e.target.value })
                    }
                    required
                  />
                </Form.Group>
              </div>
              <div className="col">
                <Form.Group>
                  <Form.Label>End Time</Form.Label>
                  <Form.Control
                    type="time"
                    step="3600"
                    value={form.endTime}
                    onChange={(e) =>
                      setForm({ ...form, endTime: e.target.value })
                    }
                    required
                  />
                </Form.Group>
              </div>
            </div>

            <Button variant="success" type="submit" className="mt-4 w-100">
              Create Schedule
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      <Footer />
    </>
  );
};

export default ScheduleCalendar;
