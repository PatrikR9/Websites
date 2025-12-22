const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { TableClient } = require("@azure/data-tables");
const { randomUUID } = require('crypto');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.')); // Serve static files (HTML, CSS, JS)

// Azure Configuration
const connectionString = "DefaultEndpointsProtocol=https;AccountName=salondesign;AccountKey=GT+uOL03B8cLVa8jfx+j2/uoxrvWlrRRbn6gbKKWH73hYg/4NXqpfSHkpmrn432LfamXyYGRn+hS+AStDb5OfA==;EndpointSuffix=core.windows.net";
const tableName = "orders";
const tableClient = TableClient.fromConnectionString(connectionString, tableName);

// Ensure table exists to make it truly automatic
tableClient.createTable().catch(err => { console.log("Table check/create:", err.message); });

app.post('/api/booking', async (req, res) => {
    try {
        const bookingData = req.body;
        console.log("Received booking:", bookingData.name);

        // Prepare entity for Azure Table
        // PartitionKey: We'll use the Date of the appointment (e.g., "2025-05-20") to group bookings by day.
        // RowKey: Unique ID for the booking.
        const entity = {
            partitionKey: bookingData.date || "General",
            rowKey: randomUUID(),
            name: bookingData.name,
            surname: bookingData.surname || "",
            phone: bookingData.phone,
            email: bookingData.email,
            persons: bookingData.persons,
            date: bookingData.date, // Explicitly save date as column
            time: bookingData.time,
            note: bookingData.note,
            selections: JSON.stringify(bookingData.selections),
            timestamp: new Date(),
            status: "New"
        };

        // We can also store individual service summaries if we want easier querying
        // e.g., serviceSummary: "Pánský střih, URS Kúra"
        const summary = bookingData.selections.map(s => s.service).join(", ");
        entity.serviceSummary = summary;

        await tableClient.createEntity(entity);
        console.log("Booking saved to Azure Table.");

        res.status(200).json({ message: "Booking received and saved." });
    } catch (error) {
        console.error("Error saving to Azure:", error.message);
        res.status(500).json({ error: "Failed to save booking." });
    }
});

app.get('/', (req, res) => {
    res.send('Salon Design Local Server is Running');
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
