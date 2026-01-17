
const search_input = document.getElementById("search-bar");

search_input.addEventListener('keydown', function (event) {
    
    if (event.key === "Enter") {
        // Get the current value of the input field
        const query = event.target.value;

        // Update the output element with the current value
        alert("Sorrrry but this isn't done yet! Your query: " + query)        
    }
    

});
