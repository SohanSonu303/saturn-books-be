const express = require("express")
const db = require("../DB/mysqlconn")
const router = express.Router();
const zod = require("zod");
const jwt = require("jsonwebtoken");
require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET;
const middleWare = require("../middleware");

const getStoryMetadataData =zod.object({
    title : zod.string(),
    description : zod.string(),
    author : zod.string(),
    tags : zod.string(),
    coverage_image_url : zod.string(),
    likes : zod.number(),
    story : zod.string()
})

router.get("/getAllStories", middleWare, async (req,res) => {
        try{
            const [data] = await db.query(`SELECT * from book_metadata b ORDER BY b.createdAt DESC`)
            
            res.status(200).json(data);
        }
        catch(err){
            res.status(500).json({message:err.message})
        }
        
})

router.get("/getStoryById", middleWare , async(req,res) => {

        try{
            let id = req.query.id;
            const [data] = await db.query(`SELECT * from book_metadata b JOIN story_blob s ON b.id = s.bookid WHERE b.id = ?`,[id])

            if(data.length > 0){
                res.status(200).json(data[0])
            }
            else{
                res.status(200).json({
                    message: "No story found with the given id"
                })
            }
        }
        catch(err){
            res.status(500).json({message:err.message})
        }

})

router.post("/getStoryMetadataByIds",middleWare, async (req,res) => {
    try{

       
            const ids = req.body.ids;
            const idArray = ids.split(',').map(Number);
            const placeholders = idArray.map(() => '?').join(',');
            let query = `SELECT * from book_metadata b WHERE b.id IN (${placeholders})`;
            console.log(query)
            const [data] = await db.query(query,idArray)

                if(data.length > 0){
                    res.status(200).json(data)
                }
                else{
                    res.status(200).json({
                        message: "No story found with the given id"
                    })
                }
        
    }
    catch(err){
        res.status(500).json({message:err.message})
    }
})

router.post("/updateNewStory",middleWare, async (req,res) => {
    const {success} = getStoryMetadataData.safeParse(req.body);
    if(!success) {
        res.status(400).json({
            message: "Invalid request body"
        })
    }
    const connection = await db.getConnection();
    try{
       const { title,
    description,
    author ,
    tags ,
    coverage_image_url ,
    likes ,
    story} = req.body;

        await connection.beginTransaction();

        const [result1] = await connection.query(`insert into book_metadata (title,author,tags,description,cover_image_url,likes) values(?,?,?,?,?,?)`,[title,author,tags,description,coverage_image_url,likes])
        console.log(result1)
        const [result2] = await connection.query(`insert into story_blob (bookid,story) values(?,?)`,[result1.insertId,story])

        await connection.commit();
        res.status(200).json({ message: 'Transaction successful', result1, result2 });

    }
    catch(err){
        await connection.rollback();
        res.status(500).json({ error: 'Transaction failed', details: err.message });
    }
    finally{
        connection.release(); 
    }
})

module.exports = router;

