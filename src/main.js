// Stuff that requires the node modules to run!

// ALL IMPORTS MUST FOLLOW THIS FORMAT:
// import <library> from '<library>'
// DO NOT FOLLOW:
// const library = require('<library>')

// import a from a 

// Import the package using ES Modules
import dayjs from 'dayjs';

console.log("Hello from Vite + npm!");

// Display the current date and time
const now = dayjs();
console.log("Current time:", now.format('YYYY-MM-DD HH:mm:ss'));

// Add 7 days
const nextWeek = now.add(7, 'day');
console.log("One week from now:", nextWeek.format('YYYY-MM-DD HH:mm:ss'));

// Show it in the HTML
const h1 = document.createElement('h1');
h1.textContent = `Hello! Today is ${now.format('MMMM D, YYYY')}`;
document.body.appendChild(h1);
