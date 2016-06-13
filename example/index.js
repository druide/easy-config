var path = require('path')

var easyConfig = require('..')(path.join(__dirname, 'schema'))

var config = easyConfig.load([path.join(__dirname, 'config1.json'), path.join(__dirname, 'config2.json')])
console.log(config)
