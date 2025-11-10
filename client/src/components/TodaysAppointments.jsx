import React, { useEffect, useState } from "react";
import { Card, Spinner } from "react-bootstrap";

function TodaysAppointments() {
  // -----------------------------
  // 🔹 API logic (commented for now)
  // const [appointments, setAppointments] = useState([]);
  // const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   const fetchAppointments = async () => {
  //     try {
  //       const res = await fetch("/api/appointments/today");
  //       const data = await res.json();
  //       setAppointments(data);
  //     } catch (err) {
  //       console.error("Error fetching appointments:", err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   fetchAppointments();
  // }, []);
  // -----------------------------

  // 🔹 Dummy data for now
  const appointments = [
    {
      id: 1,
      patient: "John Smith",
      station: "Station 3",
      time: "9:00 AM",
      status: "Scheduled",
      color: "#2D9CDB",
    },
    {
      id: 2,
      patient: "Maria Rodriguez",
      station: "Station 7",
      time: "9:30 AM",
      status: "In Progress",
      color: "#F2994A",
    },
    {
      id: 3,
      patient: "Robert Johnson",
      station: "Station 2",
      time: "10:00 AM",
      status: "Scheduled",
      color: "#6FCF97",
    },
  ];

  return (
    <div>
        <p className="fw-bold fs-4 px-2 mb-3">Today's Appointments</p>

        {/* {loading ? (
          <div className="text-center py-4">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : ( */}
          <div>
            {appointments.map((appt) => (
              <div
                key={appt.id}
                className="d-flex justify-content-between align-items-center bg-light rounded-3 p-3 mb-2"
              >
                {/* Left: Patient info */}
                <div className="d-flex align-items-center">
                  <span
                    className="me-2 rounded-circle"
                    style={{
                      width: "10px",
                      height: "10px",
                      backgroundColor: appt.color,
                      display: "inline-block",
                    }}
                  ></span>

                  <div>
                    <h6 className="mb-0 fw-semibold">{appt.patient}</h6>
                    <small className="text-muted">
                      {appt.station} • {appt.time}
                    </small>
                  </div>
                </div>

                {/* Right: Status badge */}
                <span
                  className={`badge px-3 py-2 rounded-pill ${
                    appt.status === "Scheduled"
                      ? "bg-success bg-opacity-10 text-success"
                      : "bg-primary bg-opacity-10 text-primary"
                  }`}
                >
                  {appt.status}
                </span>
              </div>
            ))}
          </div>
        {/* )} */}

        <div className="text-center mt-3">
          <a
            href="#"
            className="text-decoration-none text-primary fw-semibold small"
          >
            View All Appointments →
          </a>
        </div>
    </div>
  );
}

export default TodaysAppointments;
