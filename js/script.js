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
// Get the popup
var popup = document.getElementById("infoPopup");

// Get the <span> element that closes the popup
var span = document.getElementsByClassName("close")[0];

// When the user clicks on <span> (x), close the popup
span.onclick = function() {
    popup.style.display = "none";
}

// When the user clicks anywhere outside of the popup, close it
window.onclick = function(event) {
    if (event.target == popup) {
        popup.style.display = "none";
    }
}

// Tab functionality
var tabButtons = document.getElementsByClassName("tab-button");
var tabContents = document.getElementsByClassName("tab-content");

for (var i = 0; i < tabButtons.length; i++) {
    tabButtons[i].addEventListener("click", function() {
        var tabName = this.getAttribute("data-tab");
        openTab(tabName);
    });
}

function openTab(tabName) {
    for (var i = 0; i < tabContents.length; i++) {
        tabContents[i].style.display = "none";
    }
    for (var i = 0; i < tabButtons.length; i++) {
        tabButtons[i].className = tabButtons[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    event.currentTarget.className += " active";
}

// Function to open the popup
function openPopup() {
    popup.style.display = "block";
}

// Add click event listeners to your "ayuda" elements
var ayudaElements = document.querySelectorAll('.info-popup');
ayudaElements.forEach(function(element) {
    element.addEventListener('click', function() {
        openPopup();
        // Open the corresponding tab based on the data-info attribute
        openTab(this.getAttribute('data-info'));
    });
});

// Add this to your existing JavaScript file

document.addEventListener('DOMContentLoaded', function() {
    const sidebar = document.getElementById('sidebar');
    const sidebarToggler = document.querySelector('.sidebar-toggler');
    const body = document.body;

    // Create overlay element
    const overlay = document.createElement('div');
    overlay.classList.add('sidebar-overlay');
    body.appendChild(overlay);

    function toggleSidebar() {
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
        body.classList.toggle('sidebar-open');
    }

    sidebarToggler.addEventListener('click', toggleSidebar);
    overlay.addEventListener('click', toggleSidebar);

});