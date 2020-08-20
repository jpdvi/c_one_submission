const winston = require('winston')
module.exports = function(){
    let l = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
      new winston.transports.File({ filename: 'error.log', level: 'error' }),
      new winston.transports.File({ filename: 'combined.log' }),
      new winston.transports.Console({format: winston.format.simple()})
      ]
    })
     return l;
   }

  
