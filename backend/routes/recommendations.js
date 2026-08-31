const express = require("express");
const { getPersonalizedRecommendations, getPopularFlights } = require("../recommendations");
const router = express.Router();

/**
 * GET /recommendations/user/:id
 * Get personalized flight recommendations for a specific passenger
 */
router.get("/user/:id", (req, res) => {
    const passengerId = req.params.id;

    getPersonalizedRecommendations(passengerId, (err, recommendations) => {
        if (err) {
            return res.json({ status: "error", message: err.message });
        }
        res.json({ status: "success", data: recommendations });
    });
});

/**
 * GET /recommendations/popular
 * Get popular flights (for new passengers or unauthenticated users)
 */
router.get("/popular", (req, res) => {
    getPopularFlights((err, flights) => {
        if (err) {
            return res.json({ status: "error", message: err.message });
        }
        res.json({ status: "success", data: flights });
    });
});

module.exports = router;
