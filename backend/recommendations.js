const db = require("./db");

/**
 * Get flight recommendations for a passenger based on their booking history
 * Uses collaborative filtering + content-based recommendations
 */
function getFlightRecommendations(passengerId, callback) {
    // Step 1: Get user's booking history
    const userBookingsSQL = `
        SELECT DISTINCT b.flightId, f.fromCity, f.toCity, f.price, f.airline, f.departureTime
        FROM bookings b
        LEFT JOIN flights f ON b.flightId = f.id
        WHERE b.passengerId = ?
    `;

    db.query(userBookingsSQL, [passengerId], (err, userBookings) => {
        if (err) return callback(err, null);

        if (userBookings.length === 0) {
            // If no booking history, return popular flights
            return getPopularFlights(callback);
        }

        // Step 2: Extract routes user has booked
        const bookedRoutes = userBookings.map(b => ({
            from: b.fromCity,
            to: b.toCity,
            price: b.price
        }));

        // Step 3: Find similar flights (content-based)
        let recommendations = [];
        let routeQueries = bookedRoutes.length;

        bookedRoutes.forEach(route => {
            const similarFlightsSQL = `
                SELECT * FROM flights 
                WHERE (fromCity = ? AND toCity = ?)
                AND id NOT IN (
                    SELECT flightId FROM bookings WHERE passengerId = ?
                )
                AND availableSeats > 0
                LIMIT 3
            `;

            db.query(similarFlightsSQL, [route.from, route.to, passengerId], (err, result) => {
                if (!err && result) {
                    recommendations = recommendations.concat(result);
                }

                routeQueries--;
                if (routeQueries === 0) {
                    // Remove duplicates and return
                    const unique = Array.from(
                        new Map(recommendations.map(r => [r.id, r])).values()
                    );
                    callback(null, unique.slice(0, 5)); // Return top 5
                }
            });
        });
    });
}

/**
 * Get popular flights based on booking frequency
 */
function getPopularFlights(callback) {
    const popularSQL = `
        SELECT f.*, COUNT(b.id) as bookingCount
        FROM flights f
        LEFT JOIN bookings b ON f.id = b.flightId
        WHERE f.availableSeats > 0
        GROUP BY f.id
        ORDER BY bookingCount DESC, f.price ASC
        LIMIT 5
    `;

    db.query(popularSQL, (err, result) => {
        if (err) return callback(err, null);
        callback(null, result);
    });
}

/**
 * Get personalized recommendations with score
 * Combines multiple factors: route match, price, availability
 */
function getPersonalizedRecommendations(passengerId, callback) {
    const userBookingsSQL = `
        SELECT b.flightId, f.fromCity, f.toCity, f.price, f.airline
        FROM bookings b
        LEFT JOIN flights f ON b.flightId = f.id
        WHERE b.passengerId = ?
    `;

    db.query(userBookingsSQL, [passengerId], (err, userBookings) => {
        if (err) return callback(err, null);

        if (userBookings.length === 0) {
            return getPopularFlights(callback);
        }

        // Get average price user books at
        const avgPrice = userBookings.reduce((sum, b) => sum + b.price, 0) / userBookings.length;
        const preferredCities = userBookings.map(b => ({ from: b.fromCity, to: b.toCity }));

        // Get all available flights
        const allFlightsSQL = `
            SELECT * FROM flights 
            WHERE availableSeats > 0
            ORDER BY departureTime ASC
        `;

        db.query(allFlightsSQL, (err, allFlights) => {
            if (err) return callback(err, null);

            // Score and rank flights
            const scoredFlights = allFlights.map(flight => {
                let score = 0;

                // Route match score (highest weight)
                const routeMatch = preferredCities.some(
                    route => route.from === flight.fromCity && route.to === flight.toCity
                );
                if (routeMatch) score += 50;

                // Price match score
                const priceDiff = Math.abs(flight.price - avgPrice);
                score += Math.max(0, 30 - priceDiff / 100);

                // Availability score
                score += Math.min(20, flight.availableSeats / 10);

                return { ...flight, recommendationScore: Math.round(score) };
            });

            // Sort by score and return top 5
            const topRecommendations = scoredFlights
                .sort((a, b) => b.recommendationScore - a.recommendationScore)
                .filter(f => !userBookings.some(b => b.flightId === f.id))
                .slice(0, 5);

            callback(null, topRecommendations);
        });
    });
}

module.exports = {
    getFlightRecommendations,
    getPopularFlights,
    getPersonalizedRecommendations
};
