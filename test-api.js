// Simple test for the outer karton API
const testData = {
    lieferscheinNumber: "TEST123",
    entries: [
        {
            artikelnummer: "TEST001",
            artikelbezeichnung: "Test Artikel",
            menge: 1,
            serialnummer: "SN123456"
        }
    ]
};

fetch('http://localhost:5174/api/outerkarton', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(testData)
})
.then(response => response.json())
.then(data => {
    console.log('Response:', data);
})
.catch(error => {
    console.error('Error:', error);
});
