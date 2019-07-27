const jwt = require("jsonwebtoken");
const { TOKENSECRET } = process.env;

module.exports = (req,res,next) => {
    const authHeader = req.get('Authorization')
    if(!authHeader){
        const error = new Error('not authanticated')
        error.statusCode = 401
        throw error
    }
    const token = authHeader.split(' ')[1]
    let decodedToken
    try{
        decodedToken = jwt.verify(token, TOKENSECRET)
    }catch(err){
        err.statusCode = 500
        throw err
    }
    if(!decodedToken){
        const error = new Error('not authanticated')
        error.statusCode = 401
        throw error
    }
    req.userId = decodedToken.userId
    next()
}