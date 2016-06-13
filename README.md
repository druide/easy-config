# easy-config

Application config loader with validation, environment strings, command-line arguments and config merging.
Validation is based on [Ajv](https://github.com/epoberezkin/ajv) JSON Schema validator.


## Install

```
npm install easy-config --save
```


## JSON schema

Schema is extended with 2 keywords:

- `env` - environment variable name
- `arg` - application command-line argument name

Priority of getting the value is:

- command-line argument
- environment variable
- config value
- default schema value

Config value of `null` will delete property on merge.


## API

### EasyConfig()

```
EasyConfig(Object|String schema)
```

Load JSON schema from object or file.

### load

```
easyConfig.load(Object|String|Array config, [Boolean append]) -> Object|Error
```

Load config or merge list of configs from file or object. When `append` is true, new config will be merged to already
loaded one. Returns plain config object or instance of `Error`.

### isValid

```
easyConfig.isValid() -> Boolean
```

Check if loaded config is valid.

### get

```
easyConfig.get() -> Object
```

Get plain config object.

### getError

```
easyConfig.getError() -> String
```

Get error description when config is not valid.


## See

[Ajv](https://github.com/epoberezkin/ajv)
[JSON Schema](http://json-schema.org)


## Examples

```
// load JSON schema file
var schema = require('ajconfig')('schema1');

// load JSON config
schema.load('./config1.json');
// extend previous config
var config = schema.load('./config2.json', true);

if (config instanceof Error) {
    throw config;
}

// Merge multiple configs into one
var config2 = schema.load(['./config1.json', './config2.json']);
```

One line load:

```
var config = require('ajconfig')('schema1').load('./config1.json');

if (config instanceof Error) {
    throw config;
}
```

App parameners:

```
node myapp --arg1 test --arg2 12345
```


[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)
