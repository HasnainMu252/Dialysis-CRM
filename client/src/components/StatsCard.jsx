import { useEffect, useMemo, useState } from "react";
import { Card, Button, Spinner, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

function StatsOverviewCard() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState([]);
  const [beds, setBeds] = useState([]);
  const token = localStorage.getItem("token");

  const handleNavigate = (path) => navigate(path);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);

        const [patientsRes, bedsRes] = await Promise.all([
          fetch("http://localhost:4000/api/patients/", {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch("http://localhost:4000/api/beds/", {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        const patientsData = await patientsRes.json();
        const bedsData = await bedsRes.json();

        setPatients(Array.isArray(patientsData?.patients) ? patientsData.patients : []);
        setBeds(Array.isArray(bedsData?.beds) ? bedsData.beds : []);
      } catch (err) {
        console.error("Stats fetch error:", err);
        setPatients([]);
        setBeds([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [token]);

  // -------------------------
  // ✅ PATIENT STATS
  // -------------------------
  const patientStats = useMemo(() => {
    const total = patients.length;

    const active = patients.filter(
      (p) => (p?.status || "").toLowerCase() === "active"
    ).length;

    const inactive = patients.filter(
      (p) => (p?.status || "").toLowerCase() === "inactive"
    ).length;

    const unknown = total - active - inactive;

    return { total, active, inactive, unknown };
  }, [patients]);

  // -------------------------
  // ✅ BED STATS
  // -------------------------
  const bedStats = useMemo(() => {
    const total = beds.length;

    const available = beds.filter(
      (b) => (b?.status || "").toLowerCase() === "available"
    ).length;

    const occupied = beds.filter(
      (b) => (b?.status || "").toLowerCase() === "occupied"
    ).length;

    const maintenance = beds.filter((b) => {
      const s = (b?.status || "").toLowerCase();
      return s === "maintenance" || s === "maintainance"; // handle spelling
    }).length;

    const other = total - available - occupied - maintenance;

    return { total, available, occupied, maintenance, other };
  }, [beds]);

  if (loading) {
    return (
      <Card className="rounded-4 shadow-sm">
        <Card.Body className="text-center py-4">
          <Spinner animation="border" variant="primary" />
          <p className="text-muted mt-2 mb-0">Loading stats...</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <div>
      <p className="fw-bold fs-4 px-2">Overview</p>

      <Card className="rounded-4 shadow-sm">
        <Card.Body>
          {/* ✅ Top Row Stats */}
          <div className="d-flex flex-wrap gap-2 mb-3">
            <Badge bg="primary" className="px-3 py-2 rounded-pill">
              Total Patients: {patientStats.total}
            </Badge>
            <Badge bg="success" className="px-3 py-2 rounded-pill">
              Active: {patientStats.active}
            </Badge>
            <Badge bg="secondary" className="px-3 py-2 rounded-pill">
              Inactive: {patientStats.inactive}
            </Badge>
            {patientStats.unknown > 0 && (
              <Badge bg="dark" className="px-3 py-2 rounded-pill">
                Unknown: {patientStats.unknown}
              </Badge>
            )}
          </div>

          <div className="d-flex flex-wrap gap-2 mb-4">
            <Badge bg="info" className="px-3 py-2 rounded-pill">
              Total Beds: {bedStats.total}
            </Badge>
            <Badge bg="success" className="px-3 py-2 rounded-pill">
              Available: {bedStats.available}
            </Badge>
            <Badge bg="warning" text="dark" className="px-3 py-2 rounded-pill">
              Occupied: {bedStats.occupied}
            </Badge>
            <Badge bg="danger" className="px-3 py-2 rounded-pill">
              Maintenance: {bedStats.maintenance}
            </Badge>
            {bedStats.other > 0 && (
              <Badge bg="dark" className="px-3 py-2 rounded-pill">
                Other: {bedStats.other}
              </Badge>
            )}
          </div>

          {/* ✅ Buttons Like Your Style */}
          <div className="d-grid gap-2">
            <Button
              variant="outline-primary"
              className="rounded-pill"
              onClick={() => handleNavigate("/patients")}
            >
              View Patients
            </Button>

            <Button
              variant="outline-success"
              className="rounded-pill"
              onClick={() => handleNavigate("/beds")}
            >
              View Beds
            </Button>

            <Button
              variant="outline-info"
              className="rounded-pill"
              onClick={() => handleNavigate("/add-patient")}
            >
              Add Patient
            </Button>

            <Button
              variant="outline-warning"
              className="rounded-pill"
              onClick={() => handleNavigate("/add-bed")}
            >
              Add Bed
            </Button>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}

export default StatsOverviewCard;
