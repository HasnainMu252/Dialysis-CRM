import { useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom"; // Updated to useNavigate

const TodaysAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const navigate = useNavigate(); // For redirection

  // Helper: format date as DD/MM/YYYY
  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-GB");
  };

  // Helper: format time range as "HH:mm - HH:mm"
  const formatTimeRange = (start, end) => {
    return `${start} - ${end}`;
  };

  // Helper: check if the date is today
  const isToday = (dateString) => {
    const today = new Date();
    const date = new Date(dateString);
    return (
      today.getDate() === date.getDate() &&
      today.getMonth() === date.getMonth() &&
      today.getFullYear() === date.getFullYear()
    );
  };

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/schedules/", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!data.success || !Array.isArray(data.schedules)) {
          console.error("Unexpected data format:", data);
          setAppointments([]);
          return;
        }

        // Separate today's schedules and sort them on top
        const todaySchedules = data.schedules.filter((s) => isToday(s.date));
        const sortedList = [...todaySchedules];

        setAppointments(sortedList);
      } catch (err) {
        console.error("Error fetching schedules:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [token]);

  const handleScheduleClick = () => {
    // Redirect to /schedules page
    navigate("/schedules"); // Updated to use navigate instead of useHistory
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" variant="primary" />
        <p className="text-muted mt-2">Loading appointments...</p>
      </div>
    );
  }

  return (
    <div>
      <p className="fw-bold fs-4 px-2 mb-3">Today's Appointments</p>

      {appointments.length === 0 ? (
        <div className="text-center text-muted py-3">
          No appointments scheduled.
        </div>
      ) : (
        <div>
          {appointments.map((appt) => (
            <div
              key={appt.scheduleId}
              className={`d-flex justify-content-between align-items-center rounded-3 p-3 mb-2 ${
                isToday(appt.date)
                  ? "bg-light border-start border-3 border-success"
                  : "bg-white shadow-sm"
              }`}
              onClick={handleScheduleClick} // Clickable div
              style={{ cursor: "pointer" }}
            >
              {/* Left: Patient info */}
              <div className="d-flex align-items-center">
                <div
                  className="me-3 rounded-circle"
                  style={{
                    width: "10px",
                    height: "10px",
                    backgroundColor:
                      appt.status === "Completed"
                        ? "#2ecc71"
                        : appt.status === "In Progress"
                        ? "#f39c12"
                        : appt.status === "Cancel Requested"
                        ? "#e74c3c"
                        : "#3498db",
                  }}
                ></div>

                <div>
                  <h6 className="mb-0 fw-semibold text-capitalize">
                    {appt.patient
                      ? `${appt.patient.firstName} ${appt.patient.lastName}`
                      : "Unknown Patient"}
                  </h6>
                  <small className="text-muted">
                    {appt.bed?.name || "No Bed Assigned"} •{" "}
                    {formatDate(appt.date)} •{" "}
                    {formatTimeRange(appt.startTime, appt.endTime)}
                  </small>
                  <div className="mt-2 text-muted small">
                    {/* Showing scheduleId and bed details */}
                    <p>Schedule ID: {appt.scheduleId}</p>
                    <p>Bed Code: {appt.bed?.code}</p>
                  </div>
                </div>
              </div>

              {/* Right: Status badge */}
              <span
                className={`badge px-3 py-2 rounded-pill ${
                  appt.status === "Completed"
                    ? "bg-success bg-opacity-10 text-success"
                    : appt.status === "In Progress"
                    ? "bg-warning bg-opacity-10 text-warning"
                    : appt.status === "Cancel Requested"
                    ? "bg-danger bg-opacity-10 text-danger"
                    : "bg-primary bg-opacity-10 text-primary"
                }`}
              >
                {appt.status}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="text-center mt-3">
        <a
          href="/schedules"
          className="text-decoration-none text-primary fw-semibold small"
        >
          View All Schedules →
        </a>
      </div>
    </div>
  );
};

export default TodaysAppointments;
