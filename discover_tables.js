const { TableServiceClient } = require("@azure/data-tables");

const connectionString = "DefaultEndpointsProtocol=https;AccountName=salondesign;AccountKey=GT+uOL03B8cLVa8jfx+j2/uoxrvWlrRRbn6gbKKWH73hYg/4NXqpfSHkpmrn432LfamXyYGRn+hS+AStDb5OfA==;EndpointSuffix=core.windows.net";

async function listTables() {
    const serviceClient = TableServiceClient.fromConnectionString(connectionString);
    console.log("Listing tables...");
    for await (const table of serviceClient.listTables()) {
        console.log(`- ${table.name}`);
    }
}

listTables().catch((err) => {
    console.error("Error listing tables:", err.message);
});
