var ajv = require('ajv')({useDefaults: true})
var _ = require('lodash')
var parseArgs = require('minimist')

/**
 * Get value from environment and argument
 * @param  {String} arg
 * @param  {String} env
 * @param  {String} type
 * @return {*} value or undefined
 */
function getArgEnvValue (arg, env, type) {
  var v
  if (env) v = process.env[env]
  if (arg) {
    var argv = parseArgs(process.argv.slice(2))
    if (typeof argv[arg] !== 'undefined') v = argv[arg]
  }
  if (typeof v !== 'undefined') {
    switch (type) {
      case 'number':
        v = parseFloat(v)
        break
      case 'integer':
        v = parseInt(v, 10)
        break
      case 'boolean':
        switch (('' + v).toLowerCase()) {
          case 'false':
          case 'no':
          case '0':
          case '':
            v = false
            break
          default:
            v = true
            break
        }
        break
      case 'null':
        v = null
        break
      case 'object':
      case 'array':
        v = JSON.parse(v)
        break
      default:
        break
    }
  }
  return v
}

/**
 * Walk through schema properties and add extend config object with environment and arguments values.
 * @param  {Object} schema
 * @param  {*} value
 * @return {*} new value or undefined
 */
function walk (schema, value) {
  var result
  if (schema.type === 'object') {
    if (!value) value = result = {}
    _.each(schema.properties, function (v, prop) {
      var r = walk(v, value[prop])
      if (typeof r !== 'undefined') value[prop] = r
    })
    return result
  }
  return getArgEnvValue(schema.arg, schema.env, schema.type)
}

/**
 * Remove all nulls
 * @param  {Object} obj
 */
function clean (obj) {
  _.each(obj, function (v, key) {
    if (v === null) {
      delete obj[key]
    }
    if (_.isPlainObject(v)) {
      clean(v)
    }
  })
}

function customizer (objValue, srcValue, key) {
  // replace arrays
  if (_.isArray(srcValue)) {
    return srcValue
  }
}

/**
 * Config object
 * @class
 * @param {Object} schema
 */
function EasyConfig (schema) {
  if (typeof schema === 'string') {
    this.schema = require(schema)
  } else {
    this.schema = schema
  }
  this.validate = ajv.compile(this.schema)
  this.load()
}

/**
 * Load config.
 * @param  {Object|Array|String} config JSON, filename, or array of JSON's or filenames
 * @return {Object} resulting plain config object
 */
EasyConfig.prototype.load = function (config) {
  var _firstTime = false
  if (!this.config) {
    this.config = {}
    _firstTime = true
  } else if (typeof config === 'string') {
    _.mergeWith(this.config, require(config), customizer)
  } else if (config instanceof Array) {
    var self = this
    _.each(config, function (subConfig) {
      if (typeof subConfig === 'string') subConfig = require(subConfig)
      _.mergeWith(self.config, subConfig, customizer)
    })
  } else {
    _.mergeWith(this.config, config, customizer)
  }
  clean(this.config)
  walk(this.schema, this.config)
  if (!this.validate(this.config) && !_firstTime) throw new Error(this.getError())
  return this.config
}

/**
 * Get readable error description.
 * @return {Array}
 */
EasyConfig.prototype.getError = function () {
  if (!this.validate.errors) return ''
  return this.validate.errors[0].dataPath.substring(1) + ' ' + this.validate.errors[0].message
}

/**
 * Get plain config object
 * @return {Object}
 */
EasyConfig.prototype.get = function () {
  return this.config
}

module.exports = function (schema) {
  return new EasyConfig(schema)
}
