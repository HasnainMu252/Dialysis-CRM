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
import BedAdd from "../../components/BedADD";
import StatsOverviewCard from "../../components/StatsCard";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalBeds: 0,
    availableBeds: 0,
  });
  const [bedStatus, setBedStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedBedCode, setSelectedBedCode] = useState(null);
  const token = localStorage.getItem("token");

  const handleClose = () => {
    setShowModal(false);
    setSelectedBedCode(null); // Reset on close
  };

  const handleShowAdd = () => {
    setSelectedBedCode(null); // Ensure new bed for adding
    setShowModal(true);
  };

  const handleShowUpdate = (bedCode) => {
    setSelectedBedCode(bedCode); // Set bed code for editing
    setShowModal(true);
  };

  const handleAction = (bed) => {
    if (bed) {
      setBedStatus((prev) => [
        ...prev,
        bed,
      ]); // Update UI after adding or editing
    } else {
      // Remove the bed from the UI after deletion
      setBedStatus((prev) => prev.filter((b) => b.code !== selectedBedCode));
    }
  };

  const handleDelete = async (bedCode) => {
    try {
      const response = await fetch(`http://localhost:4000/api/beds/${bedCode}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setBedStatus((prev) => prev.filter((bed) => bed.code !== bedCode)); // Remove bed from list
        alert("Bed deleted successfully!");
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error("Error deleting bed:", error);
    }
  };

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
        const totalPatients = Array.isArray(patients.patients) ? patients.patients.length : 0;
        const totalBeds = Array.isArray(beds.beds) ? beds.beds.length : 0;
        const availableBeds = Array.isArray(beds.beds)
          ? beds.beds.filter((b) => b.status === "Available").length
          : 0;

        setStats({ totalPatients, totalBeds, availableBeds });
        setBedStatus(Array.isArray(beds.beds) ? beds.beds : []);
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
                  <th>#</th> {/* Bed code column */}
                  <th>Bed Name</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className="text-center">
                {bedStatus.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-muted">
                      No beds found.
                    </td>
                  </tr>
                ) : (
                  bedStatus.map((bed, index) => (
                    <tr key={bed.code}> {/* Using bed code as the key */}
                      <td>{bed.code}</td> {/* Showing the bed code in the first column */}
                      <td>{bed.name}</td>
                      <td>
                        <span
                          className={`p-1 fw-semibold ${bed.status === "Available" ? "text-success" : bed.status === "Busy" ? "text-warning" : "text-danger"}`}
                        >
                          {bed.status}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-warning btn-sm"
                          onClick={() => handleShowUpdate(bed.code)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm ms-2"
                          onClick={() => handleDelete(bed.code)} // Added handleDelete here
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <button
              className="btn btn-primary mt-3"
              onClick={handleShowAdd}
            >
              Add New Bed
            </button>
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
                  <StatsOverviewCard />
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {/* Modal for Adding/Editing Beds */}
      <BedAdd
        showModal={showModal}
        handleClose={handleClose}
        bedCode={selectedBedCode}
        handleAction={handleAction}
      />
    </>
  );
};

export default AdminDashboard;
