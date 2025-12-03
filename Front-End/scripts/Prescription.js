// Function to open the prescription modal
function openModal() {
    const modal = document.getElementById('prescriptionModal');
    modal.classList.add('active');
    // Optional: Hide scrollbar on the body when modal is open
    document.body.style.overflow = 'hidden';
}

// Function to close the prescription modal
function closeModal() {
    const modal = document.getElementById('prescriptionModal');
    modal.classList.remove('active');
    // Optional: Restore scrollbar
    document.body.style.overflow = 'auto';
}

// Function to show the download success toast message
function showDownloadSuccess() {
    const toast = document.getElementById('downloadToast');
    
    // 1. Show the toast
    toast.classList.add('show');
    
    // 2. Hide the toast after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ===================================
// Event Listeners for Table Icons
// ===================================

document.addEventListener('DOMContentLoaded', () => {
    // Select all the 'view file' icons (first icon in the <td>)
    const viewIcons = document.querySelectorAll('.medical-records-table .fa-file-alt');
    
    // Select all the 'download' icons (second icon in the <td>)
    const downloadIcons = document.querySelectorAll('.medical-records-table .fa-download');

    // Add event listener to each view icon
    viewIcons.forEach(icon => {
        icon.addEventListener('click', openModal);
    });

    // Add event listener to each download icon
    downloadIcons.forEach(icon => {
        icon.addEventListener('click', showDownloadSuccess);
    });

    // Optional: Close modal when clicking outside the content area
    const modal = document.getElementById('prescriptionModal');
    modal.addEventListener('click', (event) => {
        if (event.target.id === 'prescriptionModal') {
            closeModal();
        }
    });
});