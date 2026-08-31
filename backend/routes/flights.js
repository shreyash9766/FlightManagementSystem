const express = require("express");
const db = require("../db");
const router = express.Router();

router.get("/", (req, res) => {
    db.query("SELECT * FROM flights", (err, result) => {
        if (err) throw err;
        res.json(result);
    });
});

router.post("/add", (req, res) => {
    const f = req.body;

    const sql = `INSERT INTO flights 
    (flightNumber, airline, fromCity, toCity, departureTime, arrivalTime, price, availableSeats)
    VALUES (?,?,?,?,?,?,?,?)`;

    db.query(sql, [
        f.flightNumber, f.airline, f.fromCity, f.toCity,
        f.departureTime, f.arrivalTime, f.price, f.availableSeats
    ], (err, result) => {
        if (err) return res.json({ status: "error" });
        res.json({ status: "success" });
    });
});

router.delete("/delete/:id", (req, res) => {
    const flightId = req.params.id;

    const sql = `DELETE FROM flights WHERE id=?`;

    db.query(sql, [flightId], (err, result) => {
        if (err) return res.json({ status: "error" });
        res.json({ status: "success" });
    });
});

module.exports = router;
