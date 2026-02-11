/**
 * Base URL for the API endpoints.
 * All requests to the backend will be prefixed with this path.
 */
const API_URL = '/api';

/**
 * Fetches the current list of attendees from the server and updates the UI.
 * 
 * Flow:
 * 1. Clears the current list.
 * 2. Fetches data from GET /api/attendees.
 * 3. Iterates through the returned object and creates list items.
 * 4. Appends the new list to the DOM.
 */
async function fetchAttendees() {
    const listContainer = document.getElementById('attendanceList');
    try {
        const response = await fetch(`${API_URL}/attendees`);

        // Throw error if the response status is not 200-299
        if (!response.ok) throw new Error('Failed to fetch attendees');

        const attendees = await response.json();

        // Clear the current list to avoid duplicates
        listContainer.innerHTML = '';

        // Create a new unordered list element
        const list = document.createElement('ul');

        // Iterate over the attendees object entries
        // entry[0] is the name, entry[1] is the count
        // Note: Object.entries does not guarantee order, but typically follows insertion order for strings
        for (const [name, count] of Object.entries(attendees)) {
            const item = document.createElement('li');
            item.textContent = `${name}: ${count}`;
            list.appendChild(item);
        }

        // Mount the constructed list to the container
        listContainer.appendChild(list);
    } catch (error) {
        // Log error to console for debugging
        console.error('Error fetching attendees:', error);
        // Display user-friendly error message in the UI
        listContainer.textContent = 'Failed to load attendees.';
    }
}

/**
 * Handles the Check-In process when the user clicks the button.
 * 
 * Flow:
 * 1. Retrieves and sanitizes input.
 * 2. Validates that the name is not empty.
 * 3. Sends a POST request to /api/checkin.
 * 4. On success: Clears input and refreshes the list.
 * 5. On failure: Alerts the error message.
 */
async function checkIn() {
    const nameInput = document.getElementById('nameInput');
    const name = nameInput.value.trim();

    // Validation: Ensure name is not empty string
    if (!name) {
        alert('Please enter a name');
        return; // Stop execution
    }

    try {
        // Execute POST request to check in the user
        const response = await fetch(`${API_URL}/checkin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }, // content-type must be JSON
            body: JSON.stringify({ name }) // Send name in JSON body
        });

        if (response.ok) {
            nameInput.value = '';
            await fetchAttendees();
        } else {
            // Server returned an error (e.g., 400 Bad Request)
            const data = await response.json();
            alert(data.error || 'Check-in failed');
        }
    } catch (error) {
        // Network errors or JSON parsing errors
        console.error('Error checking in:', error);
        alert('An error occurred. Please try again.');
    }
}

// Event Listener: Initialize the application once the DOM is ready
// This ensures all elements (like 'attendanceList') exist before we try to access them
document.addEventListener('DOMContentLoaded', fetchAttendees);
