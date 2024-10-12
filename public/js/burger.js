document.addEventListener("DOMContentLoaded", function() {
    const moreButtons = document.querySelectorAll('.button-more');
  
    moreButtons.forEach(button => {
      const dropdownContent = button.nextElementSibling;
  
      button.addEventListener('click', function() {
        const isVisible = dropdownContent.style.display === 'block';
        dropdownContent.style.display = isVisible ? 'none' : 'block';
      });
  
      window.addEventListener('click', function(e) {
        if (!button.contains(e.target) && !dropdownContent.contains(e.target)) {
          dropdownContent.style.display = 'none';
        }
      });
    });
  });
  