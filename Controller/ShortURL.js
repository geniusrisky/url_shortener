const validation = require('../validation/validation')
const urlModel = require('../models/urlModel')
const shortid = require('shortid');



const redis = require("redis");

const {promisify}  = require("util");
const { getUrl } = require('./getUrl');

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

// promisify and callbackify
const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);





const shortUrl = async function (req, res) {
    try {
        const data = req.body;

        if (validation.isBodyEmpty(data)) return res.status(400).send({ status: false, message: "Please provide required Data" });

        const longUrl = data.longUrl
        if (!validation.isValid(longUrl)) return res.status(400).send({ status: false, message: "longUrl shoud not be empty" }); //longUrl:"     "

        if (!validation.isValidUrl(longUrl)) res.status(400).send({ status: false, message: `longUrl "${longUrl}" is not valid` });
        
        let reg = /^(ftp|http|https):\/\/[^ "]+$/
        if (!reg.test(longUrl)) return res.status(400).send({ status: false, message: "Please provide a valid url" })

        let urlId = shortid.generate()
        urlId = urlId.toLowerCase();

        
        
        //===================================================
        const baseUrl = "http://localhost:3000"
        let cachedProfileData = await GET_ASYNC(`${longUrl}`)
        console.log(cachedProfileData)
        if (cachedProfileData) {
            let data = JSON.parse(cachedProfileData)
            return res.status(200).send({ status: true, data: { urlCode: data.urlCode, longUrl: longUrl, shortUrl: `${baseUrl}/${data.urlCode}` } })
        } else {
            const isUrlExist = await urlModel.findOne({ longUrl: longUrl })

            if (isUrlExist) {
                let data = await SET_ASYNC(`${isUrlExist.longUrl}`, JSON.stringify(isUrlExist))
                console.log("This is my Data " + data);

                return res.status(200).send({ status: true, data: { urlCode: isUrlExist.urlCode, longUrl: longUrl, shortUrl: `${baseUrl}/${isUrlExist.urlCode}` } })
            }
            else {
                let myObject = {
                    urlCode: urlId,
                    longUrl: longUrl,
                    shortUrl: `${baseUrl}/${urlId}`
                }

                await urlModel.create(myObject);
                await SET_ASYNC(`${longUrl}`, JSON.stringify(myObject))
                res.status(201).send({ status: true, data: myObject })
            }

        }
        //====================================================================





        // if(isUrlExist) return res.status(200).send({status:true, data:{urlCode:isUrlExist.urlCode, longUrl:longUrl, shortUrl:`${baseUrl}/${isUrlExist.urlCode}`}})



    } catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }

}

module.exports = { shortUrl }



