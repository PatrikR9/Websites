const { TableClient } = require("@azure/data-tables");

const connectionString = "DefaultEndpointsProtocol=https;AccountName=salondesign;AccountKey=GT+uOL03B8cLVa8jfx+j2/uoxrvWlrRRbn6gbKKWH73hYg/4NXqpfSHkpmrn432LfamXyYGRn+hS+AStDb5OfA==;EndpointSuffix=core.windows.net";
const tableName = "orders";

async function readOrders() {
    console.log(`Reading from table: ${tableName}`);
    const client = TableClient.fromConnectionString(connectionString, tableName);

    try {
        let count = 0;
        const entities = client.listEntities();
        for await (const entity of entities) {
            console.log(`[${count++}] Name: ${entity.name}, Date: ${entity.date}, PK: ${entity.partitionKey}, RowKey: ${entity.rowKey}, Status: ${entity.status}`);
        }
        if (count === 0) {
            console.log("No entities found in the table.");
        } else {
            console.log(`Total entities: ${count}`);
        }
    } catch (err) {
        console.error("Error reading table:", err.message);
    }
}

readOrders();
