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