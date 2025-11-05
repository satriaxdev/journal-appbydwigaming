function getAllNotes(callback) {
    try {
        const notes = JSON.parse(localStorage.getItem('notes') || '[]');
        notes.sort((a, b) => new Date(b.date) - new Date(a.date));
        callback(notes);
    } catch (error) {
        console.error('Error getting notes:', error);
        callback([]);
    }
}

function addNote(note, callback) {
    try {
        const notes = JSON.parse(localStorage.getItem('notes') || '[]');
        note.id = Date.now();
        note.pinned = note.pinned || false;
        notes.unshift(note);
        localStorage.setItem('notes', JSON.stringify(notes));
        if (typeof callback === 'function') callback();
    } catch (error) {
        console.error('Error adding note:', error);
        if (typeof callback === 'function') callback();
    }
}

function updateNote(updatedNote, callback) {
    try {
        const notes = JSON.parse(localStorage.getItem('notes') || '[]');
        const index = notes.findIndex(n => n.id === updatedNote.id);
        if (index !== -1) {
            notes[index] = { ...notes[index], ...updatedNote };
            localStorage.setItem('notes', JSON.stringify(notes));
        }
        if (typeof callback === 'function') callback();
    } catch (error) {
        console.error('Error updating note:', error);
        if (typeof callback === 'function') callback();
    }
}

function deleteNote(id, callback) {
    try {
        const notes = JSON.parse(localStorage.getItem('notes') || '[]');
        const filteredNotes = notes.filter(n => n.id !== parseInt(id));
        localStorage.setItem('notes', JSON.stringify(filteredNotes));
        if (typeof callback === 'function') callback();
    } catch (error) {
        console.error('Error deleting note:', error);
        if (typeof callback === 'function') callback();
    }
}

function togglePinNote(id, callback) {
    try {
        const notes = JSON.parse(localStorage.getItem('notes') || '[]');
        const index = notes.findIndex(n => n.id === parseInt(id));
        if (index !== -1) {
            if (!notes[index].pinned) {
                const pinnedCount = notes.filter(n => n.pinned).length;
                if (pinnedCount >= 3) {
                    if (typeof callback === 'function') callback(new Error('Pin catatan maksimal 3'));
                    return;
                }
            }
            notes[index].pinned = !notes[index].pinned;
            localStorage.setItem('notes', JSON.stringify(notes));
            if (typeof callback === 'function') callback(null);
        } else {
            if (typeof callback === 'function') callback(new Error('Catatan tidak ditemukan'));
        }
    } catch (error) {
        console.error('Error toggling pin note:', error);
        if (typeof callback === 'function') callback(error);
    }
}

function initDB(callback) {
    try {
        const notes = JSON.parse(localStorage.getItem('notes') || '[]');
        let changed = false;
        notes.forEach(note => {
            if (note.pinned === undefined) {
                note.pinned = false;
                changed = true;
            }
        });
        if (changed) {
            localStorage.setItem('notes', JSON.stringify(notes));
        }
        if (typeof callback === 'function') {
            setTimeout(callback, 0);
        }
    } catch (error) {
        console.error('Error initializing database:', error);
        if (typeof callback === 'function') {
            setTimeout(callback, 0);
        }
    }
}

initDB();