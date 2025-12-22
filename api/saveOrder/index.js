const { TableClient } = require("@azure/data-tables");
const { randomUUID } = require('crypto');

// It's best practice to use process.env.AzureWebJobsStorage but we'll use the string for now as migrated.
const connectionString = "DefaultEndpointsProtocol=https;AccountName=salondesign;AccountKey=GT+uOL03B8cLVa8jfx+j2/uoxrvWlrRRbn6gbKKWH73hYg/4NXqpfSHkpmrn432LfamXyYGRn+hS+AStDb5OfA==;EndpointSuffix=core.windows.net";
const tableName = "orders";
const tableClient = TableClient.fromConnectionString(connectionString, tableName);

module.exports = async function (context, req) {
    context.log('Processing booking request.');

    try {
        // Ensure table exists on first run (optional but good for safety)
        await tableClient.createTable().catch(err => context.log("Table check:", err.message));

        const bookingData = req.body;

        if (!bookingData || !bookingData.name) {
            context.res = {
                status: 400,
                body: "Invalid booking data"
            };
            return;
        }

        const entity = {
            partitionKey: bookingData.date || "General",
            rowKey: randomUUID(),
            name: bookingData.name,
            surname: bookingData.surname || "",
            phone: bookingData.phone,
            email: bookingData.email,
            persons: bookingData.persons,
            date: bookingData.date,
            time: bookingData.time,
            note: bookingData.note,
            selections: JSON.stringify(bookingData.selections),
            timestamp: new Date(),
            status: "New"
        };

        await tableClient.createEntity(entity);

        context.res = {
            status: 200,
            body: { message: "Booking saved successfully" }
        };

    } catch (error) {
        context.log.error("Error saving to Azure:", error);
        context.res = {
            status: 500,
            body: "Internal Server Error"
        };
    }
}
