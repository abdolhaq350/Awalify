// إدارة القائمة الجانبية (Classic JS - مضمون 100%)
const menuBtn = document.getElementById('menuBtn');
const closeMenuBtn = document.getElementById('closeMenuBtn');
const sideMenu = document.getElementById('sideMenu');
const overlay = document.getElementById('overlay');

function toggleMenu(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    if (sideMenu && overlay) {
        sideMenu.classList.toggle('-translate-x-full');
        overlay.classList.toggle('hidden');
    }
}

if (menuBtn) {
    menuBtn.onclick = toggleMenu;
}
if (closeMenuBtn) {
    closeMenuBtn.onclick = toggleMenu;
}
if (overlay) {
    overlay.onclick = toggleMenu;
}
