// Get the toggle button
const themeToggle = document.getElementById('theme-toggle');

// Check for saved user preference, if any
const currentTheme = localStorage.getItem('theme');
if (currentTheme) {
  document.documentElement.setAttribute('data-theme', currentTheme);
}

// Add event listener to button
themeToggle.addEventListener('click', function() {
  // If current theme is dark, switch to light, and vice versa
  let theme = document.documentElement.getAttribute('data-theme');
  
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.setItem('theme', 'light');
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
  }
});

// Check if user has dark mode enabled at the OS level
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

// Initial load based on OS preference if no saved preference
if (!localStorage.getItem('theme') && prefersDarkScheme.matches) {
  document.documentElement.setAttribute('data-theme', 'dark');
}

// Update button text based on current theme
function updateButtonText() {
    const theme = document.documentElement.getAttribute('data-theme');
    themeToggle.textContent = theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode';
  }
  
  // Call initially and after theme changes
  updateButtonText();
  themeToggle.addEventListener('click', updateButtonText);