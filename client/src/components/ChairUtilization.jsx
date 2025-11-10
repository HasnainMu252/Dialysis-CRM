import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
// Import custom CSS for the card colors
import '../styles/ChairUtilization.css'; 

// --- Dummy Data (Replace with your actual API data) ---
const chairsData = [
    { id: 1, status: 'Occupied', next: '12:00' },
    { id: 2, status: 'Occupied', next: '12:00' },
    { id: 3, status: 'Occupied', next: '12:00' },
    { id: 4, status: 'Available', next: null },
    { id: 5, status: 'Available', next: null },
    { id: 6, status: 'Available', next: null },
    { id: 7, status: 'Available', next: null },
    { id: 8, status: 'Available', next: null },
    { id: 9, status: 'Available', next: null },
    { id: 10, status: 'Available', next: null },
    { id: 11, status: 'Available', next: null },
    { id: 12, status: 'Available', next: null },
    // Add 'Maintenance' status if needed
    // { id: 13, status: 'Maintenance', next: null }, 
];

// Helper function to determine the card's CSS class
const getChairClass = (status) => {
    switch (status) {
        case 'Available':
            return 'chair-available'; // Green background
        case 'Occupied':
            return 'chair-occupied'; // Red background
        case 'Maintenance':
            return 'chair-maintenance'; // Orange background
        default:
            return 'bg-light';
    }
};

const ChairUtilization = () => {
    return (
        <Container>
            <Row className="justify-content-center">
                <Col lg={12} xl={12}>
                    <Card className="border-0 p-3">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <div>
                                    <p className="fw-bold fs-4 px-2 mb-3">Chair Utilization</p>
                                    <p className="text-muted mb-0">Real-time status of all dialysis stations</p>
                                </div>
                                
                                {/* Legend / Key */}
                                <div className="d-flex align-items-center small">
                                    <span className="me-3">
                                        <span className="status-dot available-dot me-1"></span>Available
                                    </span>
                                    <span className="me-3">
                                        <span className="status-dot occupied-dot me-1"></span>Occupied
                                    </span>
                                    <span>
                                        <span className="status-dot maintenance-dot me-1"></span>Maintenance
                                    </span>
                                </div>
                            </div>
                            
                            {/* Chair Grid */}
                            <Row className="g-3"> 
                                {chairsData.map((chair) => (
                                    <Col xs={12} sm={6} md={4} lg={3} key={chair.id}> 
                                        {/* Card for each Chair */}
                                        <Card className={`text-center p-1 ${getChairClass(chair.status)}`}>
                                            <Card.Body className="p-2">
                                                <h4 className="fw-bold mb-1">{chair.id}</h4>
                                                <p className="mb-0 small fw-semibold">
                                                    {chair.status}
                                                </p>
                                                {chair.next && (
                                                    <p className="mb-0 small text-secondary">
                                                        Next: {chair.next}
                                                    </p>
                                                )}
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
        
    );
};

export default ChairUtilization;