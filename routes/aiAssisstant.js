const express = require("express")
const axios = require('axios');
const db = require("../DB/mysqlconn")
const router = express.Router();
const zod = require("zod");
const jwt = require("jsonwebtoken");
require('dotenv').config();
const middleWare = require("../middleware")
const { GoogleGenerativeAI } = require("@google/generative-ai");


router.get("/getAIAssisstance", middleWare, async (req,res) => {

    try {
        const reqBody = req.body;

        let cloudFlareApi = `https://api.cloudflare.com/client/v4/accounts/${process.env.Account}/ai/run/@cf/meta/llama-3-8b-instruct`
        console.log(reqBody)
        const response = await axios.post(cloudFlareApi,reqBody,{
            headers:{
                'Authorization': `Bearer ${process.env.ApiKey}`,
                'Content-Type': 'application/json',
            }
        })

        res.status(200).json({
            "message" : response.data
        })
    }
    catch(err){
        res.status(500).json({"message": "error while conversation"+err})
    }

})

router.post("/getGoogleAIAssisstance", middleWare, async (req,res) => {

    try {
        const reqBody = req.body.query;

        const genAI = new GoogleGenerativeAI(process.env.GoogleAIApikey)
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = reqBody;

        async function generateStory() {
            const result = await model.generateContent(prompt);
            if(result){
                res.status(200).json(
                        {"message" : result.response.text()}
                );
            }
        }
        
        generateStory();
    }
    catch(err){
        res.status(500).json({"message": "error while conversation"+err})
    }

})


module.exports = router;