const express = require("express");
const db = require("../db");
const router = express.Router();

router.post("/register", (req, res) => {
    const { name, email, password, phone } = req.body;

    const sql = `INSERT INTO passengers (name,email,password,phone) 
                 VALUES (?,?,?,?)`;

    db.query(sql, [name, email, password, phone], (err, result) => {
        if (err) return res.json({ status: "error", error: err });
        res.json({ status: "success" });
    });
});

router.post("/login", (req, res) => {
    const { email, password } = req.body;

    const sql = `SELECT * FROM passengers WHERE email=? AND password=?`;

    db.query(sql, [email, password], (err, results) => {
        if (err) return res.json({ status: "error", error: err });

        if (results.length > 0) {
            res.json({ status: "success", user: results[0] });
        } else {
            res.json({ status: "invalid" });
        }
    });
});

router.get("/count", (req, res) => {
    const sql = `SELECT COUNT(*) as totalPassengers FROM passengers`;

    db.query(sql, (err, results) => {
        if (err) return res.json({ status: "error", error: err });
        res.json({ totalPassengers: results[0].totalPassengers });
    });
});

module.exports = router;
