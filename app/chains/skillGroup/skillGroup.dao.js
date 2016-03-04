'use strict';

var request = require('request-promise');
var config = require('config');
var Promise = require('bluebird');
var responseHandler = require('../../utils/response.handler');
var errorHandler = require('../../utils/error.handler');
var utils = require('../../utils/utils');

var url = config.API_URL + 'skillGroup';

exports.createNewSkillGroup = function(skillGroup) {
    var options = {
        resolveWithFullResponse: true,
        uri: url,
        method: 'POST',
        json: skillGroup,
        gzip: true
    };

    return request(options)
        .then(responseHandler.parsePost)
        .catch(errorHandler.throwDREAMSHttpError);
};

exports.getSkillGroupById = function(id) {
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

exports.getSkillGroups = function(query) {
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

exports.updateSkillGroup = function(skillGroup) {
    var options = {
        resolveWithFullResponse: true,
        uri: url + '/' + skillGroup._id,
        method: 'PUT',
        json: skillGroup
    };

    return request(options)
        .then(responseHandler.parsePut)
        .catch(errorHandler.throwDREAMSHttpError);
};

exports.deleteSkillGroupById = function(id) {
    var options = {
        resolveWithFullResponse: true,
        uri: url + '/' + id,
        method: 'DELETE'
    };

    return request(options)
        .then(responseHandler.parseDelete)
        .catch(errorHandler.throwDREAMSHttpError);
};
