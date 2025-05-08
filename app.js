// Notes functionality
let notes = [];

function saveNote(content) {
    const noteForm = document.getElementById('noteForm');
    const noteId = noteForm.getAttribute('data-note-id');
    
    if (noteId) { // This is an update operation
        const index = notes.findIndex(note => note.id === parseInt(noteId));
        if (index !== -1) {
            notes[index].content = content;
            notes[index].updatedAt = new Date();
            updateNotesList();
            localStorage.setItem('notes', JSON.stringify(notes));
            noteForm.classList.add('hidden');
            noteForm.removeAttribute('data-note-id');
            document.getElementById('saveNoteBtn').textContent = 'Save';
        }
    } else { // This is a new note
        const note = {
            id: Date.now(),
            content: content,
            createdAt: new Date()
        };
        notes.push(note);
        updateNotesList();
        localStorage.setItem('notes', JSON.stringify(notes));
    }
}

function updateNotesList() {
    const notesList = document.getElementById('notesList');
    notesList.innerHTML = '';
    
    notes.forEach(note => {
        const noteElement = document.createElement('div');
        noteElement.className = 'note-item';
        noteElement.innerHTML = `
            <p>${note.content}</p>
            <button onclick="editNote(${note.id})">Edit</button>
            <button onclick="deleteNote(${note.id})">Delete</button>
        `;
        notesList.appendChild(noteElement);
    });
}

function editNote(id) {
    const note = notes.find(note => note.id === id);
    if (note) {
        document.getElementById('noteContent').value = note.content;
        document.getElementById('noteForm').classList.remove('hidden');
        
        // Add a data attribute to identify this as an edit operation
        document.getElementById('noteForm').setAttribute('data-note-id', id);
        
        // Update the save button to show "Update" instead of "Save"
        const saveButton = document.getElementById('saveNoteBtn');
        const originalText = saveButton.textContent;
        saveButton.textContent = 'Update';
        
        // Add event listener to restore original text when cancel is clicked
        document.getElementById('cancelNoteBtn').addEventListener('click', () => {
            saveButton.textContent = originalText;
            document.getElementById('noteForm').removeAttribute('data-note-id');
        }, { once: true });
    }
}

function deleteNote(id) {
    notes = notes.filter(note => note.id !== id);
    updateNotesList();
    localStorage.setItem('notes', JSON.stringify(notes));
}

// Calendar functionality
let currentYear = 2025;
let selectedDate = null;
let events = [];

function initializeCalendar(year = 2025) {
    currentYear = year;
    document.getElementById('yearDisplay').textContent = year;
    
    const calendarGrid = document.getElementById('calendarGrid');
    calendarGrid.innerHTML = '';

    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                   'July', 'August', 'September', 'October', 'November', 'December'];

    months.forEach((month, monthIndex) => {
        const monthDiv = document.createElement('div');
        monthDiv.className = 'month-cell';
        
        // Create month header
        const monthHeader = document.createElement('div');
        monthHeader.className = 'month-header';
        monthHeader.innerHTML = `
            <h3>${month} ${year}</h3>
            <div class="weekdays">
                <span>Sun</span>
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
            </div>
        `;
        
        // Create days grid
        const daysGrid = document.createElement('div');
        daysGrid.className = 'days-grid';
        
        // Get first day of the month
        const firstDay = new Date(year, monthIndex, 1);
        const lastDay = new Date(year, monthIndex + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startDay = firstDay.getDay();
        
        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startDay; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'day-cell empty';
            daysGrid.appendChild(emptyCell);
        }
        
        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayCell = document.createElement('div');
            dayCell.className = 'day-cell';
            dayCell.textContent = day;
            
            const date = new Date(year, monthIndex, day);
            dayCell.setAttribute('data-date', date.toISOString().split('T')[0]);
            
            // Add event markers
            const eventsForDay = events.filter(event => 
                new Date(event.date).toDateString() === new Date(date).toDateString()
            );
            if (eventsForDay.length > 0) {
                const eventsDiv = document.createElement('div');
                eventsDiv.className = 'events-marker';
                eventsDiv.textContent = eventsForDay.length;
                dayCell.appendChild(eventsDiv);
            }
            
            dayCell.addEventListener('click', () => {
                selectDate(date);
            });
            
            daysGrid.appendChild(dayCell);
        }
        
        monthDiv.appendChild(monthHeader);
        monthDiv.appendChild(daysGrid);
        
        // Add events container
        const eventsContainer = document.createElement('div');
        eventsContainer.className = 'events-container';
        
        // Add existing events for this month
        const monthEvents = events.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate.getFullYear() === year && 
                   eventDate.getMonth() === monthIndex;
        });
        
        // Sort events by date and time
        monthEvents.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            if (dateA.toDateString() === dateB.toDateString()) {
                return a.time.localeCompare(b.time);
            }
            return dateA - dateB;
        });
        
        monthEvents.forEach(event => {
            const eventDiv = document.createElement('div');
            eventDiv.className = 'event-item';
            
            // Format the date
            const eventDate = new Date(event.date);
            const formattedDate = eventDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
            
            eventDiv.innerHTML = `
                <div class="event-date">${formattedDate}</div>
                <div class="event-time">${event.time}</div>
                <div class="event-title">${event.title}</div>
                <button onclick="deleteEvent('${event.id}')" class="delete-event">Delete</button>
            `;
            eventsContainer.appendChild(eventDiv);
        });
        
        monthDiv.appendChild(eventsContainer);
        
        calendarGrid.appendChild(monthDiv);
    });
}

function selectDate(date) {
    if (selectedDate) {
        const selectedCell = document.querySelector(`[data-date="${selectedDate.toISOString().split('T')[0]}"]`);
        if (selectedCell) {
            selectedCell.classList.remove('selected');
        }
    }
    
    selectedDate = date;
    const selectedCell = document.querySelector(`[data-date="${date.toISOString().split('T')[0]}"]`);
    if (selectedCell) {
        selectedCell.classList.add('selected');
    }
}

function addEvent() {
    if (!selectedDate) {
        alert('Please select a date first');
        return;
    }
    
    // Create a temporary div to hold the event form
    const eventForm = document.createElement('div');
    eventForm.className = 'event-form';
    eventForm.innerHTML = `
        <div class="event-form-container">
            <h3>Add Event</h3>
            <div class="form-group">
                <label for="eventTitle">Title:</label>
                <input type="text" id="eventTitle" required>
            </div>
            <div class="form-group">
                <label for="eventDate">Date:</label>
                <input type="date" id="eventDate" value="${selectedDate.toISOString().split('T')[0]}" required>
            </div>
            <div class="form-group">
                <label for="eventTime">Time:</label>
                <input type="time" id="eventTime" required>
            </div>
            <div class="form-group">
                <label for="eventDescription">Description:</label>
                <textarea id="eventDescription" rows="3"></textarea>
            </div>
            <div class="form-buttons">
                <button id="saveEvent">Save</button>
                <button id="cancelEvent">Cancel</button>
            </div>
        </div>
    `;
    
    // Add the form to the calendar container
    const calendarContainer = document.querySelector('.calendar-container');
    calendarContainer.appendChild(eventForm);
    
    // Focus on the title input
    document.getElementById('eventTitle').focus();
    
    // Save event when Save button is clicked
    document.getElementById('saveEvent').addEventListener('click', () => {
        const title = document.getElementById('eventTitle').value;
        const dateInput = document.getElementById('eventDate').value;
        const time = document.getElementById('eventTime').value;
        const description = document.getElementById('eventDescription').value;
        
        if (!title || !dateInput || !time) {
            alert('Please fill in all required fields');
            return;
        }
        
        // Create a proper date object
        const date = new Date(dateInput);
        
        const event = {
            id: Date.now().toString(),
            date: date.toISOString().split('T')[0],
            time: time,
            title: title,
            description: description
        };
        
        events.push(event);
        localStorage.setItem('events', JSON.stringify(events));
        initializeCalendar(currentYear);
        eventForm.remove();
    });
    
    // Cancel when Cancel button is clicked
    document.getElementById('cancelEvent').addEventListener('click', () => {
        eventForm.remove();
    });
}

function deleteEvent(eventId) {
    events = events.filter(event => event.id !== eventId);
    localStorage.setItem('events', JSON.stringify(events));
    initializeCalendar(currentYear);
}

// Load saved events on page load
document.addEventListener('DOMContentLoaded', () => {
    const savedEvents = localStorage.getItem('events');
    if (savedEvents) {
        events = JSON.parse(savedEvents);
    }
    
    // Initialize calendar
    initializeCalendar();
});

// Flashcards functionality
async function generateFlashcards() {
    const flashcardsList = document.getElementById('flashcardsList');
    flashcardsList.innerHTML = '';

    // For now, we'll just display a message
    // In a real implementation, this would call the OpenAI API
    flashcardsList.innerHTML = '<p>Flashcards will be generated based on your notes</p>';
}

// Pomodoro Timer
let timer;
let timeLeft = 25 * 60; // 25 minutes in seconds

function startTimer() {
    clearInterval(timer);
    timer = setInterval(updateTimer, 1000);
}

function stopTimer() {
    clearInterval(timer);
}

function updateTimer() {
    if (timeLeft <= 0) {
        stopTimer();
        alert('Time is up!');
        return;
    }
    
    timeLeft--;
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    document.querySelector('.timer-display').textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Event Listeners
document.getElementById('newNoteBtn').addEventListener('click', () => {
    document.getElementById('noteForm').classList.remove('hidden');
});

document.getElementById('saveNoteBtn').addEventListener('click', () => {
    const content = document.getElementById('noteContent').value;
    if (content.trim()) {
        saveNote(content);
        document.getElementById('noteContent').value = '';
        document.getElementById('noteForm').classList.add('hidden');
    }
});

document.getElementById('cancelNoteBtn').addEventListener('click', () => {
    document.getElementById('noteForm').classList.add('hidden');
});

document.getElementById('generateFlashcards').addEventListener('click', generateFlashcards);

document.getElementById('startTimer').addEventListener('click', startTimer);
document.getElementById('stopTimer').addEventListener('click', stopTimer);

document.getElementById('addEventBtn').addEventListener('click', addEvent);

document.getElementById('prevYear').addEventListener('click', () => {
    currentYear--;
    initializeCalendar(currentYear);
});

document.getElementById('nextYear').addEventListener('click', () => {
    currentYear++;
    initializeCalendar(currentYear);
});

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    // Load saved notes
    const savedNotes = localStorage.getItem('notes');
    if (savedNotes) {
        notes = JSON.parse(savedNotes);
        updateNotesList();
    }

    // Initialize calendar
    initializeCalendar();

    // Initialize pomodoro timer
    document.querySelector('.timer-display').textContent = '25:00';
});

// Tab switching
const navLinks = document.querySelectorAll('.main-nav a');
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Remove active class from all links
        navLinks.forEach(link => link.classList.remove('active'));
        
        // Add active class to clicked link
        e.target.classList.add('active');
        
        // Show corresponding tab content
        const targetId = e.target.getAttribute('href').substring(1);
        const tabContents = document.querySelectorAll('.tab-content');
        tabContents.forEach(content => {
            content.classList.remove('active');
            if (content.id === targetId) {
                content.classList.add('active');
            }
        });
    });
});
