'use strict';

var request = require('request-promise');
var Promise = require('bluebird');
var config = require('config');
var responseHandler = require('../../utils/response.handler');
var errorHandler = require('../../utils/error.handler');
var utils = require('../../utils/utils');

var url = config.API_URL + 'userToCourseConnector';

exports.createUserToCourseConnector = function(userToCourseConnector) {
    var options = {
        resolveWithFullResponse: true,
        uri: url,
        method: 'POST',
        json: userToCourseConnector,
        gzip: true
    };

    return request(options)
        .then(responseHandler.parsePost)
        .catch(errorHandler.throwDREAMSHttpError);
};

exports.getUserToCourseConnectorById = function(id) {
    var options = {
        resolveWithFullResponse: true,
        uri: url + '/' + id,
        method: 'GET',
        gzip: true,
        json: true
    };

    return request(options)
        .then(responseHandler.parseGet)
        .catch(errorHandler.throwDREAMSHttpError);
};

exports.getUserToCourseConnectors = function(query) {
    var options = {
        resolveWithFullResponse: true,
        uri: url + utils.getQueryByObject(query),
        method: 'GET',
        gzip: true
    };

    return request(options)
        .then(responseHandler.parseGetPolyQuery)
        .catch(errorHandler.throwDREAMSHttpError);
};

exports.updateUserToCourseConnector = function(userToCourseConnector) {
    var options = {
        resolveWithFullResponse: true,
        uri: url + '/' + userToCourseConnector._id,
        method: 'PUT',
        json: userToCourseConnector
    };

    return request(options)
        .then(responseHandler.parsePut)
        .catch(errorHandler.throwDREAMSHttpError);
};

exports.deleteUserToCourseConnector = function(userToCourseConnectorId) {
    var options = {
        resolveWithFullResponse: true,
        uri: url + '/' + userToCourseConnectorId,
        method: 'DELETE'
    };

    return request(options)
        .then(responseHandler.parseDelete)
        .catch(errorHandler.throwDREAMSHttpError);
};
