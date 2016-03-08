'use strict';

var Promise = require('bluebird');

exports.extend = function(destination, source) {
    for (var prop in destination) {
        if (destination.hasOwnProperty(prop) && source.hasOwnProperty(prop)) {
            destination[prop] = source[prop];
        }
    }

    return destination;
};

exports.extractPropertiesFromConnectors = function(property, connectors, extraProps) {
    return new Promise(function(resolve) {
        var list = [];
        connectors.forEach(function(connector) {
            var object = {};
            object._id = connector[property];
            if (extraProps) {
                extraProps.forEach(function(prop) {
                    object[prop] = connector[prop];
                });
            }

            list.push(object);
        });

        return resolve(list);
    });
};

exports.extractPropertyFromList = function(property) {
    return function(items) {
        return new Promise(function(resolve) {
            var list = [];
            items.forEach(function(item) {

                list.push(item[property]);
            });

            return resolve(list);
        });
    };
};

exports.matchListAndObjectIds = function(list) {
    return function(objects) {
        return new Promise(function(resolve) {
            var items = [];
            objects.forEach(function(object) {
                list.some(function(item) {
                    if (object._id === item._id) {
                        items.push(mergeProperties(object, item));
                        return true;
                    }

                });
            });

            Promise.all(items)
                .then(resolve);
        });
    };
};

exports.sortListByProperty = function(list, prop) {
    return new Promise(function(resolve) {
        list.sort(function(a, b) {
            if (a[prop] > b[prop]) {
                return 1;
            }

            if (a[prop] < b[prop]) {
                return -1;
            }

            return 0;
        });

        return resolve(list);
    });
};

exports.rejectIfEmpty = function(body) {
    return function(list) {
        return new Promise(function(resolve, reject) {
            if (list.length <= 0) {
                return reject();
            } else {
                return resolve(body);
            }
        });
    };
};

exports.objectContainsOneOfFields = function(object, fields) {
    return new Promise(function(resolve, reject) {
        var contains = false;
        for (var field in object) {
            if (fields.indexOf(field) >= 0) {
                contains = true;
            }
        }

        resolve(contains);
    });
};

exports.extractRelevantAttributes = function(relevantAttributes) {
    return function(presentAttributes) {
        return new Promise(function(resolve, reject) {
            if (presentAttributes.length <= 0) {
                return reject();
            }

            var list = [];
            presentAttributes.forEach(function(presentAttribute) {
                if (relevantAttributes.indexOf(presentAttribute.name) >= 0) {
                    list.push(presentAttribute);
                }
            });

            return Promise.all(list)
                .then(resolve);
        });
    };
};

exports.getQueryByObject = function(queryObject) {
    if (!queryObject) {
        return '';
    }

    var queryString = '?';
    for (var queryParam in queryObject) {
        if (queryObject.hasOwnProperty(queryParam)) {
            queryString += queryParam + '=' + queryObject[queryParam] + '&';
        }
    }

    return queryString;
};

exports.createQueryObjectFromList = function(newFieldName, OldFieldName) {
    return function(object) {
        return new Promise(function(resolve) {
            var res = {};
            res[newFieldName] = object[0][OldFieldName];
            return resolve(res);
        });
    };
};

exports.returnFirstIndex = function(list) {
    return new Promise(function(resolve) {
        return resolve(list[0]);
    });
};

exports.setIdOnBody = function(id) {
    return function(body) {
        return new Promise(function(resolve, reject) {
            body._id = id;
            return resolve(body);
        });
    };
};

// HELPER
// ============================================================================

function listContainsId(list, id) {
    return list.indexOf(id) > -1;
}

function mergeProperties(from, to) {
    return new Promise(function(resolve) {
        for (var prop in from) {
            if (from.hasOwnProperty(prop)) {
                to[prop] = from[prop];
            }
        }

        return resolve(to);
    });
}
