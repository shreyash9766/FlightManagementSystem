
        function registerPassenger() {
    const data = {
        name: document.getElementById("regName").value,
        email: document.getElementById("regEmail").value,
        password: document.getElementById("regPassword").value,
        phone: document.getElementById("regPhone").value
    };

    fetch("http://localhost:5000/passengers/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(d => {
        if (d.status === "success") {
            alert("Registration successful!");
            showPassengerLogin();
        } else {
            alert("Error registering user!");
        }
    });
}
        // Database simulation using localStorage
        const DB = {
            flights: [],
            bookings: [],
            passengers: [],
            admin: { username: 'admin', password: 'admin123' }
        };

        // Initialize database
        function initDB() {
            const storedFlights = localStorage.getItem('flights');
            const storedBookings = localStorage.getItem('bookings');
            const storedPassengers = localStorage.getItem('passengers');

            if (storedFlights) DB.flights = JSON.parse(storedFlights);
            if (storedBookings) DB.bookings = JSON.parse(storedBookings);
            if (storedPassengers) DB.passengers = JSON.parse(storedPassengers);

            // Add sample data if empty
            if (DB.flights.length === 0) {
                DB.flights = [
                    {
                        id: 1,
                        flightNumber: 'AI101',
                        airline: 'Air India',
                        from: 'Delhi',
                        to: 'Mumbai',
                        departureTime: '2025-12-10T10:00',
                        arrivalTime: '2025-12-10T12:00',
                        price: 5000,
                        availableSeats: 150
                    },
                    {
                        id: 2,
                        flightNumber: 'SG202',
                        airline: 'SpiceJet',
                        from: 'Bangalore',
                        to: 'Kolkata',
                        departureTime: '2025-12-11T14:00',
                        arrivalTime: '2025-12-11T17:00',
                        price: 6500,
                        availableSeats: 120
                    },
                    {
                        id: 3,
                        flightNumber: 'IG303',
                        airline: 'IndiGo',
                        from: 'Mumbai',
                        to: 'Chennai',
                        departureTime: '2025-12-12T08:00',
                        arrivalTime: '2025-12-12T10:30',
                        price: 4500,
                        availableSeats: 180
                    }
                ];
                saveDB();
            }
        }

        function saveDB() {
            localStorage.setItem('flights', JSON.stringify(DB.flights));
            localStorage.setItem('bookings', JSON.stringify(DB.bookings));
            localStorage.setItem('passengers', JSON.stringify(DB.passengers));
        }

        // UI Functions
        function switchTab(tab) {
            const tabs = document.querySelectorAll('.tab-btn');
            tabs.forEach(t => t.classList.remove('active'));
            event.target.classList.add('active');

            document.getElementById('passengerLogin').classList.add('hidden');
            document.getElementById('passengerRegister').classList.add('hidden');
            document.getElementById('adminLogin').classList.add('hidden');

            if (tab === 'passenger') {
                document.getElementById('passengerLogin').classList.remove('hidden');
            } else {
                document.getElementById('adminLogin').classList.remove('hidden');
            }
        }

        function showPassengerRegister() {
            document.getElementById('passengerLogin').classList.add('hidden');
            document.getElementById('passengerRegister').classList.remove('hidden');
        }

        function showPassengerLogin() {
            document.getElementById('passengerRegister').classList.add('hidden');
            document.getElementById('passengerLogin').classList.remove('hidden');
        }

        // Authentication
        // function registerPassenger() {
        //     const name = document.getElementById('regName').value;
        //     const email = document.getElementById('regEmail').value;
        //     const password = document.getElementById('regPassword').value;
        //     const phone = document.getElementById('regPhone').value;

        //     if (!name || !email || !password || !phone) {
        //         alert('Please fill all fields');
        //         return;
        //     }

        //     const existingPassenger = DB.passengers.find(p => p.email === email);
        //     if (existingPassenger) {
        //         alert('Email already registered');
        //         return;
        //     }

        //     const newPassenger = {
        //         id: DB.passengers.length + 1,
        //         name,
        //         email,
        //         password,
        //         phone
        //     };

        //     DB.passengers.push(newPassenger);
        //     saveDB();
        //     alert('Registration successful! Please login.');
        //     showPassengerLogin();
        // }

        function passengerLogin() {
            const email = document.getElementById('passengerEmail').value;
            const password = document.getElementById('passengerPassword').value;

            fetch('http://localhost:5000/passengers/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            })
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success') {
                    sessionStorage.setItem('currentUser', JSON.stringify(data.user));
                    sessionStorage.setItem('userType', 'passenger');
                    showPassengerDashboard(data.user);
                } else {
                    alert('Invalid credentials');
                }
            })
            .catch(err => alert('Login error: ' + err));
        }

        function adminLogin() {
            const username = document.getElementById('adminUsername').value;
            const password = document.getElementById('adminPassword').value;

            if (username === DB.admin.username && password === DB.admin.password) {
                sessionStorage.setItem('userType', 'admin');
                showAdminDashboard();
            } else {
                alert('Invalid admin credentials');
            }
        }

        function logout() {
            sessionStorage.clear();
            location.reload();
        }

        // Dashboard Functions
        function showPassengerDashboard(passenger) {
            document.getElementById('loginSection').style.display = 'none';
            document.getElementById('passengerDashboard').classList.add('active');
            document.getElementById('passengerName').textContent = passenger.name;

            displayAvailableFlights();
            displayRecommendations(passenger.id);
            displayMyBookings(passenger.id);
        }

        function showAdminDashboard() {
            document.getElementById('loginSection').style.display = 'none';
            document.getElementById('adminDashboard').classList.add('active');

            updateAdminStats();
            displayAllFlights();
            displayAllBookings();
        }

        function displayAvailableFlights() {
            const container = document.getElementById('availableFlights');
            container.innerHTML = '<p>Loading flights...</p>';

            fetch('http://localhost:5000/flights')
            .then(res => res.json())
            .then(flights => {
                container.innerHTML = '';
                flights.forEach(flight => {
                    if (flight.availableSeats > 0) {
                        const card = document.createElement('div');
                        card.className = 'flight-card';
                        card.innerHTML = `
                            <div class="flight-info">
                                <p><strong>Flight:</strong> ${flight.flightNumber} - ${flight.airline}</p>
                                <p><strong>Route:</strong> ${flight.fromCity} → ${flight.toCity}</p>
                                <p><strong>Departure:</strong> ${new Date(flight.departureTime).toLocaleString()}</p>
                                <p><strong>Arrival:</strong> ${new Date(flight.arrivalTime).toLocaleString()}</p>
                                <p><strong>Price:</strong> ₹${flight.price}</p>
                                <p><strong>Available Seats:</strong> ${flight.availableSeats}</p>
                            </div>
                            <button class="btn btn-primary" onclick="bookFlight(${flight.id})">Book Now</button>
                        `;
                        container.appendChild(card);
                    }
                });
            })
            .catch(err => {
                container.innerHTML = '<p>Error loading flights</p>';
                console.error(err);
            });
        }

        function searchFlights() {
            const fromCity = document.getElementById('searchFrom').value.toLowerCase();
            const toCity = document.getElementById('searchTo').value.toLowerCase();
            const searchDate = document.getElementById('searchDate').value;

            const container = document.getElementById('availableFlights');
            container.innerHTML = '<p>Searching flights...</p>';

            fetch('http://localhost:5000/flights')
            .then(res => res.json())
            .then(flights => {
                container.innerHTML = '';
                
                const filteredFlights = flights.filter(flight => {
                    const flightDate = new Date(flight.departureTime).toISOString().split('T')[0];
                    const matchFrom = fromCity === '' || flight.fromCity.toLowerCase().includes(fromCity);
                    const matchTo = toCity === '' || flight.toCity.toLowerCase().includes(toCity);
                    const matchDate = searchDate === '' || flightDate === searchDate;
                    
                    return matchFrom && matchTo && matchDate && flight.availableSeats > 0;
                });

                if (filteredFlights.length === 0) {
                    container.innerHTML = '<p>No flights found matching your search criteria.</p>';
                    return;
                }

                filteredFlights.forEach(flight => {
                    const card = document.createElement('div');
                    card.className = 'flight-card';
                    card.innerHTML = `
                        <div class="flight-info">
                            <p><strong>Flight:</strong> ${flight.flightNumber} - ${flight.airline}</p>
                            <p><strong>Route:</strong> ${flight.fromCity} → ${flight.toCity}</p>
                            <p><strong>Departure:</strong> ${new Date(flight.departureTime).toLocaleString()}</p>
                            <p><strong>Arrival:</strong> ${new Date(flight.arrivalTime).toLocaleString()}</p>
                            <p><strong>Price:</strong> ₹${flight.price}</p>
                            <p><strong>Available Seats:</strong> ${flight.availableSeats}</p>
                        </div>
                        <button class="btn btn-primary" onclick="bookFlight(${flight.id})">Book Now</button>
                    `;
                    container.appendChild(card);
                });
            })
            .catch(err => {
                container.innerHTML = '<p>Error searching flights</p>';
                console.error(err);
            });
        }

        function displayRecommendations(passengerId) {
            const container = document.getElementById('recommendedFlights');
            container.innerHTML = '<p>Loading recommendations...</p>';

            fetch(`http://localhost:5000/recommendations/user/${passengerId}`)
            .then(res => res.json())
            .then(result => {
                container.innerHTML = '';
                
                if (!result.data || result.data.length === 0) {
                    container.innerHTML = '<p>No recommendations available yet. Book more flights to get personalized suggestions!</p>';
                    return;
                }

                result.data.forEach(flight => {
                    const card = document.createElement('div');
                    card.className = 'flight-card';
                    const score = flight.recommendationScore ? ` (Match: ${flight.recommendationScore}%)` : '';
                    
                    card.innerHTML = `
                        <div class="flight-info">
                            <p><strong>Flight:</strong> ${flight.flightNumber} - ${flight.airline}</p>
                            <p><strong>Route:</strong> ${flight.fromCity} → ${flight.toCity}</p>
                            <p><strong>Departure:</strong> ${new Date(flight.departureTime).toLocaleString()}</p>
                            <p><strong>Arrival:</strong> ${new Date(flight.arrivalTime).toLocaleString()}</p>
                            <p><strong>Price:</strong> ₹${flight.price}</p>
                            <p><strong>Available Seats:</strong> ${flight.availableSeats}</p>
                            <p style="color: #27ae60; font-weight: bold;">⭐ Recommended${score}</p>
                        </div>
                        <button class="btn btn-success" onclick="bookFlight(${flight.id})">Book Now</button>
                    `;
                    container.appendChild(card);
                });
            })
            .catch(err => {
                container.innerHTML = '<p>Could not load recommendations</p>';
                console.error(err);
            });
        }

        function bookFlight(flightId) {
            const user = JSON.parse(sessionStorage.getItem('currentUser'));

            fetch('http://localhost:5000/bookings/book', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    passengerId: user.id,
                    flightId: flightId,
                    status: 'Confirmed'
                })
            })
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success') {
                    alert('Booking successful!');
                    displayAvailableFlights();
                    displayRecommendations(user.id);
                    displayMyBookings(user.id);
                } else {
                    alert('Booking failed: ' + (data.error || 'Unknown error'));
                }
            })
            .catch(err => alert('Booking error: ' + err));
        }

        function displayMyBookings(passengerId) {
            const container = document.getElementById('myBookings');
            container.innerHTML = '<p>Loading bookings...</p>';

            fetch(`http://localhost:5000/bookings/user/${passengerId}`)
            .then(res => res.json())
            .then(bookings => {
                if (!bookings || bookings.length === 0) {
                    container.innerHTML = '<p>No bookings found.</p>';
                    return;
                }

                let html = '<table><thead><tr><th>Flight</th><th>Route</th><th>Departure</th><th>Price</th><th>Status</th><th>Action</th></tr></thead><tbody>';

                bookings.forEach(booking => {
                    html += `
                        <tr>
                            <td>${booking.flightNumber || 'N/A'}</td>
                            <td>${booking.fromCity && booking.toCity ? booking.fromCity + ' → ' + booking.toCity : 'N/A'}</td>
                            <td>${booking.departureTime ? new Date(booking.departureTime).toLocaleString() : 'N/A'}</td>
                            <td>₹${booking.price || 'N/A'}</td>
                            <td><span class="status-badge status-confirmed">${booking.status}</span></td>
                            <td><button class="btn btn-danger" style="padding: 8px 15px;" onclick="cancelBooking(${booking.id})">Cancel</button></td>
                        </tr>
                    `;
                });

                html += '</tbody></table>';
                container.innerHTML = html;
            })
            .catch(err => {
                container.innerHTML = '<p>Error loading bookings</p>';
                console.error(err);
            });
        }

        function cancelBooking(bookingId) {
            if (!confirm('Are you sure you want to cancel this booking?')) return;

            fetch(`http://localhost:5000/bookings/cancel/${bookingId}`, {
                method: 'DELETE'
            })
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success') {
                    const user = JSON.parse(sessionStorage.getItem('currentUser'));
                    alert('Booking cancelled successfully');
                    displayAvailableFlights();
                    displayMyBookings(user.id);
                } else {
                    alert('Cancellation failed');
                }
            })
            .catch(err => alert('Cancellation error: ' + err));
        }

        function addFlight() {
            const flightNumber = document.getElementById('flightNumber').value;
            const airline = document.getElementById('airline').value;
            const fromCity = document.getElementById('fromCity').value;
            const toCity = document.getElementById('toCity').value;
            const departureTime = document.getElementById('departureTime').value;
            const arrivalTime = document.getElementById('arrivalTime').value;
            const price = parseInt(document.getElementById('price').value);
            const availableSeats = parseInt(document.getElementById('seats').value);

            if (!flightNumber || !airline || !fromCity || !toCity || !departureTime || !arrivalTime || !price || !availableSeats) {
                alert('Please fill all fields');
                return;
            }

            fetch('http://localhost:5000/flights/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    flightNumber,
                    airline,
                    fromCity,
                    toCity,
                    departureTime,
                    arrivalTime,
                    price,
                    availableSeats
                })
            })
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success') {
                    alert('Flight added successfully');
                    document.getElementById('flightNumber').value = '';
                    document.getElementById('airline').value = '';
                    document.getElementById('fromCity').value = '';
                    document.getElementById('toCity').value = '';
                    document.getElementById('departureTime').value = '';
                    document.getElementById('arrivalTime').value = '';
                    document.getElementById('price').value = '';
                    document.getElementById('seats').value = '';

                    displayAllFlights();
                    updateAdminStats();
                } else {
                    alert('Error adding flight');
                }
            })
            .catch(err => alert('Error: ' + err));
        }

        function displayAllFlights() {
            const container = document.getElementById('allFlights');
            container.innerHTML = '<p>Loading flights...</p>';

            fetch('http://localhost:5000/flights')
            .then(res => res.json())
            .then(flights => {
                let html = '<table><thead><tr><th>Flight No.</th><th>Airline</th><th>Route</th><th>Departure</th><th>Price</th><th>Seats</th><th>Action</th></tr></thead><tbody>';

                flights.forEach(flight => {
                    html += `
                        <tr>
                            <td>${flight.flightNumber}</td>
                            <td>${flight.airline}</td>
                            <td>${flight.fromCity} → ${flight.toCity}</td>
                            <td>${new Date(flight.departureTime).toLocaleString()}</td>
                            <td>₹${flight.price}</td>
                            <td>${flight.availableSeats}</td>
                            <td><button class="btn btn-danger" style="padding: 8px 15px;" onclick="deleteFlight(${flight.id})">Delete</button></td>
                        </tr>
                    `;
                });

                html += '</tbody></table>';
                container.innerHTML = html;
            })
            .catch(err => {
                container.innerHTML = '<p>Error loading flights</p>';
                console.error(err);
            });
        }

        function deleteFlight(flightId) {
            if (!confirm('Are you sure you want to delete this flight?')) return;

            fetch(`http://localhost:5000/flights/delete/${flightId}`, {
                method: 'DELETE'
            })
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success') {
                    alert('Flight deleted successfully');
                    displayAllFlights();
                    updateAdminStats();
                } else {
                    alert('Error deleting flight');
                }
            })
            .catch(err => alert('Error: ' + err));
        }

        function displayAllBookings() {
            const container = document.getElementById('allBookings');
            container.innerHTML = '<p>Loading bookings...</p>';

            fetch('http://localhost:5000/bookings')
            .then(res => res.json())
            .then(bookings => {
                if (!bookings || bookings.length === 0) {
                    container.innerHTML = '<p>No bookings found.</p>';
                    return;
                }

                let html = '<table><thead><tr><th>Booking ID</th><th>Passenger Name</th><th>Email</th><th>Flight</th><th>Route</th><th>Booking Date</th><th>Status</th></tr></thead><tbody>';

                bookings.forEach(booking => {
                    html += `
                        <tr>
                            <td>#${booking.id}</td>
                            <td>${booking.passengerName || 'N/A'}</td>
                            <td>${booking.passengerEmail || 'N/A'}</td>
                            <td>${booking.flightNumber || 'N/A'}</td>
                            <td>${booking.fromCity && booking.toCity ? booking.fromCity + ' → ' + booking.toCity : 'N/A'}</td>
                            <td>${new Date(booking.bookingDate).toLocaleString()}</td>
                            <td><span class="status-badge status-confirmed">${booking.status}</span></td>
                        </tr>
                    `;
                });

                html += '</tbody></table>';
                container.innerHTML = html;
            })
            .catch(err => {
                container.innerHTML = '<p>Error loading bookings</p>';
                console.error(err);
            });
        }

        function updateAdminStats() {
            Promise.all([
                fetch('http://localhost:5000/flights').then(r => r.json()),
                fetch('http://localhost:5000/bookings').then(r => r.json()),
                fetch('http://localhost:5000/passengers/count').then(r => r.json())
            ])
            .then(([flights, bookings, passengers]) => {
                document.getElementById('totalFlights').textContent = flights.length;
                document.getElementById('totalBookings').textContent = bookings.length;
                document.getElementById('totalPassengers').textContent = passengers.totalPassengers || 0;
            })
            .catch(err => console.error('Error fetching stats:', err));
        }

        // Initialize on page load
        window.onload = function() {
            initDB();

            // Check if user is already logged in
            const userType = sessionStorage.getItem('userType');
            if (userType === 'passenger') {
                const user = JSON.parse(sessionStorage.getItem('currentUser'));
                showPassengerDashboard(user);
            } else if (userType === 'admin') {
                showAdminDashboard();
            }
        };
  