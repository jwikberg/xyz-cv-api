'use strict';

var request = require('request-promise');
var config = require('config');
var Promise = require('bluebird');
var responseHandler = require('../../utils/response.handler');
var errorHandler = require('../../utils/error.handler');
var utils = require('../../utils/utils');

var url = config.API_URL + 'skill';

exports.createNewSkill = function(skill) {
    var options = {
        resolveWithFullResponse: true,
        uri: url,
        method: 'POST',
        json: skill,
        gzip: true
    };

    return request(options)
        .then(responseHandler.parsePost)
        .catch(errorHandler.throwDREAMSHttpError);
};

exports.getSkillById = function(id) {
    var options = {
        resolveWithFullResponse: true,
        uri: url + '/' + id,
        method: 'GET',
        json: true,
        gzip: true
    };

    return request(options)
        .then(responseHandler.parseGet)
        .catch(errorHandler.throwDREAMSHttpError);
};

exports.getSkills = function(query) {
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

exports.updateSkill = function(skill) {
    var options = {
        resolveWithFullResponse: true,
        uri: url + '/' + skill._id,
        method: 'PUT',
        json: skill
    };

    return request(options)
        .then(responseHandler.parsePut)
        .catch(errorHandler.throwDREAMSHttpError);
};

exports.deleteSkillById = function(id) {
    var options = {
        resolveWithFullResponse: true,
        uri: url + '/' + id,
        method: 'DELETE'
    };

    return request(options)
        .then(responseHandler.parseDelete)
        .catch(errorHandler.throwDREAMSHttpError);
};

exports.createIndex = function(fields, query) {
    var options = {
        resolveWithFullResponse: true,
        uri: config.API_URL + '_indices/skill' + utils.getQueryByObject(query),
        method: 'POST',
        json: fields
    };

    return request(options)
        .then(responseHandler.parsePostIndex)
        .catch(errorHandler.throwDREAMSHttpError);
};

exports.purgeIndices = function() {
    var options = {
        resolveWithFullResponse: true,
        uri: config.API_URL + '_indices/skill',
        method: 'DELETE'
    };

    return request(options)
        .then(responseHandler.parseDelete)
        .catch(errorHandler.throwDREAMSHttpError);
};
