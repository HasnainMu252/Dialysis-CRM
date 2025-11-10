import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  Container,
  Nav,
  Navbar,
  Form,
  FormControl,
  Dropdown,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStethoscope } from "@fortawesome/free-solid-svg-icons";
import "../styles/Navbar.css";

const HeaderNavbar = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/"; // redirect to login
  };

  return (
    <Navbar
      expand="lg"
      fixed="top"
      bg="white"
      className="myNav border-bottom shadow-sm py-2"
    >
      <Container>
        {/* Left Section — Logo */}
        <Navbar.Brand
          href="/"
          className="fw-bold logo-text d-flex align-items-center"
        >
          <FontAwesomeIcon icon={faStethoscope} className="me-2 text-info" />
          Dialysis<span style={{ color: "#74b9b1" }}>Center</span> Pro
        </Navbar.Brand>

        {/* Navbar Toggle (for small screens) */}
        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        {/* Center Section — Navigation Links */}
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mx-auto gap-3">
            <Nav.Link href="/admin/dashboard" className="nav-link-custom active">
              Dashboard
            </Nav.Link>
            <Nav.Link href="/admin/patient" className="nav-link-custom">
              Patients
            </Nav.Link>
            <Nav.Link href="/scheduling" className="nav-link-custom">
              Scheduling
            </Nav.Link>
            <Nav.Link href="/analytics" className="nav-link-custom">
              Analytics
            </Nav.Link>
          </Nav>

          {/* Right Section — Search + Profile */}
          <div className="d-flex align-items-center gap-3">
            <Form className="d-flex">
              <FormControl
                type="search"
                placeholder="Search"
                className="me-2 rounded-pill px-3"
                aria-label="Search"
              />
            </Form>

            {/* Profile Dropdown */}
            <Dropdown align="end">
              <Dropdown.Toggle
                variant="light"
                id="dropdown-basic"
                className="d-flex align-items-center border-0 bg-transparent p-0"
              >
                <div
                  className="profile-icon d-flex align-items-center justify-content-center rounded-circle text-white fw-bold me-2"
                  style={{
                    width: "40px",
                    height: "40px",
                    backgroundColor: "#74b9b1",
                  }}
                >
                  {user?.name
                    ? user.name
                        .split(" ")
                        .map((n) => n[0]?.toUpperCase())
                        .join("")
                        .slice(0, 2)
                    : "U"}
                </div>
                <div className="profile-details lh-sm text-start">
                  <div className="fw-semibold">
                    {user?.name || "User Name"}
                  </div>
                  <div className="text-secondary small">
                    {user?.role || "Staff"}
                  </div>
                </div>
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item href="/profile">Profile</Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={handleLogout} className="text-danger">
                  Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default HeaderNavbar;
