import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { Card, Button } from "react-bootstrap";
import { CircleFill } from "react-bootstrap-icons";
import "../../styles/Scheduling.css";
import ScheduleTable from "../../components/ScheduleTable";
import NewAppointmentModal from "../../components/NewAppointmentModal";
import CancelApprovalModal from "../../components/CancelApprovalModal";

const Scheduling = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedCancel, setSelectedCancel] = useState(null);

  const [chairs, setChairs] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    scheduled: 0,
    utilization: 0,
  });

  const token = localStorage.getItem("token");

  // 🧩 Fetch Beds and Schedules
  useEffect(() => {
    const fetchBeds = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/beds", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setChairs(data || []);
      } catch (err) {
        console.error("Error loading beds:", err);
      }
    };

    const fetchSchedules = async () => {
      try {
        const formattedDate = selectedDate.toISOString().split("T")[0];
        const res = await fetch(
          `http://localhost:4000/api/schedules?date=${formattedDate}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        if (Array.isArray(data)) setSchedules(data);
      } catch (err) {
        console.error("Error loading schedules:", err);
      }
    };

    fetchBeds();
    fetchSchedules();
  }, [selectedDate, token]);

  // 🧮 Calculate stats
  useEffect(() => {
    if (schedules.length > 0) {
      const total = schedules.length;
      const completed = schedules.filter((s) => s.status === "Completed").length;
      const inProgress = schedules.filter((s) => s.status === "In Progress").length;
      const scheduled = schedules.filter((s) => s.status === "Scheduled").length;
      const utilization = Math.round(((completed + inProgress) / total) * 100);
      setStats({ total, completed, inProgress, scheduled, utilization });
    }
  }, [schedules]);

  // 🗓️ Render small monthly calendar
  const renderCalendar = () => {
    const days = [];
    for (let i = 1; i <= 30; i++) {
      days.push(
        <div
          key={i}
          className={`calendar-day ${
            selectedDate.getDate() === i ? "selected" : ""
          }`}
          onClick={() => setSelectedDate(new Date(2025, 10, i))}
        >
          {i}
        </div>
      );
    }
    return days;
  };

  // 🧰 Handlers
  const handleEdit = (schedule) => {
    setSelectedSchedule(schedule);
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this schedule?")) return;
    try {
      const res = await fetch(`http://localhost:4000/api/schedules/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setSchedules((prev) => prev.filter((s) => s._id !== id));
        alert("🗑️ Schedule deleted successfully");
      } else {
        const data = await res.json();
        alert(data.message || "Error deleting schedule");
      }
    } catch (err) {
      console.error("Delete schedule error:", err);
    }
  };

  const handleApproveCancel = async (id) => {
    if (!window.confirm("Approve this cancellation request?")) return;
    try {
      const res = await fetch(
        `http://localhost:4000/api/schedules/${id}/approveCancel`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await res.json();
      if (res.ok) {
        alert("✅ Cancellation approved successfully.");
        setSchedules((prev) =>
          prev.map((s) => (s._id === id ? data.schedule : s))
        );
      } else {
        alert(data.message || "Error approving cancellation.");
      }
    } catch (err) {
      console.error("approveCancel error:", err);
    }
  };

  const handleView = (schedule) => {
    alert(`Viewing appointment details for ${schedule.patient?.firstName || "Patient"}`);
  };

  const handleSaveAppointment = async (formData) => {
    try {
      const body = {
        patient: formData.patientId,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        station: formData.bedId,
      };

      const res = await fetch("http://localhost:4000/api/schedules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      alert("✅ Schedule created successfully!");
      setSchedules((prev) => [...prev, data.schedule]);
    } catch (err) {
      alert("❌ " + err.message);
    }

    setShowModal(false);
    setEditMode(false);
    setSelectedSchedule(null);
  };

  return (
    <>
      <Navbar />
      <div className="container p-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h3 className="fw-bold">Appointment Scheduling</h3>
            <p className="text-muted">
              Visual calendar and chair allocation for dialysis sessions
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => {
              setEditMode(false);
              setShowModal(true);
            }}
          >
            + New Appointment
          </Button>
        </div>

        {/* Calendar and Chair Section */}
        <div className="row">
          <div className="col-lg-8 mb-4">
            <Card className="shadow-sm border-0 p-3">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() =>
                    setSelectedDate(
                      new Date(selectedDate.setDate(selectedDate.getDate() - 1))
                    )
                  }
                >
                  ‹
                </Button>
                <h5 className="mb-0">
                  {selectedDate.toLocaleString("default", {
                    month: "long",
                    year: "numeric",
                  })}
                </h5>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() =>
                    setSelectedDate(
                      new Date(selectedDate.setDate(selectedDate.getDate() + 1))
                    )
                  }
                >
                  ›
                </Button>
              </div>
              <div className="calendar-grid">{renderCalendar()}</div>
            </Card>
          </div>

          {/* Chair/Bed Overview */}
          <div className="col-lg-4">
            <Card className="shadow-sm border-0 mb-4 p-3">
              <h6 className="fw-bold mb-3">Chair Status</h6>
              <div className="d-flex flex-wrap gap-2">
                {chairs.map((c, index) => (
                  <div
                    key={c._id || index}
                    className={`chair-box ${c.status.toLowerCase()}`}
                  >
                    {c.name || `Bed ${index + 1}`}
                  </div>
                ))}
              </div>
              <ul className="list-unstyled small mt-3 mb-0">
                <li>
                  <CircleFill color="green" size={10} /> Available Chairs:{" "}
                  {chairs.filter((c) => c.status === "Available").length}
                </li>
                <li>
                  <CircleFill color="red" size={10} /> Occupied Chairs:{" "}
                  {chairs.filter((c) => c.status === "Busy").length}
                </li>
                <li>
                  <CircleFill color="gold" size={10} /> Maintenance:{" "}
                  {chairs.filter((c) => c.status === "Under Maintenance").length}
                </li>
              </ul>
            </Card>

            <Card className="shadow-sm border-0 p-3">
              <h6 className="fw-bold mb-3">Today's Stats</h6>
              <ul className="list-unstyled mb-0">
                <li>Total Appointments: {stats.total}</li>
                <li>Completed: {stats.completed}</li>
                <li>In Progress: {stats.inProgress}</li>
                <li>Scheduled: {stats.scheduled}</li>
                <li>
                  Utilization Rate:{" "}
                  <span className="fw-bold text-primary">
                    {stats.utilization}%
                  </span>
                </li>
              </ul>
            </Card>
          </div>
        </div>

        {/* Schedule Table */}
        <ScheduleTable
          schedules={schedules}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          onApproveCancel={handleApproveCancel}
        />
      </div>

      {/* Modals */}
      {showModal && (
        <NewAppointmentModal
          show={showModal}
          handleClose={() => setShowModal(false)}
          handleSave={handleSaveAppointment}
          editMode={editMode}
          existingData={selectedSchedule}
        />
      )}

      <CancelApprovalModal
        show={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        schedule={selectedCancel}
        onApprove={handleApproveCancel}
      />

      <Footer />
    </>
  );
};

export default Scheduling;
