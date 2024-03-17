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
app.use(express.static('public'));

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


app.post('/signinsubmit',(req,res)=>{
    const email=req.body.email;
    const password=req.body.password;

    db.collection('users').where('email','==',email).where('password','==',password)
    .get().then((docs)=>{
        if(docs.size>0){
            res.render('index', { recipes: null, getInstructions: getInstructions });
        }
        else{
            res.send("Login failed");
        }
    })
})




app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
























































// var express= require("express");
// var request=require("request");
// var app = express()

// app.use(express.static('public'));

// app.set("view engine","ejs");

// app.get('/', function (req, res) {
//     res.sendFile(__dirname+"/public/js/"+"app.html");
// })
// app.listen(5000, function () {
//     console.log('Example app listening on port 3000!');
// })
// app.get("/signupsubmit", function(req,res){
//     console.log("you are logged in");
//     console.log(req.query);
// })
// app.get("/getmovie",function(req,res){
//     res.sendFile(__dirname+"/movie.html");
// })
// app.get("/moviename",function(req,res){
//     const mname=req.query.mname;
//     console.log(req.query);
//     request(
//         "http://www.omdbapi.com/?t="+mname+"&apikey=4b60d3b3",
//         function(error,response,body){
//             if(JSON.parse(body).Response=="True"){
//                 console.log(JSON.parse(body));
//                 //res.send({title:JSON.parse(body).Title,year:JSON.parse(body).Year});
//                 res.render("moviesinfo");
//             }
//             else{
//                 res.send("something is wrong");
//             }
//         }
//     );
// });