const home = document.getElementById("home");
const settings = document.getElementById("settings");
const addNotePage = document.getElementById("add-note");
const viewNotePage = document.getElementById("view-note");
const noteList = document.getElementById("note-list");
const addBtn = document.getElementById("add-btn");
const backSettings = document.getElementById("back-settings");
const settingsBtn = document.getElementById("settings-btn");
const darkToggle = document.getElementById("dark-mode-toggle");
const backAdd = document.getElementById("back-add");
const saveNoteBtn = document.getElementById("save-note");
const noteTitle = document.getElementById("note-title");
const noteContent = document.getElementById("note-content");
const moodBtn = document.getElementById("mood-btn");
const searchInput = document.getElementById("search");
const backView = document.getElementById("back-view");
const viewTitle = document.getElementById("view-title");
const viewMood = document.getElementById("view-mood");
const viewContent = document.getElementById("view-content");
const editBtn = document.getElementById("edit-note");
const saveEditBtn = document.getElementById("save-edit");
const deleteBtn = document.getElementById("delete-note");
const feedbackBtn = document.getElementById("feedback-btn");
const themeBtn = document.getElementById("theme-btn");

const moodModal = document.getElementById("mood-modal");
const deleteModal = document.getElementById("delete-modal");
const validationModal = document.getElementById("validation-modal");
const feedbackModal = document.getElementById("feedback-modal");
const themeModal = document.getElementById("theme-modal");
const optionsModal = document.getElementById("options-modal");

const customDateBtn = document.getElementById("custom-date-btn");
const dateModal = document.getElementById("date-modal");
const customDateInput = document.getElementById("custom-date");
const customTimeInput = document.getElementById("custom-time");
const saveDateBtn = document.getElementById("save-date-btn");

const pinOption = document.getElementById("pin-option");
const deleteOption = document.getElementById("delete-option");

let currentViewId = null;
let currentMood = "😙";
let isEditing = false;
let longPressTimer;
let currentLongPressId = null;

function formatContent(content) {
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    const emailPattern = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/g;
    const phonePattern = /(\+?[\d\s\-()]{10,})/g;
    
    let formattedContent = content;
    formattedContent = formattedContent.replace(urlPattern, '<a href="$1" target="_blank">$1</a>');
    formattedContent = formattedContent.replace(emailPattern, '<a href="mailto:$1">$1</a>');
    formattedContent = formattedContent.replace(phonePattern, '<a href="tel:$1">$1</a>');
    
    return formattedContent;
}

function getPlainText(content) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    return tempDiv.textContent || tempDiv.innerText || '';
}

function show(element) {
    home.classList.add("hidden");
    settings.classList.add("hidden");
    addNotePage.classList.add("hidden");
    viewNotePage.classList.add("hidden");
    element.classList.remove("hidden");
}

function formatDate(dateString) {
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('id-ID', options);
}

function refreshNotes() {
    getAllNotes((notes) => {
        noteList.innerHTML = "";
        const searchTerm = searchInput.value.toLowerCase();
        const filteredNotes = notes.filter(n => 
            n.title.toLowerCase().includes(searchTerm) || 
            n.content.toLowerCase().includes(searchTerm)
        );
        
        if (notes.length === 0) {
            noteList.innerHTML = `
                <div class="empty-state">
                    <p><i class="fas fa-edit"></i> Buat catatanmu sekarang</p>
                </div>
            `;
            return;
        }
        
        if (filteredNotes.length === 0) {
            noteList.innerHTML = `
                <div class="empty-state">
                    <p><i class="fas fa-search"></i> Tidak ada catatan yang ditemukan</p>
                </div>
            `;
            return;
        }

        const pinnedNotes = filteredNotes.filter(note => note.pinned);
        const unpinnedNotes = filteredNotes.filter(note => !note.pinned);
        const sortedNotes = [...pinnedNotes, ...unpinnedNotes];
        
        sortedNotes.forEach(note => {
            let div = document.createElement("div");
            div.className = "note-card";
            if (note.pinned) {
                div.classList.add('pinned');
            }
            
            const plainContent = getPlainText(note.content);
            
            div.innerHTML = `
                <div class="note-header">
                    <h3 class="note-title">${note.title}</h3>
                    <div class="note-mood">
                        ${note.mood}
                        ${note.pinned ? '<i class="fas fa-thumbtack pin-indicator"></i>' : ''}
                    </div>
                </div>
                <p class="note-content">${plainContent}</p>
                <p class="note-date"><i class="far fa-clock"></i> ${formatDate(note.date)}</p>
            `;
            div.dataset.id = note.id;

            div.addEventListener("click", () => {
                if (currentLongPressId) {
                    currentLongPressId = null;
                    return;
                }
                currentViewId = note.id;
                viewTitle.textContent = note.title;
                viewMood.textContent = note.mood;
                viewContent.innerHTML = formatContent(note.content);
                editBtn.disabled = false;
                customDateBtn.disabled = true;
                saveEditBtn.disabled = true;
                isEditing = false;
                show(viewNotePage);
            });

            div.addEventListener('mousedown', startLongPress);
            div.addEventListener('touchstart', startLongPress);
            div.addEventListener('mouseup', cancelLongPress);
            div.addEventListener('touchend', cancelLongPress);
            div.addEventListener('mouseleave', cancelLongPress);
            
            noteList.appendChild(div);
        });
    });
}

function showModal(modal) {
    modal.classList.remove('hidden');
}

function hideModal(modal) {
    modal.classList.add('hidden');
}

function getNoteById(id) {
    let notes = JSON.parse(localStorage.getItem('notes') || '[]');
    return notes.find(n => n.id === parseInt(id));
}

function startLongPress(e) {
    const noteId = e.currentTarget.dataset.id;
    longPressTimer = setTimeout(() => {
        currentLongPressId = noteId;
        showOptionsModal(noteId);
    }, 500);
}

function cancelLongPress() {
    clearTimeout(longPressTimer);
}

function showOptionsModal(noteId) {
    const note = getNoteById(noteId);
    if (note) {
        if (note.pinned) {
            pinOption.innerHTML = '<i class="fas fa-thumbtack"></i><span>Unpin</span>';
        } else {
            pinOption.innerHTML = '<i class="fas fa-thumbtack"></i><span>Pin</span>';
        }
        currentLongPressId = noteId;
        showModal(optionsModal);
    }
}

addBtn.onclick = () => { 
    noteTitle.value = ""; 
    noteContent.value = ""; 
    currentMood = "😙";
    moodBtn.textContent = currentMood;
    show(addNotePage); 
};

backSettings.onclick = () => show(home);
settingsBtn.onclick = () => show(settings);
backAdd.onclick = () => show(home);

darkToggle.checked = false;
document.body.classList.remove("dark");

darkToggle.onchange = () => {
    document.body.classList.toggle("dark");
    localStorage.setItem("darkMode", document.body.classList.contains("dark"));
};

saveNoteBtn.onclick = () => {
    if (!noteTitle.value.trim()) {
        showModal(validationModal);
        return;
    }
    
    addNote({
        title: noteTitle.value, 
        content: noteContent.value, 
        mood: currentMood, 
        date: new Date(),
        pinned: false
    }, () => {
        show(home);
        refreshNotes();
    });
};

searchInput.addEventListener('input', () => {
    refreshNotes();
});

backView.onclick = () => {
    if (isEditing) {
        cancelEdit();
    } else {
        show(home);
    }
};

moodBtn.onclick = () => {
    showModal(moodModal);
};

document.querySelectorAll('.mood-option').forEach(option => {
    option.addEventListener("click", () => {
        currentMood = option.dataset.mood;
        moodBtn.textContent = currentMood;
        hideModal(moodModal);
    });
});

function cancelEdit() {
    const note = getNoteById(currentViewId);
    if (note) {
        viewTitle.textContent = note.title;
        viewMood.textContent = note.mood;
        viewContent.innerHTML = formatContent(note.content);
    }
    
    const editTitle = document.getElementById("edit-title");
    const editContent = document.getElementById("edit-content");
    const editMoodBtn = document.getElementById("edit-mood-btn");
    
    if (editTitle && editContent && editMoodBtn) {
        editTitle.replaceWith(viewTitle);
        editContent.replaceWith(viewContent);
        editMoodBtn.replaceWith(viewMood);
    }
    
    isEditing = false;
    editBtn.disabled = false;
    customDateBtn.disabled = true;
    saveEditBtn.disabled = true;
}

editBtn.onclick = () => {
    if (isEditing) return;
    
    isEditing = true;
    const currentTitle = viewTitle.textContent;
    const currentContent = getPlainText(viewContent.innerHTML);
    const currentMoodValue = viewMood.textContent;
    
    const editTitle = document.createElement("input");
    editTitle.type = "text";
    editTitle.value = currentTitle;
    editTitle.id = "edit-title";
    editTitle.className = "edit-input";
    
    const editContent = document.createElement("textarea");
    editContent.value = currentContent;
    editContent.id = "edit-content";
    editContent.className = "edit-textarea";
    
    const editMoodBtn = document.createElement("button");
    editMoodBtn.className = "icon-btn";
    editMoodBtn.textContent = currentMoodValue;
    editMoodBtn.id = "edit-mood-btn";
    
    viewTitle.replaceWith(editTitle);
    viewContent.replaceWith(editContent);
    viewMood.replaceWith(editMoodBtn);
    
    editBtn.disabled = true;
    customDateBtn.disabled = false;
    saveEditBtn.disabled = false;
    
    editMoodBtn.onclick = () => {
        showModal(moodModal);
        
        document.querySelectorAll('.mood-option').forEach(option => {
            option.addEventListener("click", function handler() {
                editMoodBtn.textContent = this.dataset.mood;
                hideModal(moodModal);
                document.querySelectorAll('.mood-option').forEach(opt => opt.removeEventListener("click", handler));
            });
        });
    };
};

customDateBtn.onclick = () => {
    const note = getNoteById(currentViewId);
    if (note) {
        const noteDate = new Date(note.date);
        const dateString = noteDate.toISOString().split('T')[0];
        const timeString = noteDate.toTimeString().slice(0,5);
        customDateInput.value = dateString;
        customTimeInput.value = timeString;
    }
    showModal(dateModal);
};

saveDateBtn.onclick = () => {
    const date = customDateInput.value;
    const time = customTimeInput.value;
    if (date && time) {
        const newDate = new Date(`${date}T${time}`);
        const note = getNoteById(currentViewId);
        if (note) {
            note.date = newDate;
            updateNote(note, () => {
                hideModal(dateModal);
                viewTitle.textContent = note.title;
                viewMood.textContent = note.mood;
                viewContent.innerHTML = formatContent(note.content);
                show(home);
                refreshNotes();
            });
        }
    } else {
        const validationMessage = document.getElementById("validation-message");
        validationMessage.textContent = "Harap isi tanggal dan waktu!";
        showModal(validationModal);
    }
};

saveEditBtn.onclick = () => {
    const editTitle = document.getElementById("edit-title");
    const editContent = document.getElementById("edit-content");
    const editMoodBtn = document.getElementById("edit-mood-btn");
    
    if (!editTitle.value.trim()) {
        showModal(validationModal);
        return;
    }
    
    const updated = {
        id: parseInt(currentViewId),
        title: editTitle.value,
        content: editContent.value,
        mood: editMoodBtn.textContent,
        date: new Date()
    };
    
    updateNote(updated, () => {
        show(home);
        refreshNotes();
    });
};

deleteBtn.onclick = () => {
    showModal(deleteModal);
};

feedbackBtn.onclick = () => {
    showModal(feedbackModal);
};

themeBtn.onclick = () => {
    showModal(themeModal);
};

pinOption.addEventListener('click', () => {
    togglePinNote(currentLongPressId, (error) => {
        if (error) {
            const validationMessage = document.getElementById("validation-message");
            validationMessage.textContent = error.message;
            showModal(validationModal);
        } else {
            hideModal(optionsModal);
            refreshNotes();
        }
    });
});

deleteOption.addEventListener('click', () => {
    hideModal(optionsModal);
    showModal(deleteModal);
});

document.querySelectorAll('.contact-item').forEach(item => {
    item.addEventListener('click', () => {
        const type = item.dataset.type;
        if (type === 'email') {
            window.location.href = "mailto:dwigaming271@gmail.com?subject=Umpan%20balik%20untuk%20aplikasi%20Journal-App&body=Hai%20tim%20developer!%0A%0ASaya%20ingin%20menyampaikan%20feedback%20saya%2C%20menurut%20saya%20update%2Fperbaiki%20sesuai%20rekomendasi%20saya.%0A%0A(Isi%20saran%20perbaikan%2Fupdate%20disini)%0A%0ATerima%20kasih%20telah%20menciptakan%20aplikasi%20ini%2C%20aplikasi%20ini%20pasti%20sangat%20berarti%20bagi%20masa%20depan.%0A%0ASalam%20dari%20pengguna.";
        } else if (type === 'whatsapp') {
            const phoneNumber = "+6287863719127";
            const message = "Hai tim pengembang! sqya ingin memveri umpan balik tentang aplikasi Journal-App (tulis saran perbaikan/update disini) daya berterima kasih telah menciptakan aplikasi ini. Salam dari pengguna.";
            const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
        }
        hideModal(feedbackModal);
    });
});

document.querySelectorAll('.theme-option').forEach(option => {
    option.addEventListener('click', () => {
        const theme = option.dataset.theme;
        
        document.querySelectorAll('.theme-option').forEach(opt => {
            opt.classList.remove('selected');
        });
        
        option.classList.add('selected');
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('appTheme', theme);
        
        setTimeout(() => {
            hideModal(themeModal);
        }, 500);
    });
});

document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal');
        hideModal(modal);
    });
});

document.querySelectorAll('.cancel-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal');
        hideModal(modal);
    });
});

document.querySelector('#delete-modal .confirm-btn').addEventListener('click', () => {
    const idToDelete = currentLongPressId ? currentLongPressId : currentViewId;
    deleteNote(idToDelete, () => {
        hideModal(deleteModal);
        show(home);
        refreshNotes();
        currentLongPressId = null;
    });
});

document.querySelector('#validation-modal .confirm-btn').addEventListener('click', () => {
    hideModal(validationModal);
});

document.querySelector('#date-modal .cancel-btn').addEventListener('click', () => {
    hideModal(dateModal);
});

document.querySelector('#options-modal .cancel-btn').addEventListener('click', () => {
    hideModal(optionsModal);
    currentLongPressId = null;
});

moodModal.addEventListener('click', (e) => {
    if (e.target === moodModal) {
        hideModal(moodModal);
    }
});

document.querySelectorAll('.modal').forEach(modal => {
    if (modal !== moodModal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                hideModal(modal);
                if (modal === optionsModal) {
                    currentLongPressId = null;
                }
            }
        });
    }
});

window.onload = () => {
    const darkMode = localStorage.getItem("darkMode") === "true";
    if (darkMode) {
        document.body.classList.add("dark");
        darkToggle.checked = true;
    } else {
        document.body.classList.remove("dark");
        darkToggle.checked = false;
    }
    
    const savedTheme = localStorage.getItem('appTheme') || 'blue';
    document.body.setAttribute('data-theme', savedTheme);
    
    document.querySelectorAll('.theme-option').forEach(option => {
        if (option.dataset.theme === savedTheme) {
            option.classList.add('selected');
        }
    });
    
    refreshNotes();
};