import React from "react";
import { Card, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

function BedAvailabilityCard() {
  const navigate = useNavigate();

  // 🔹 Example navigation function
  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <div>
        <p className="fw-bold fs-4 px-2">User Management</p>
        <Card.Body>
          <div className="d-grid gap-2">
            <Button
              variant="outline-primary"
              className="rounded-pill"
              onClick={() => handleNavigate("/add-patient")}
            >
              Add Patient
            </Button>

            <Button
              variant="outline-success"
              className="rounded-pill"
              onClick={() => handleNavigate("/add-case-manager")}
            >
              Add Case Manager
            </Button>

            <Button
              variant="outline-info"
              className="rounded-pill"
              onClick={() => handleNavigate("/add-nurse")}
            >
              Add Nurse
            </Button>

            <Button
              variant="outline-warning"
              className="rounded-pill"
              onClick={() => handleNavigate("/add-biller")}
            >
              Add Biller
            </Button>
          </div>
        </Card.Body>
    </div>
  );
}

export default BedAvailabilityCard;
