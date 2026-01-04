"use client";
import { useApi } from "./useApi";
import ShowGrid from "../components/ShowGrid";
import { BACKEND_URL } from "../lib/api";
import { Navbar, Nav, Container, Spinner } from "react-bootstrap";

export default function Homepage() {
  const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL;
  const {
    recommendations,
    loading,
    handleDislike,
    handleResetDislikes,
    handleLogout,
  } = useApi();

  return (
    <div className="p-3">
      <Navbar
        expand="md"
        className={"bg-body-tertiary mb-2 rounded-4 fixed-top"}
      >
        <Container fluid>
          <Navbar.Brand className="display-4 fw-normal ps-4">
            BingeBeats
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="navbar-collapse" />
          <Navbar.Collapse id="navbar-collapse" className="ps-4">
            <Nav className="me-auto" style={{ fontWeight: 350 }}>
              <Nav.Link href={FRONTEND_URL}>Home</Nav.Link>
              {recommendations.length === 0 ? (
                <Nav.Link href={`${BACKEND_URL}/auth/spotify/login/`}>
                  Login
                </Nav.Link>
              ) : (
                <>
                  <Nav.Link
                    onClick={handleLogout}
                    style={{ cursor: "pointer" }}
                  >
                    Logout
                  </Nav.Link>
                  <Nav.Link
                    onClick={handleResetDislikes}
                    style={{ cursor: "pointer" }}
                  >
                    Reset Dislikes
                  </Nav.Link>
                  <Nav.Link href={`${BACKEND_URL}/auth/spotify/login/`}>
                    Rerun Algorithm
                  </Nav.Link>
                </>
              )}
              <Nav.Link href="#">Source Code</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      {loading ? (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: "calc(100vh - 70px)" }}
        >
          <Spinner
            animation="border"
            style={{ width: "3rem", height: "3rem" }}
          />
        </div>
      ) : recommendations.length === 0 ? (
        <div
          className="d-flex flex-column justify-content-center align-items-center"
          style={{ minHeight: "calc(100vh - 70px)" }}
        >
          <h1 className="display-1 display-md-3">Welcome to BingeBeats</h1>
          <h1 className="display-6">
            Please login to see your recommendations.
          </h1>
        </div>
      ) : (
        <ShowGrid shows={recommendations} dislike={handleDislike} />
      )}
    </div>
  );
}
