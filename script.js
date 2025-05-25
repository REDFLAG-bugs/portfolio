function toggleMenu() {
    const menu = document.querySelector(".menu-links");
    const icon = document.querySelector(".hamburger-icon");
    menu.classList.toggle("open");
    icon.classList.toggle("open");
  }
  
  
  // JavaScript to open and close the modal
  document.querySelectorAll('.more-link').forEach(link => {
    link.addEventListener('click', function(event) {
        event.preventDefault();
        const modalId = this.getAttribute('data-modal');
        const modal = document.getElementById(modalId);
        modal.style.display = 'block';
    });
  });
  
  // Close the modal when the close button is clicked
  document.querySelectorAll('.close-btn').forEach(button => {
    button.addEventListener('click', function() {
        const modal = this.closest('.modal');
        modal.style.display = 'none';
    });
  });
  
  // Close the modal if the user clicks outside of the modal
  window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
  };
  
  
  
  // JavaScript to open and close the modal
  document.querySelectorAll('.more-link').forEach(link => {
    link.addEventListener('click', function(event) {
        event.preventDefault();
        const modalId = this.getAttribute('data-modal-project');
        const modal = document.getElementById(modalId);
        modal.style.display = 'block';
    });
  });
  
  // Close the modal when the close button is clicked
  document.querySelectorAll('.close-btn').forEach(button => {
    button.addEventListener('click', function() {
        const modal = this.closest('.modal-project');
        modal.style.display = 'none';
    });
  });
  
  // Close the modal if the user clicks outside of the modal
  window.onclick = function(event) {
    if (event.target.classList.contains('modal-project')) {
        event.target.style.display = 'none';
    }
  };
  
  
  
  