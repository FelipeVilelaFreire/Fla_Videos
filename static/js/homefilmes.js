
//Funcionalidade Carrossel
function scrollCarousel(button, direction) {
  const carousel = button.parentElement.querySelector('.carousel');
  const scrollAmount = carousel.offsetWidth * 0.9;
  carousel.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
}


