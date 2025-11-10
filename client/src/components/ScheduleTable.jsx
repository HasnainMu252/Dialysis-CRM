// 📁 src/components/ScheduleTable.jsx
import React from "react";
import { PencilSquare, Trash, Eye, CheckCircle } from "react-bootstrap-icons";
import "../styles/ScheduleTable.css";

const ScheduleTable = ({ schedules, onEdit, onDelete, onView, onApproveCancel }) => {
  return (
    <div className="card shadow-sm mt-4">
      <div className="card-header bg-light">
        <h5 className="mb-0 fw-bold">Current Schedules</h5>
      </div>

      <div className="table-responsive">
        <table className="table table-striped align-middle text-center mb-0">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Patient</th>
              <th>Bed</th>
              <th>Date</th>
              <th>Start</th>
              <th>End</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {schedules.length > 0 ? (
              schedules.map((s, index) => (
                <tr key={s.id}>
                  <td>{index + 1}</td>
                  <td>{s.patient}</td>
                  <td>{s.bed}</td>
                  <td>{s.date}</td>
                  <td>{s.startTime}</td>
                  <td>{s.endTime}</td>
                  <td>
                    <span
                      className={`badge ${
                        s.status.includes("Scheduled")
                          ? "bg-info text-dark"
                          : s.status.includes("Completed")
                          ? "bg-success"
                          : "bg-danger"
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-primary me-2"
                      onClick={() => onView(s)}
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      className="btn btn-sm btn-outline-warning me-2"
                      onClick={() => onEdit(s)}
                    >
                      <PencilSquare size={16} />
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger me-2"
                      onClick={() => onDelete(s.id)}
                    >
                      <Trash size={16} />
                    </button>
                    {s.status === "Cancelled" && (
                      <button
                        className="btn btn-sm btn-outline-success"
                        onClick={() => onApproveCancel(s.id)}
                      >
                        <CheckCircle size={16} /> Approve
                      </button>
                    )}
                    { s.status === "Cancel Requested" && (
                        <button
                            className="btn btn-sm btn-outline-danger me-2"
                            onClick={() => onApproveCancel(s)}
                        >
                            Approve Cancel
                        </button>
                    )}

                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-muted py-3">
                  No schedules found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ScheduleTable;
