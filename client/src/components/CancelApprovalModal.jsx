import React from "react";
import { Modal, Button } from "react-bootstrap";

const CancelApprovalModal = ({ show, onClose, schedule, onApprove }) => {
  if (!schedule) return null;

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Cancel Request Approval</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          <strong>Patient:</strong> {schedule.patient}
        </p>
        <p>
          <strong>Bed:</strong> {schedule.bed}
        </p>
        <p>
          <strong>Date:</strong> {schedule.date}
        </p>
        <p>
          <strong>Time:</strong> {schedule.startTime} - {schedule.endTime}
        </p>
        <p>
          <strong>Cancel Reason:</strong>{" "}
          {schedule.cancelReason || "No reason provided"}
        </p>

        <div className="alert alert-warning mt-3">
          Are you sure you want to approve this cancellation?
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
        <Button
          variant="danger"
          onClick={() => {
            onApprove(schedule.id);
            onClose();
          }}
        >
          Approve Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CancelApprovalModal;
