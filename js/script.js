function toggleSubcategories(element) {
    const subList = element.querySelector('.sub-list');
    const allSubLists = document.querySelectorAll('.sub-list');

    // Cierra todas las subcategorías
    allSubLists.forEach(list => {
        if (list !== subList) {
            list.style.display = "none";
        }
    });

    // Alterna la visibilidad de la subcategoría actual
    if (subList.style.display === "none" || subList.style.display === "") {
        subList.style.display = "block";
    } else {
        subList.style.display = "none";
    }
}
// Lógica para el pop-up
const popups = document.querySelectorAll('.info-popup');
const popup = document.getElementById('popup');
const popupText = document.getElementById('popup-text');
const closeBtn = document.querySelector('.close');

popups.forEach(item => {
    item.addEventListener('click', function() {
        popupText.textContent = this.getAttribute('data-info');
        popup.style.display = 'block';
    });
});

closeBtn.onclick = function() {
    popup.style.display = 'none';
}

window.onclick = function(event) {
    if (event.target == popup) {
        popup.style.display = 'none';
    }
}
