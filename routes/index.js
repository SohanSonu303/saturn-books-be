const express = require("express")
const router = express.Router();
const signingRouter = require("./user")
const storyRouter = require("./story")
const getAIAssisstance = require("./aiAssisstant")


router.use("/user",signingRouter)

router.use("/story",storyRouter)

router.use("/chatty",getAIAssisstance)

/**
 * @swagger
 * /api/v1/getBody:
 *   get:
 *     summary: Test API
 *     responses:
 *       200:
 *         description: A simple Hello World API
 */
router.get("/getBody", (req,res) => {
    res.send("hellow");
})
module.exports = router;