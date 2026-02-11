const API_URL = '/api';

// Fetch and display attendees
async function fetchAttendees() {
    const listContainer = document.getElementById('attendanceList');
    try {
        const response = await fetch(`${API_URL}/attendees`);
        if (!response.ok) throw new Error('Failed to fetch attendees');

        const attendees = await response.json();

        listContainer.innerHTML = '';

        const list = document.createElement('ul');

        // Simple iteration over object entries, no sorting
        for (const [name, count] of Object.entries(attendees)) {
            const item = document.createElement('li');
            item.textContent = `${name}: ${count}`;
            list.appendChild(item);
        }
        listContainer.appendChild(list);
    } catch (error) {
        console.error('Error fetching attendees:', error);
        listContainer.textContent = 'Failed to load attendees.';
    }
}

// Handle Check-In
async function checkIn() {
    const nameInput = document.getElementById('nameInput');
    const name = nameInput.value.trim();

    if (!name) {
        alert('Please enter a name');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/checkin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
        });

        if (response.ok) {
            nameInput.value = '';
            await fetchAttendees();
        } else {
            const data = await response.json();
            alert(data.error || 'Check-in failed');
        }
    } catch (error) {
        console.error('Error checking in:', error);
        alert('An error occurred. Please try again.');
    }
}

// Load attendees on page load
document.addEventListener('DOMContentLoaded', fetchAttendees);
