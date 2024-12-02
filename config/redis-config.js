const Redis = require('ioredis'); 


// instanace 
const redis = new Redis({
    host: process.env.REDIS_HOST, 
    port: process.env.REDIS_PORT, // Redis server port
})

// connect redis
redis.on('connect', function(){
    console.log('Connected to Redis');
}) 

// failed connection 
redis.on('error', function(err){
    console.log(`failed to connect with redis: ${err}`)
})  

module.exports = Redis
