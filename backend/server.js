const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const passengerRoutes = require("./routes/passengers");
const flightRoutes = require("./routes/flights");
const bookingRoutes = require("./routes/bookings");
const recommendationRoutes = require("./routes/recommendations");

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use("/passengers", passengerRoutes);
app.use("/flights", flightRoutes);
app.use("/bookings", bookingRoutes);
app.use("/recommendations", recommendationRoutes);

app.listen(5000, () => {
    console.log("Server running on http://localhost:5000");
});
