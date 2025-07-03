
const header = document.querySelector("header");

// Opacidade do navbar ao fazer um scroll down na pafina
window.addEventListener("scroll", () => {
  let scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
  // Adjust opacity based on scroll position (fades out over 200px of scrolling)
  let opacity = Math.max(1 - scrollPosition / 150, 0);
  header.style.opacity = opacity;

  // Add/remove hidden class for accessibility
  if (opacity <= 0) {
    header.classList.add("hidden");
  } else {
    header.classList.remove("hidden");
  }
});

// Funcionalidade do pesquisar
document.addEventListener('DOMContentLoaded', function() {
  const searchIcon = document.querySelector('.search-icon');
  const searchInputContainer = document.querySelector('.search-input-container');
  const searchInput = document.querySelector('.search-input');
  const form = document.querySelector('.search-bar-wrapper form');

  function openSearchBar() {
    searchInputContainer.classList.add('active');
    searchInput.focus();
  }

  function closeSearchBar() {
    searchInputContainer.classList.remove('active');
    searchInput.value = '';
  }

  // Handle click on search icon
  searchIcon.addEventListener('click', function(event) {
    event.preventDefault(); // Prevent form submission on icon click
    event.stopPropagation(); // Stop event bubbling
    if (searchInputContainer.classList.contains('active')) {
      if (searchInput.value.trim() !== '') {
        form.submit(); // Submit if input has text
      } else {
        closeSearchBar(); // Close if input is empty
      }
    } else {
      openSearchBar(); // Open if not active
    }
  });

  // Close search bar on Escape key
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && searchInputContainer.classList.contains('active')) {
      closeSearchBar();
    }
  });

  // Close search bar if clicked outside
  document.addEventListener('click', function(event) {
    if (!searchInputContainer.contains(event.target) && searchInputContainer.classList.contains('active')) {
      closeSearchBar();
    }
  });

  // Prevent closing when clicking inside the input container and focus input
  searchInputContainer.addEventListener('click', function(event) {
    if (searchInputContainer.classList.contains('active')) {
      event.stopPropagation();
      searchInput.focus();
    }
  });
});