-- Flight Management System Database Setup

CREATE DATABASE IF NOT EXISTS flight_system;
USE flight_system;

-- Passengers Table
CREATE TABLE IF NOT EXISTS passengers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    phone VARCHAR(15),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Flights Table
CREATE TABLE IF NOT EXISTS flights (
    id INT PRIMARY KEY AUTO_INCREMENT,
    flightNumber VARCHAR(10) UNIQUE NOT NULL,
    airline VARCHAR(100) NOT NULL,
    fromCity VARCHAR(100) NOT NULL,
    toCity VARCHAR(100) NOT NULL,
    departureTime DATETIME NOT NULL,
    arrivalTime DATETIME NOT NULL,
    price INT NOT NULL,
    availableSeats INT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    passengerId INT NOT NULL,
    flightId INT NOT NULL,
    bookingDate DATETIME NOT NULL,
    status VARCHAR(20) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (passengerId) REFERENCES passengers(id) ON DELETE CASCADE,
    FOREIGN KEY (flightId) REFERENCES flights(id) ON DELETE CASCADE
);

-- Insert sample data
INSERT INTO passengers (name, email, password, phone) VALUES
('John Doe', 'john@example.com', 'password123', '9876543210'),
('Jane Smith', 'jane@example.com', 'password123', '9876543211'),
('Bob Johnson', 'bob@example.com', 'password123', '9876543212');

INSERT INTO flights (flightNumber, airline, fromCity, toCity, departureTime, arrivalTime, price, availableSeats) VALUES
('AI101', 'Air India', 'Delhi', 'Mumbai', '2025-12-10 10:00:00', '2025-12-10 12:00:00', 5000, 150),
('SG202', 'SpiceJet', 'Bangalore', 'Kolkata', '2025-12-11 14:00:00', '2025-12-11 17:00:00', 6500, 120),
('IG303', 'IndiGo', 'Mumbai', 'Chennai', '2025-12-12 08:00:00', '2025-12-12 10:30:00', 4500, 180);
