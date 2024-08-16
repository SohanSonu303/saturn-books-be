const express = require("express")
const db = require("../DB/mysqlconn")
const router = express.Router();
const zod = require("zod");
const jwt = require("jsonwebtoken");
require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET;
const middleWare = require("../middleware")

const signUpBody = zod.object({
    username :zod.string().min(5,"Username must be atleast 5 characters"),
    email : zod.string().email("Invalid email address"),
    password : zod.string().min(5,"Password must be at least 5 characters long"),
    lastName : zod.string().min(1, "Last name is required"),
    
    firstName : zod.string().min(1, "First name is required"),

    tags: zod.string().optional().refine(value => {
        return value === '' || /^[\w\s,]*$/.test(value);
      }, {
        message: "Tags must be a valid comma-separated list or an empty string"
      })
})

const signInBody = zod.object({
    username : zod.string(),
    password : zod.string()
})

router.post("/signin", async (req,res) => {
    const { success } = signInBody.safeParse(req.body)
    if (!success) {
        return res.status(411).json({
            message: "Incorrect inputs"
        })
    }
    else{
        const [data]  = await db.query(`select * from users u where u.username = ? and u.password = ?`,[req.body.username,req.body.password])
        let usernameToToken = req.body.username;

        if(data.length === 0){
            res.status(401).json({
                error:"Invalid credentails or not signed up"
            })
        }
        else{
            let {id,username,email,tags} = data[0]
            const token = jwt.sign({
                usernameToToken
            }, JWT_SECRET);

            res.json({
                "id":id,
                username,
                email,
                tags,
                "token" : token
            })
        }
    }

})

router.post("/signup", async (req,res) => {
    const {success} = signUpBody.safeParse(req.body);
    if(!success) {
        return res.status(400).json({message : "Invalid request body"})
    }
    else if(success){
        const [data]  = await db.query(`select u.username from users u where u.username = ?`,[req.body.username])
        const [dataEmail]  = await db.query(`select u.email from users u where u.email = ?`,[req.body.email])
        console.log(data)
        if(data.length > 0 || dataEmail.length > 0){
            return res.status(400).json({message : "Username or Email already exists pls signin"})
        }
        else{
            let usernameToToken = req.body.username;
            
            const {rows} = await db.query(`INSERT INTO users (username, email, password,firstname, lastname, tags) 
                values(?,?,?,?,?,?)`,[req.body.username,req.body.email,req.body.password,req.body.firstName,req.body.lastName,req.body.tags])

            const token = jwt.sign({
                usernameToToken
            }, JWT_SECRET);

            res.json({
                "token" : token
            })
        }
    }
})

module.exports = router;