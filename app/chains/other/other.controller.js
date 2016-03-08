'use strict';

var otherDao = require('./other.dao');
var Promise = require('bluebird');
var errorHandler = require('../../utils/error.handler');
var utils = require('../../utils/utils');

// TODO: Make the validation more covering
function validateOther(other) {
    return new Promise(function(resolve, reject) {
        if (other && other.name) {
            other = utils.extend(getOtherTemplate(), other);
            return resolve(other);
        }

        return errorHandler.getHttpError(400)
            .then(reject);
    });
}

function getOtherTemplate() {
    return {
        name: null
    };
}

exports.createNewOther = function(otherObject) {
    return validateOther(otherObject)
        .then(otherDao.createNewOther);
};

exports.getOtherById = function(id) {
    return otherDao.getOtherById(id);
};

exports.getOthers = function(query) {
    return otherDao.getOthers(query);
};

exports.deleteOtherById = function(id) {
    return otherDao.deleteOtherById(id);
};

exports.purgeIndices = function() {
    return otherDao.purgeIndices();
};

exports.createIndex = function(fields, options) {
    return otherDao.createIndex(fields, options);
};
