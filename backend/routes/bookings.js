const express = require("express");
const db = require("../db");
const router = express.Router();

router.post("/book", (req, res) => {
    const { passengerId, flightId, status } = req.body;

    const sql = `INSERT INTO bookings (passengerId, flightId, bookingDate, status)
                 VALUES (?,?,NOW(),?)`;

    db.query(sql, [passengerId, flightId, status], (err, result) => {
        if (err) return res.json({ status: "error" });
        
        // Decrease available seats by 1
        const updateSeatsSQL = `UPDATE flights SET availableSeats = availableSeats - 1 WHERE id = ?`;
        db.query(updateSeatsSQL, [flightId], (err, result) => {
            if (err) return res.json({ status: "error" });
            res.json({ status: "success" });
        });
    });
});

router.get("/", (req, res) => {
    const sql = `SELECT b.*, f.flightNumber, f.price, f.airline, f.fromCity, f.toCity, f.departureTime, p.name as passengerName, p.email as passengerEmail 
                 FROM bookings b 
                 LEFT JOIN flights f ON b.flightId = f.id
                 LEFT JOIN passengers p ON b.passengerId = p.id`;
    
    db.query(sql, (err, result) => {
        if (err) throw err;
        res.json(result);
    });
});

router.get("/user/:id", (req, res) => {
    const sql = `SELECT b.*, f.flightNumber, f.price, f.airline, f.fromCity, f.toCity, f.departureTime 
                 FROM bookings b 
                 LEFT JOIN flights f ON b.flightId = f.id 
                 WHERE b.passengerId=?`;
    
    db.query(sql, [req.params.id], (err, result) => {
        if (err) throw err;
        res.json(result);
    });
});

router.delete("/cancel/:id", (req, res) => {
    const bookingId = req.params.id;

    // First, get the flightId from the booking
    const getFlightSQL = `SELECT flightId FROM bookings WHERE id=?`;
    
    db.query(getFlightSQL, [bookingId], (err, result) => {
        if (err) return res.json({ status: "error" });
        
        if (result.length === 0) return res.json({ status: "error" });
        
        const flightId = result[0].flightId;
        
        // Delete the booking
        const deleteSQL = `DELETE FROM bookings WHERE id=?`;
        
        db.query(deleteSQL, [bookingId], (err, result) => {
            if (err) return res.json({ status: "error" });
            
            // Restore available seats by 1
            const updateSeatsSQL = `UPDATE flights SET availableSeats = availableSeats + 1 WHERE id = ?`;
            db.query(updateSeatsSQL, [flightId], (err, result) => {
                if (err) return res.json({ status: "error" });
                res.json({ status: "success" });
            });
        });
    });
});

module.exports = router;
