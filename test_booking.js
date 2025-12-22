// Native fetch is available in Node 18+
// Actually Node 20 has native fetch.

async function testBooking() {
    try {
        const response = await fetch('http://localhost:3000/api/booking', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: "Test User",
                date: "2025-05-25",
                time: "10:00",
                persons: 1,
                selections: [{ category: 'Test', service: 'Test Service', price: '100 Kc' }]
            })
        });

        if (response.ok) {
            console.log("SUCCESS: Server returned 200 OK");
        } else {
            console.log("FAILURE: Server returned", response.status);
            const text = await response.text();
            console.log(text);
        }
    } catch (err) {
        console.error("ERROR:", err.message);
    }
}

testBooking();
