var express= require("express");
var request=require("request");
var app = express()

app.use(express.static('public'));

app.set("view engine","ejs");

app.get('/', function (req, res) {
    res.sendFile(__dirname+"/public/js/"+"app.html");
})
app.listen(5000, function () {
    console.log('Example app listening on port 3000!');
})
app.get("/signupsubmit", function(req,res){
    console.log("you are logged in");
    console.log(req.query);
})
app.get("/getmovie",function(req,res){
    res.sendFile(__dirname+"/movie.html");
})
app.get("/moviename",function(req,res){
    const mname=req.query.mname;
    console.log(req.query);
    request(
        "http://www.omdbapi.com/?t="+mname+"&apikey=4b60d3b3",
        function(error,response,body){
            if(JSON.parse(body).Response=="True"){
                console.log(JSON.parse(body));
                //res.send({title:JSON.parse(body).Title,year:JSON.parse(body).Year});
                res.render("moviesinfo");
            }
            else{
                res.send("something is wrong");
            }
        }
    );
});