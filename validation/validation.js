const validUrl = require('valid-url')


const isBodyEmpty = function(data)
{
    if(Object.keys(data).length == 0) return true
    return false;
}

const isValid = function(value)
{
    if(typeof value === 'undefined' || value === null ) return false
    if(typeof value === 'string' && value.trim().length === 0) return false // longUrl=""
    return true;
}

const isValidUrl = function(url)
{
    if(validUrl.isUri(url)) return true
    else return false
}

module.exports ={ isBodyEmpty, isValid, isValidUrl}