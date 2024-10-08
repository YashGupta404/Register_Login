import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";  

const app = express();
const port = 3000;
const saltRounds = 10;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "secrets",
  password: "root",
  port: 5432,
});
db.connect();

app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});


app.get("/register", (req, res) => {
  res.render("register.ejs");
});

// Register a user
app.post("/register", async (req, res) => {
  //Get user details
  const email = req.body.username;
  const password = req.body.password;

  try {
    const checkResult = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
// Check if email already exists
    if (checkResult.rows.length > 0) {
      res.send("Email already exists. Try logging in.");
    } else {

// Password Hashing using Bcrypt and salting
bcrypt.hash(password,saltRounds, async (err,hash)=>{
  if(err){
    console.log("Error Hashing Problem : ",err);
  }
  else{
  const result = await db.query(
    "INSERT INTO users (email, password) VALUES ($1, $2)",
    [email, hash]
  );
  console.log(result);
  res.send("Thanks for registering to our website!");
}
})

      
    }
  } catch (err) {
    console.log(err);
  }
});
// Login User
app.post("/login", async (req, res) => {
  const email = req.body.username;
  const loginpassword = req.body.password;

  try {
    const result = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    //Check if email is registered
    if (result.rows.length > 0) {
      const user = result.rows[0];
      const storedHashedPassword = user.password;

      // Use this to compare hashed passwords, here result is True or False depending on the password entered is correct or not
      bcrypt.compare(loginpassword,storedHashedPassword, (err,result)=>{
        if(err){
          console.log("Error comparing passwords: ",err);
        }
        else{
          if(result){
            res.render("secrets.ejs");
          }
          else{
            res.send("Incorrect Password"); 
          }
        }
      })
      
    } else {
      res.send("User not found");
    }
  } catch (err) {
    console.log(err);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
