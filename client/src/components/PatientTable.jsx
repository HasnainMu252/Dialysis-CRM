import React from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const PatientTable = ({ patients, onDelete, onEdit}) => {
  const navigate = useNavigate();

  return (
    <div className="card border-0 shadow-sm">
      <p className="fw-bold fs-4 px-3 pt-3">Patient List</p>

      <div className="card-body">
        <table className="table table-bordered table-hover align-middle text-center">
          <thead className="table-success">
            <tr>
              <th>#</th>
              <th>MRN</th>
              <th>Full Name</th>
              <th>Gender</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {patients.length > 0 ? (
              patients.map((p, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>{p.mrn}</td>
                  <td>{`${p.firstName} ${p.lastName}`}</td>
                  <td>{p.gender}</td>
                  <td>{p.phone}</td>
                  <td>
                    <span
                      className={`badge ${
                        p.status === "Active"
                          ? "bg-success"
                          : "bg-secondary"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-outline-primary btn-sm me-2"
                      onClick={() => navigate(`${p.mrn}`)}
                      title="View"
                    >
                      <i className="bi bi-eye"></i>
                    </button>

                    {/* Edit Button */}
                    <button
                        className="btn btn-sm btn-outline-warning me-2"
                        onClick={() => onEdit(p)}
                    >
                      <i className="bi bi-pencil"></i>
                    </button>

                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => onDelete(p.mrn)}
                      title="Delete"
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-muted py-4">
                  No patients found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PatientTable;
