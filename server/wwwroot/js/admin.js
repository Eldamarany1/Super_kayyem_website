// Super Kayyem Admin Panel — JavaScript

// Close sidebar on mobile when clicking a link
document.querySelectorAll('.sidebar-link').forEach(link => {
    link.addEventListener('click', () => {
        if (window.innerWidth < 992) {
            document.querySelector('.admin-sidebar')?.classList.remove('show');
        }
    });
});

// Close sidebar when clicking outside on mobile
document.addEventListener('click', (e) => {
    const sidebar = document.querySelector('.admin-sidebar');
    const toggle = document.querySelector('.sidebar-toggle');
    if (window.innerWidth < 992 && sidebar?.classList.contains('show')) {
        if (!sidebar.contains(e.target) && !toggle?.contains(e.target)) {
            sidebar.classList.remove('show');
        }
    }
});
