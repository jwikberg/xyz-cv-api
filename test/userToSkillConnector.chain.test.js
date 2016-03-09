'use strict';

var server = require('../app/server');
var request = require('supertest');
var expect = require('expect.js');
var nock = require('nock');
var config = require('config');
var msg = require('../app/utils/message.handler');
var url = 'localhost:' + config.PORT;
var mockedUrl = config.API_URL;
var cacheHandler = require('../app/utils/cache.handler');

describe('/userToSkillConnector', function() {

    beforeEach(function(done) {
        cacheHandler.setToUserRoleCache('a@softhouse.se', 'admin');
        cacheHandler.setToRoleAttributesCache('admin', ['canEditUser', 'canViewUser']);
        done();
    });

    afterEach(function(done) {
        nock.cleanAll();
        cacheHandler.clearUserRoleCache();
        cacheHandler.clearRoleAttributesCache();
        done();
    });

    var getUserByEmailResponse = [{
        _id:'558bacd8ed289d0f00d2c5f3',
        email:'a@softhouse.se',
        name:'A',
        createdAt:'2015-06-25T07:25:12.523Z',
        updatedAt:'2015-06-25T07:25:12.523Z'
    }];

    //===============================================================================

    it('should reply with HTTP status code 200 and a correctly formatted JSON object when posting a userToSkillConnector', function(done) {
        var resultPost = {
            skillId: '123',
            userId: '456',
            level: '3',
            futureLevel: '4',
            years: '5',
            expertise: 'true',
            experience: 'true',
            createdAt: '2015-06-16T10:33:27.803Z',
            updatedAt: '2015-06-16T10:33:27.803Z',
            _id: '557ffb779a81250f00194d60'
        };

        nock(mockedUrl)
            .post('/userToSkillConnector', {
                skillId: '123',
                userId: '456',
                level: '3',
                futureLevel: '4',
                years: '5',
                expertise: 'true',
                experience: 'true'
            })
            .reply(200, resultPost)

            .get('/user?email=a@softhouse.se&')
            .reply(200, getUserByEmailResponse);

        request(url)
            .post('/userToSkillConnector')
            .set('x-forwarded-email', 'a@softhouse.se')
            .set('x-forwarded-user', 'A')
            .set('Content-Type', 'application/json')
            .send({
                skillId: '123',
                userId: '456',
                level: '3',
                futureLevel: '4',
                years: '5',
                expertise: 'true',
                experience: 'true'
            })

            // end handles the response
            .end(function(err, res) {
                if (err) {
                    throw err;
                }

                expect(res).to.exist;
                expect(res.status).to.equal(200);
                expect(JSON.stringify(res.body)).to.equal(JSON.stringify(resultPost));
                done();
            });
    });

    //===============================================================================

    it('should reply with HTTP status code 400 and a correctly formatted string when posting a userToSkillConnector with no body', function(done) {
        var resultNoArg = msg.INVALID_JSON_OBJECT;

        var badResultPost = {
            skillId: '123',
            userId: '456',
            createdAt: '2015-06-16T13:46:07.589Z',
            updatedAt: '2015-06-16T13:46:07.589Z',
            _id: '5580289f9a81250f00194d61'
        };

        nock(mockedUrl)
            .post('/userToSkillConnector')
            .reply(200, badResultPost)

            .get('/user?email=a@softhouse.se&')
            .reply(200, getUserByEmailResponse);

        request(url)
            .post('/userToSkillConnector')
            .set('x-forwarded-email', 'a@softhouse.se')
            .set('x-forwarded-user', 'A')
            .set('Content-Type', 'application/json')
            .send()

            // end handles the response
            .end(function(err, res) {
                expect(err).to.exist;
                expect(res).to.exist;
                expect(res.status).to.equal(400);
                expect(res.error.text).to.equal(resultNoArg);
                done();
            });
    });

    //===============================================================================

    it('should reply with HTTP status code 400 and a correctly formatted string when posting a userToSkillConnector with the field for skill id empty', function(done) {
        var resultNoArg = msg.INVALID_JSON_OBJECT;

        var badResultPost = {
            skillId: '123',
            userId: '456',
            createdAt: '2015-06-16T13:46:07.589Z',
            updatedAt: '2015-06-16T13:46:07.589Z',
            _id: '5580289f9a81250f00194d61'
        };

        nock(mockedUrl)
            .post('/userToSkillConnector')
            .reply(200, badResultPost)

            .get('/user?email=a@softhouse.se&')
            .reply(200, getUserByEmailResponse);

        request(url)
            .post('/userToSkillConnector')
            .set('x-forwarded-email', 'a@softhouse.se')
            .set('x-forwarded-user', 'A')
            .set('Content-Type', 'application/json')
            .send({
                skillId: '',
                userId: '123'
            })

            // end handles the response
            .end(function(err, res) {
                expect(err).to.exist;
                expect(res).to.exist;
                expect(res.status).to.equal(400);
                expect(res.error.text).to.equal(resultNoArg);
                done();
            });
    });

    //===============================================================================

    it('should reply with HTTP status code 400 and a correctly formatted string when posting a userToSkillConnector with the field for user id empty', function(done) {
        var resultNoArg = msg.INVALID_JSON_OBJECT;

        var badResultPost = {
            skillId: '123',
            userId: '456',
            createdAt: '2015-06-16T13:46:07.589Z',
            updatedAt: '2015-06-16T13:46:07.589Z',
            _id: '5580289f9a81250f00194d61'
        };

        nock(mockedUrl)
            .post('/userToSkillConnector')
            .reply(200, badResultPost)

            .get('/user?email=a@softhouse.se&')
            .reply(200, getUserByEmailResponse);

        request(url)
            .post('/userToSkillConnector')
            .set('x-forwarded-email', 'a@softhouse.se')
            .set('x-forwarded-user', 'A')
            .set('Content-Type', 'application/json')
            .send({
                skillId: '123',
                userId: ''
            })

            // end handles the response
            .end(function(err, res) {
                expect(err).to.exist;
                expect(res).to.exist;
                expect(res.status).to.equal(400);
                expect(res.error.text).to.equal(resultNoArg);
                done();
            });
    });

    //===============================================================================

    it('should correctly extract the needed properties and reply with HTTP status code 200 and a correctly formatted string when posting a userToSkillConnector with too many fields in the body', function(done) {

        var resultPost = {
            skillId: '123',
            userId: '456',
            level: '2',
            futureLevel: '3',
            years: '5',
            expertise: 'true',
            experience: 'true',
            createdAt: '2015-06-16T13:46:07.589Z',
            updatedAt: '2015-06-16T13:46:07.589Z',
            _id: '5580289f9a81250f00194d61'
        };

        nock(mockedUrl)
            .post('/userToSkillConnector', {
                skillId: '123',
                userId: '456',
                level: '2',
                futureLevel: '3',
                years: '5',
                expertise: 'true',
                experience: 'true',
            })
            .reply(200, resultPost)

            .get('/user?email=a@softhouse.se&')
            .reply(200, getUserByEmailResponse);

        request(url)
            .post('/userToSkillConnector')
            .set('x-forwarded-email', 'a@softhouse.se')
            .set('x-forwarded-user', 'A')
            .set('Content-Type', 'application/json')
            .send({
                skillId: '123',
                userId: '456',
                level: '2',
                futureLevel: '3',
                years: '5',
                expertise: 'true',
                experience: 'true',
                id: '789'
            })

            // end handles the response
            .end(function(err, res) {
                expect(err).to.exist;
                expect(res).to.exist;
                expect(res.status).to.equal(200);
                expect(JSON.stringify(res.body)).to.equal(JSON.stringify(resultPost));
                done();
            });
    });

    //===============================================================================

    it('should reply with HTTP status code 400 and a correctly formatted string when posting a userToSkillConnector with no skillId field', function(done) {
        var resultNoArg = msg.INVALID_JSON_OBJECT;

        var badResultPost = {
            skillId: '123',
            userId: '456',
            createdAt: '2015-06-16T13:46:07.589Z',
            updatedAt: '2015-06-16T13:46:07.589Z',
            _id: '5580289f9a81250f00194d61'
        };

        nock(mockedUrl)
            .post('/userToSkillConnector')
            .reply(200, badResultPost)

            .get('/user?email=a@softhouse.se&')
            .reply(200, getUserByEmailResponse);

        request(url)
            .post('/userToSkillConnector')
            .set('x-forwarded-email', 'a@softhouse.se')
            .set('x-forwarded-user', 'A')
            .set('Content-Type', 'application/json')
            .send({
                attribut2eId: '123',
                userId: '456'
            })

            // end handles the response
            .end(function(err, res) {
                expect(err).to.exist;
                expect(res).to.exist;
                expect(res.status).to.equal(400);
                expect(res.error.text).to.equal(resultNoArg);
                done();
            });
    });

    //===============================================================================

    it('should reply with HTTP status code 400 and a correctly formatted string when posting a userToSkillConnector with no userId field', function(done) {
        var resultNoArg = msg.INVALID_JSON_OBJECT;

        var badResultPost = {
            skillId: '123',
            userId: '456',
            createdAt: '2015-06-16T13:46:07.589Z',
            updatedAt: '2015-06-16T13:46:07.589Z',
            _id: '5580289f9a81250f00194d61'
        };

        nock(mockedUrl)
            .post('/userToSkillConnector')
            .reply(200, badResultPost)

            .get('/user?email=a@softhouse.se&')
            .reply(200, getUserByEmailResponse);

        request(url)
            .post('/userToSkillConnector')
            .set('x-forwarded-email', 'a@softhouse.se')
            .set('x-forwarded-user', 'A')
            .set('Content-Type', 'application/json')
            .send({
                skillId: '123',
                rol2eId: '456'
            })

            // end handles the response
            .end(function(err, res) {
                expect(err).to.exist;
                expect(res).to.exist;
                expect(res.status).to.equal(400);
                expect(res.error.text).to.equal(resultNoArg);
                done();
            });
    });

    //===============================================================================

    it('should reply with HTTP status code 400 and a correctly formatted string when posting a userToSkillConnector not correctly formatted as Json', function(done) {

        var resultNotJson = msg.INVALID_JSON;

        var badResultPost = {
            name: 'test1',
            createdAt: '2015-06-16T07:33:14.385Z',
            updatedAt: '2015-06-16T07:33:14.385Z',
            _id: '1234'
        };

        nock(mockedUrl)
            .post('/userToSkillConnector')
            .reply(200, badResultPost)

            .get('/user?email=a@softhouse.se&')
            .reply(200, getUserByEmailResponse);

        request(url)
            .post('/userToSkillConnector')
            .set('x-forwarded-email', 'a@softhouse.se')
            .set('x-forwarded-user', 'A')
            .set('Content-Type', 'application/json')
            .send('name: 1234')

            // end handles the response
            .end(function(err, res) {
                expect(err).to.exist;
                expect(res).to.exist;
                expect(res.status).to.equal(400);
                expect(res.error.text).to.equal(resultNotJson);
                done();
            });
    });

    //===============================================================================

    it('should reply with HTTP status code 200 and a correctly formatted JSON object when getting all userToSkillConnectors', function(done) {
        var resultAllGet = [{
            _id: '557eb8a89a81250f00194d52',
            skillId: '557d7cbc9a81250f00194d46',
            userId: '557eb7199a81250f00194d50',
            createdAt: '2015-06-15T11:36:08.114Z',
            updatedAt: '2015-06-15T11:36:08.114Z'
        }];

        nock(mockedUrl)
            .get('/userToSkillConnector?')
            .reply(200, resultAllGet)

            .get('/user?email=a@softhouse.se&')
            .reply(200, getUserByEmailResponse);

        request(url)
            .get('/userToSkillConnector')
            .set('x-forwarded-email', 'a@softhouse.se')
            .set('x-forwarded-user', 'A')
            .set('Content-Type', 'application/json')
            .send()

            // end handles the response
            .end(function(err, res) {
                if (err) {
                    throw err;
                }

                expect(res).to.exist;
                expect(res.status).to.equal(200);
                expect(JSON.stringify(res.body)).to.equal(JSON.stringify(resultAllGet));
                done();
            });
    });

    //===============================================================================

    it('should reply with HTTP status code 200 and a correctly formatted JSON object when getting userToSkillConnector by its id', function(done) {
        var resultGet = {
            _id: '123',
            skillId: '557d7cbc9a81250f00194d46',
            userId: '557eb7199a81250f00194d50',
            createdAt: '2015-06-15T11:36:08.114Z',
            updatedAt: '2015-06-15T11:36:08.114Z'
        };

        nock(mockedUrl)
            .get('/userToSkillConnector/123')
            .reply(200, resultGet)

            .get('/user?email=a@softhouse.se&')
            .reply(200, getUserByEmailResponse);

        request(url)
            .get('/userToSkillConnector/123')
            .set('x-forwarded-email', 'a@softhouse.se')
            .set('x-forwarded-user', 'A')
            .set('Content-Type', 'application/json')
            .send()

            // end handles the response
            .end(function(err, res) {
                if (err) {
                    throw err;
                }

                expect(res).to.exist;
                expect(res.status).to.equal(200);
                expect(JSON.stringify(res.body)).to.equal(JSON.stringify(resultGet));
                done();
            });
    });

    //===============================================================================

    it('should reply with HTTP status code 200 and a correctly formatted JSON object when getting a userToSkillConnector by user id', function(done) {
        var resultGetByUserId = [{
            _id: '123',
            skillId: '456',
            userId: '789',
            createdAt: '2015-06-15T11:36:08.114Z',
            updatedAt: '2015-06-15T11:36:08.114Z'
        }];

        nock(mockedUrl)
            .get('/userToSkillConnector?userId=789&')
            .reply(200, resultGetByUserId)

            .get('/user?email=a@softhouse.se&')
            .reply(200, getUserByEmailResponse);

        request(url)
            .get('/userToSkillConnector?userId=789')
            .set('x-forwarded-email', 'a@softhouse.se')
            .set('x-forwarded-user', 'A')
            .set('Content-Type', 'application/json')
            .send()

            // end handles the response
            .end(function(err, res) {
                if (err) {
                    throw err;
                }

                expect(res).to.exist;
                expect(res.status).to.equal(200);
                expect(JSON.stringify(res.body)).to.equal(JSON.stringify(resultGetByUserId));
                done();
            });
    });

    //===============================================================================

    it('should reply with HTTP status code 200 and a correctly formatted JSON object when getting a userToSkillConnector by skill id', function(done) {

        var resultGetBySkillId = [{
            _id: '123',
            skillId: '456',
            userId: '789',
            createdAt: '2015-06-15T11:36:08.114Z',
            updatedAt: '2015-06-15T11:36:08.114Z'
        }];

        nock(mockedUrl)
            .get('/userToSkillConnector?skillId=456&')
            .reply(200, resultGetBySkillId)

            .get('/user?email=a@softhouse.se&')
            .reply(200, getUserByEmailResponse);

        request(url)
            .get('/userToSkillConnector?skillId=456')
            .set('x-forwarded-email', 'a@softhouse.se')
            .set('x-forwarded-user', 'A')
            .set('Content-Type', 'application/json')
            .send()

            // end handles the response
            .end(function(err, res) {
                if (err) {
                    throw err;
                }

                expect(res).to.exist;
                expect(res.status).to.equal(200);
                expect(JSON.stringify(res.body)).to.equal(JSON.stringify(resultGetBySkillId));
                done();
            });
    });

    //===============================================================================

    it('should reply with HTTP status code 404 and a correctly formatted string when getting userToSkillConnectors by user id not in the database', function(done) {
        var resultNotInDb = msg.NO_SUCH_ITEM;

        nock(mockedUrl)
            .get('/userToSkillConnector?userId=123&')
            .reply(404, resultNotInDb)

            .get('/user?email=a@softhouse.se&')
            .reply(200, getUserByEmailResponse);

        request(url)
            .get('/userToSkillConnector?userId=123')
            .set('x-forwarded-email', 'a@softhouse.se')
            .set('x-forwarded-user', 'A')
            .set('Content-Type', 'application/json')
            .send()

            // end handles the response
            .end(function(err, res) {
                expect(err).to.exist;
                expect(res).to.exist;
                expect(res.status).to.equal(404);
                expect(res.error.text).to.equal(resultNotInDb);
                done();
            });
    });

    //===============================================================================

    it('should reply with HTTP status code 404 and a correctly formatted string when getting userToSkillConnectors by skill id not in the database', function(done) {
        var resultNotInDb = msg.NO_SUCH_ITEM;

        nock(mockedUrl)
            .get('/userToSkillConnector?skillId=123&')
            .reply(404, resultNotInDb)

            .get('/user?email=a@softhouse.se&')
            .reply(200, getUserByEmailResponse);

        request(url)
            .get('/userToSkillConnector?skillId=123')
            .set('x-forwarded-email', 'a@softhouse.se')
            .set('x-forwarded-user', 'A')
            .set('Content-Type', 'application/json')
            .send()

            // end handles the response
            .end(function(err, res) {
                expect(err).to.exist;
                expect(res).to.exist;
                expect(res.status).to.equal(404);
                expect(res.error.text).to.equal(resultNotInDb);
                done();
            });
    });

    //===============================================================================

    it('should reply with HTTP status code 200 and a correctly formatted string when updating a userToSkillConnector', function(done) {
        var resultPut = msg.SUCCESS_UPDATE;

        var body = {
            level: '1'
        };

        var resultGetById = {
            _id: '123',
            skillId: '456',
            userId: '789',
            level: '3',
            years: '5',
            expertise: 'true',
            experience: 'true',
            createdAt: '2015-06-15T11:36:08.114Z',
            updatedAt: '2015-06-15T11:36:08.114Z'
        };

        nock(mockedUrl)
            .persist()
            .put('/userToSkillConnector/123')
            .reply(204)

            .get('/userToSkillConnector/123')
            .reply(200, resultGetById)

            .get('/user?email=a@softhouse.se&')
            .reply(200, getUserByEmailResponse);

        request(url)
            .put('/userToSkillConnector/123')
            .set('x-forwarded-email', 'a@softhouse.se')
            .set('x-forwarded-user', 'A')
            .set('Content-Type', 'application/json')
            .send(body)

            // end handles the response
            .end(function(err, res) {
                expect(err).to.exist;
                expect(res).to.exist;
                expect(res.status).to.equal(200);
                expect(res.text).to.equal(resultPut);
                done();
            });
    });

    //===============================================================================

    it('should reply with HTTP status code 400 and a correctly formatted string when updating a userToSkillConnector with a not allowed number of years (0)', function(done) {
        var result = msg.INVALID_JSON_OBJECT;

        var body = {
            years: '0'
        };

        var resultGetById = {
            _id: '123',
            skillId: '456',
            userId: '789',
            level: '3',
            futureLevel: '4',
            years: '0',
            expertise: 'true',
            experience: 'true',
            createdAt: '2015-06-15T11:36:08.114Z',
            updatedAt: '2015-06-15T11:36:08.114Z'
        };

        nock(mockedUrl)
            .persist()
            .put('/userToSkillConnector/123')
            .reply(204)

            .get('/userToSkillConnector/123')
            .reply(200, resultGetById)

            .get('/user?email=a@softhouse.se&')
            .reply(200, getUserByEmailResponse);

        request(url)
            .put('/userToSkillConnector/123')
            .set('x-forwarded-email', 'a@softhouse.se')
            .set('x-forwarded-user', 'A')
            .set('Content-Type', 'application/json')
            .send(body)

            // end handles the response
            .end(function(err, res) {
                expect(err).to.exist;
                expect(res).to.exist;
                expect(res.status).to.equal(400);
                expect(res.text).to.equal(result);
                done();
            });
    });

    //===============================================================================

    it('should reply with HTTP status code 400 and a correctly formatted string when updating a userToSkillConnector with a not allowed level (0)', function(done) {
        var result = msg.INVALID_JSON_OBJECT;

        var body = {
            level: '0'
        };

        var resultGetById = {
            _id: '123',
            skillId: '456',
            userId: '789',
            level: '3',
            futureLevel: '4',
            expertise: 'true',
            experience: 'true',
            createdAt: '2015-06-15T11:36:08.114Z',
            updatedAt: '2015-06-15T11:36:08.114Z'
        };

        nock(mockedUrl)
            .persist()
            .put('/userToSkillConnector/123')
            .reply(204)

            .get('/userToSkillConnector/123')
            .reply(200, resultGetById)

            .get('/user?email=a@softhouse.se&')
            .reply(200, getUserByEmailResponse);

        request(url)
            .put('/userToSkillConnector/123')
            .set('x-forwarded-email', 'a@softhouse.se')
            .set('x-forwarded-user', 'A')
            .set('Content-Type', 'application/json')
            .send(body)

            // end handles the response
            .end(function(err, res) {
                expect(err).to.exist;
                expect(res).to.exist;
                expect(res.status).to.equal(400);
                expect(res.text).to.equal(result);
                done();
            });
    });

    //===============================================================================

    //===============================================================================

    it('should reply with HTTP status code 400 and a correctly formatted string when updating a userToSkillConnector with a not allowed level (6)', function(done) {
        var result = msg.INVALID_JSON_OBJECT;

        var body = {
            level: '6'
        };

        var resultGetById = {
            _id: '123',
            skillId: '456',
            userId: '789',
            level: '3',
            futureLevel: '4',
            expertise: 'true',
            experience: 'true',
            createdAt: '2015-06-15T11:36:08.114Z',
            updatedAt: '2015-06-15T11:36:08.114Z'
        };

        nock(mockedUrl)
            .persist()
            .put('/userToSkillConnector/123')
            .reply(204)

            .get('/userToSkillConnector/123')
            .reply(200, resultGetById)

            .get('/user?email=a@softhouse.se&')
            .reply(200, getUserByEmailResponse);

        request(url)
            .put('/userToSkillConnector/123')
            .set('x-forwarded-email', 'a@softhouse.se')
            .set('x-forwarded-user', 'A')
            .set('Content-Type', 'application/json')
            .send(body)

            // end handles the response
            .end(function(err, res) {
                expect(err).to.exist;
                expect(res).to.exist;
                expect(res.status).to.equal(400);
                expect(res.text).to.equal(result);
                done();
            });
    });

    //===============================================================================

    it('should reply with HTTP status code 400 and a correctly formatted string when updating a userToSkillConnector with a not allowed level (6)', function(done) {
        var result = msg.INVALID_JSON_OBJECT;

        var body = {
            level: '6'
        };

        var resultGetById = {
            _id: '123',
            skillId: '456',
            userId: '789',
            level: '3',
            futureLevel: '4',
            expertise: 'true',
            experience: 'true',
            createdAt: '2015-06-15T11:36:08.114Z',
            updatedAt: '2015-06-15T11:36:08.114Z'
        };

        nock(mockedUrl)
            .persist()
            .put('/userToSkillConnector/123')
            .reply(204)

            .get('/userToSkillConnector/123')
            .reply(200, resultGetById)

            .get('/user?email=a@softhouse.se&')
            .reply(200, getUserByEmailResponse);

        request(url)
            .put('/userToSkillConnector/123')
            .set('x-forwarded-email', 'a@softhouse.se')
            .set('x-forwarded-user', 'A')
            .set('Content-Type', 'application/json')
            .send(body)

            // end handles the response
            .end(function(err, res) {
                expect(err).to.exist;
                expect(res).to.exist;
                expect(res.status).to.equal(400);
                expect(res.text).to.equal(result);
                done();
            });
    });

    //===============================================================================

    it('should reply with HTTP status code 200 and a correctly formatted string when deleting a userToSkillConnector by its id', function(done) {
        var resultDelete = msg.SUCCESS_DELETE;

        var resultGetById = {
            _id: '123',
            skillId: '456',
            userId: '789',
            level: '3',
            futureLevel: '4',
            expertise: 'true',
            experience: 'true',
            createdAt: '2015-06-15T11:36:08.114Z',
            updatedAt: '2015-06-15T11:36:08.114Z'
        };

        nock(mockedUrl)
            .delete('/userToSkillConnector/123')
            .reply(204, {})

            .get('/userToSkillConnector/123')
            .reply(200, resultGetById)

            .get('/user?email=a@softhouse.se&')
            .reply(200, getUserByEmailResponse);

        request(url)
            .delete('/userToSkillConnector/123')
            .set('x-forwarded-email', 'a@softhouse.se')
            .set('x-forwarded-user', 'A')
            .set('Content-Type', 'application/json')
            .send()

            // end handles the response
            .end(function(err, res) {
                if (err) {
                    throw err;
                }

                expect(res).to.exist;
                expect(res.status).to.equal(200);
                expect(res.text).to.equal(resultDelete);
                done();
            });
    });

    //===============================================================================

    it('should reply with HTTP status code 404 and a correctly formatted string when deleting a userToSkillConnector not in the database', function(done) {
        var resultUserNotInDb = msg.NO_SUCH_ITEM;

        var resultGetById = {
            _id: '123',
            skillId: '456',
            userId: '789',
            level: '3',
            futureLevel: '4',
            expertise: 'true',
            experience: 'true',
            createdAt: '2015-06-15T11:36:08.114Z',
            updatedAt: '2015-06-15T11:36:08.114Z'
        };

        nock(mockedUrl)
            .delete('/userToSkillConnector/123')
            .reply(404, resultUserNotInDb)

            .get('/userToSkillConnector/123')
            .reply(200, resultGetById)

            .get('/user?email=a@softhouse.se&')
            .reply(200, getUserByEmailResponse);

        request(url)
            .delete('/userToSkillConnector/123')
            .set('x-forwarded-email', 'a@softhouse.se')
            .set('x-forwarded-user', 'A')
            .set('Content-Type', 'application/json')
            .send()

            // end handles the response
            .end(function(err, res) {
                expect(err).to.exist;
                expect(res).to.exist;
                expect(res.status).to.equal(404);
                expect(res.error.text).to.equal(resultUserNotInDb);
                done();
            });
    });
});
