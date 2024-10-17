function toggleSubcategories(element) {
    const subList = element.querySelector('.sub-list');
    if (subList.style.display === "none" || subList.style.display === "") {
        subList.style.display = "block";
    } else {
        subList.style.display = "none";
    }
}