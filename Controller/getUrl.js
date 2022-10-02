const urlModel = require('../models/urlModel')

const redis = require("redis");

const { promisify } = require("util");

//Connect to redis
const redisClient = redis.createClient(
    14143,
    "redis-14143.c301.ap-south-1-1.ec2.cloud.redislabs.com",
    { no_ready_check: true }
);
redisClient.auth("F45rPClREsWg5BxVgExL1qZch4LjoQ54", function (err) {
    if (err) throw err;
});

redisClient.on("connect", async function () {
    console.log("Connected to Redis..");
});

//1. connect to the server
//2. use the commands :

//Connection setup for redis

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);


const getUrl = async function (req, res) {
    try {
        let urlCode = req.params.urlCode
        if (!urlCode) return res.status(400).send({ status: false, message: "Please insert a url code!" })

        if (urlCode.toLowerCase() !== urlCode) return res.status(400).send({ status: false, msg: "The Url Code should be in lower case only!" })

        //========================================
        let cachedProfileData = await GET_ASYNC(`${urlCode}`)
      
        if (cachedProfileData) {
            let data = JSON.parse(cachedProfileData)
            res.redirect(data.longUrl)
        } else {
            let url = await urlModel.findOne({ urlCode: urlCode })  
            if (url) {
                await SET_ASYNC(`${url.urlCode}`, JSON.stringify(url)) 
                
                return res.redirect(url.longUrl)
            }
            else {
                return res.status(404).send({ status: false, message: "No Url Found" })
            }

        }

    } catch (error) {
        res.status(500).send({ message: error.message })
    }
}


module.exports.getUrl = getUrl

