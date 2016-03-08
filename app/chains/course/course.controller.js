'use strict';

var courseDao = require('./course.dao');
var Promise = require('bluebird');
var errorHandler = require('../../utils/error.handler');
var utils = require('../../utils/utils');

// TODO: Make the validation more covering
function validateCourse(course) {
    return new Promise(function(resolve, reject) {
        if (course && course.name) {
            course = utils.extend(getCourseTemplate(), course);
            return resolve(course);
        }

        return errorHandler.getHttpError(400)
            .then(reject);
    });
}

function getCourseTemplate() {
    return {
        name: null
    };
}

exports.createNewCourse = function(courseObject) {
    return validateCourse(courseObject)
        .then(courseDao.createNewCourse);
};

exports.getCourseById = function(id) {
    return courseDao.getCourseById(id);
};

exports.getCourses = function(query) {
    return courseDao.getCourses(query);
};

exports.deleteCourseById = function(id) {
    return courseDao.deleteCourseById(id);
};

exports.purgeIndices = function() {
    return courseDao.purgeIndices();
};

exports.createIndex = function(fields, options) {
    return courseDao.createIndex(fields, options);
};
