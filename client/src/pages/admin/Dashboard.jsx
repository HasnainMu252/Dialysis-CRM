import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import "../../styles/adminDashboard.css";
import "../../styles/global.css";
import ChairUtilization from "../../components/ChairUtilization";
import TodaysAppointments from "../../components/TodaysAppointments";
import BedAvailabilityCard from "../../components/BedAvailabilityCard";
import Slider from "../../components/Slider";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalBeds: 0,
    availableBeds: 0,
  });
  const [bedStatus, setBedStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch patients and beds in parallel
        const [patientsRes, bedsRes] = await Promise.all([
          fetch("http://localhost:4000/api/patients", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:4000/api/beds", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const patients = await patientsRes.json();
        const beds = await bedsRes.json();

        // Compute stats
        const totalPatients = Array.isArray(patients) ? patients.length : 0;
        const totalBeds = Array.isArray(beds) ? beds.length : 0;
        const availableBeds = Array.isArray(beds)
          ? beds.filter((b) => b.status === "Available").length
          : 0;

        setStats({ totalPatients, totalBeds, availableBeds });
        setBedStatus(Array.isArray(beds) ? beds : []);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container py-5 text-center">
          <h5 className="text-muted">Loading Dashboard...</h5>
        </div>
      </>
    );
  }

  const { totalPatients, totalBeds, availableBeds } = stats;
  const reservedBeds = totalBeds - availableBeds;

  return (
    <>
      <Navbar />
      <Slider />

      <div className="container my-5">
        <h2 className="mb-4 fw-bold">Admin Dashboard</h2>

        {/* 📊 Summary Cards */}
        <div className="row text-center mb-4">
          <div className="col-md-4 mb-3">
            <div className="card shadow-sm border-0 rounded-3 p-3">
              <h5 className="text-muted">Total Patients</h5>
              <h3 className="fw-bold text-primary">{totalPatients}</h3>
            </div>
          </div>

          <div className="col-md-4 mb-3">
            <div className="card shadow-sm border-0 rounded-3 p-3">
              <h5 className="text-muted">Total Beds</h5>
              <h3 className="fw-bold text-success">{totalBeds}</h3>
            </div>
          </div>

          <div className="col-md-4 mb-3">
            <div className="card shadow-sm border-0 rounded-3 p-3">
              <h5 className="text-muted">Available Beds</h5>
              <h3 className="fw-bold text-info">{availableBeds}</h3>
            </div>
          </div>
        </div>

        {/* 🛏️ Bed Status Table */}
        <div className="card border-0">
          <p className="fw-bold fs-4 px-2">Bed Availability Status</p>
          <div className="card-body">
            <table className="table table-bordered rounded-3 table-hover align-middle">
              <thead className="table-success text-center">
                <tr>
                  <th>#</th>
                  <th>Bed Name</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody className="text-center">
                {bedStatus.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="text-muted">
                      No beds found.
                    </td>
                  </tr>
                ) : (
                  bedStatus.map((bed, index) => (
                    <tr key={bed._id || index}>
                      <td>{index + 1}</td>
                      <td>{bed.name}</td>
                      <td>
                        <span
                          className={`p-1 fw-semibold ${
                            bed.status === "Available"
                              ? "text-success"
                              : bed.status === "Busy"
                              ? "text-warning"
                              : "text-danger"
                          }`}
                        >
                          {bed.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 📈 Utilization + Appointments */}
      <ChairUtilization />

      <div className="container my-5">
        <div className="row">
          <div className="col-sm-8">
            <div className="card border-0">
              <TodaysAppointments />
            </div>
          </div>
          <div className="col-sm-4">
            <div className="card border-0">
              <BedAvailabilityCard />
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default AdminDashboard;
