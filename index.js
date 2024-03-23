const express = require('express')
const bodyParser = require('body-parser');
const app = express()
const port = 3020

const {initializeApp,cert}=require("firebase-admin/app");
const {getFirestore}=require("firebase-admin/firestore");
var key=require("./key.json");

initializeApp({
    credential :cert(key),
});
const db=getFirestore();

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.render('home');
})

app.set("view engine","ejs");

app.get('/signup', (req, res) => {
    res.render('signup');
})

const axios = require('axios');

app.use(express.static('assets'));

const bcrypt = require('bcryptjs');

app.post('/signupsubmit', async (req, res) => {
    const uname = req.body.uname;
    const email = req.body.email;
    const password = req.body.password;
    const cpass = req.body.cpass;

    if (password !== cpass) {
        return res.status(400).send("Passwords do not match");
    }

    try {
        // Check if user with this email already exists
        const userSnapshot = await db.collection('users').where('email', '==', email).get();
        if (!userSnapshot.empty) {
            return res.status(400).send("User already exists with this email");
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10); // 10 is the saltRounds

        // Add the user to the database
        await db.collection('users').add({
            name: uname,
            email: email,
            password: hashedPassword // Store hashed password
        });
        res.render('signin');
    } catch (error) {
        console.error("Error adding user:", error);
        res.status(500).send("Error signing up. Please try again later.");
    }
})


async function getInstructions(recipeId) {
    try {
        const response = await axios.get(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${recipeId}`);
        const recipe = response.data.meals ? response.data.meals[0] : null;
        return recipe ? recipe.strInstructions : "Instructions not available.";
    } catch (error) {
        console.error(error);
        return "Error fetching instructions.";
    }
}

// Route to handle search and display of recipe names
app.post('/search', async (req, res) => {
    try {
        
        const query = req.body.query;
        const response = await axios.get(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`);
        const recipes = response.data.meals || [];
        //console.log(recipes); // Ensure recipes array exists
        res.render('index', { recipes: recipes });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Route to display details of a specific recipe
app.get('/recipe/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const response = await axios.get(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
        const recipe = response.data.meals ? response.data.meals[0] : null;

        if (recipe) {
            res.render('recipe', { recipe: recipe, getInstructions: getInstructions }); // Pass the recipe object and getInstructions function to the view
        } else {
            res.status(404).send('Recipe not found');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});







app.get('/signin', (req, res) => {
    res.render('signin');
})


app.post('/signinsubmit', async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    try {
        // Check if a user with this email exists
        const userSnapshot = await db.collection('users').where('email', '==', email).get();
        if (userSnapshot.empty) {
            return res.send("Login failed: User not found");
        }

        // Retrieve the user data
        const userData = userSnapshot.docs[0].data();

        // Compare hashed passwords
        const isPasswordMatch = await bcrypt.compare(password, userData.password);

        if (isPasswordMatch) {
            // Passwords match, authentication successful
            res.render('index', { recipes: null, getInstructions: getInstructions });
        } else {
            // Passwords do not match
            res.send("Login failed: Incorrect password");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});