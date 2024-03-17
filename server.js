// server.js

const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(express.static('public'));

// Function to get recipe instructions
function getInstructions(recipe) {
    if (recipe.recipe.url) {
        return `<a href="${recipe.recipe.url}" target="_blank">Instructions</a>`;
    } else {
        return "Instructions not available.";
    }
}

// Define routes
app.get('/', (req, res) => {
    res.render('index', { recipes: null, getInstructions: getInstructions });
});

app.get('/search', async (req, res) => {
    try {
        const appId = 'd3464265';
        const appKey = '67fd5eaa5cf6aa143861c6bf4233080e';
        const query = req.query.query;
        const response = await axios.get(`https://api.edamam.com/search?q=${query}&app_id=${appId}&app_key=${appKey}`);
        console.log(response.data); // Log the entire API response
        const recipes = response.data.hits;
        res.render('index', { recipes: recipes, getInstructions: getInstructions });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
