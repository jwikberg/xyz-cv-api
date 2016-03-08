'use strict';

var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var morgan = require('morgan');
var cors = require('cors');
var compression = require('compression');

var attributeRoutes = require('./chains/attribute/attribute.routes')(express.Router());
var userRoutes = require('./chains/user/user.routes')(express.Router());
var roleRoutes = require('./chains/role/role.routes')(express.Router());
var skillRoutes = require('./chains/skill/skill.routes')(express.Router());
var languageRoutes = require('./chains/language/language.routes')(express.Router());
var skillGroupRoutes = require('./chains/skillGroup/skillGroup.routes')(express.Router());
var otherRoutes = require('./chains/other/other.routes')(express.Router());
var officeRoutes = require('./chains/office/office.routes')(express.Router());
var assignmentRoutes = require('./chains/assignment/assignment.routes')(express.Router());
var certificateRoutes = require('./chains/certificate/certificate.routes')(express.Router());
var courseRoutes = require('./chains/course/course.routes')(express.Router());
var customerRoutes = require('./chains/customer/customer.routes')(express.Router());
var domainRoutes = require('./chains/domain/domain.routes')(express.Router());

var fileRoutes = require('./chains/file/file.routes')(express.Router());

var roleToAttributeConnectorRoutes = require('./chains/roleToAttributeConnector/roleToAttributeConnector.routes')(express.Router());
var userToSkillConnectorRoutes = require('./chains/userToSkillConnector/userToSkillConnector.routes.js')(express.Router());
var userToLanguageConnectorRoutes = require('./chains/userToLanguageConnector/userToLanguageConnector.routes.js')(express.Router());
var skillToSkillGroupConnectorRoutes = require('./chains/skillToSkillGroupConnector/skillToSkillGroupConnector.routes.js')(express.Router());
var userToOtherConnectorRoutes = require('./chains/userToOtherConnector/userToOtherConnector.routes.js')(express.Router());
var userToOfficeConnectorRoutes = require('./chains/userToOfficeConnector/userToOfficeConnector.routes.js')(express.Router());
var userToAssignmentConnectorRoutes = require('./chains/userToAssignmentConnector/userToAssignmentConnector.routes.js')(express.Router());
var userToCertificateConnectorRoutes = require('./chains/userToCertificateConnector/userToCertificateConnector.routes.js')(express.Router());
var userToCourseConnectorRoutes = require('./chains/userToCourseConnector/userToCourseConnector.routes.js')(express.Router());

var dbControlRoutes = require('./common/dbControl.routes')(express.Router());
var authenticationRoutes = require('./common/authentication.routes')(express.Router());

var errorMiddleware = require('./middleware/error.middleware');
var authenticationMiddleware = require('./middleware/authentication.middleware');
var responseMiddleware = require('./middleware/response.middleware');

var config = require('config');
var fileHandler = require('./utils/file.handler');

var app = express();

// CONFIG
// ============================================================================
var port = process.env.PORT || config.PORT;

app.set('superSecret', config.SECRET);

// json
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

// logging
app.use(morgan('dev'));

// gzip
app.use(compression());

// ROUTES & MIDDLEWARE
// ============================================================================
app.options('*', cors({credentials: true, origin: true}));
app.use(cors({credentials: true, origin: true}));

// for debugging and demo
app.use('/dbControl', dbControlRoutes);

app.use(authenticationMiddleware.authentication);
app.use(responseMiddleware.nocache);
app.use(fileHandler.getHandler());

app.use('/attribute', attributeRoutes);
app.use('/user', userRoutes);
app.use('/role', roleRoutes);
app.use('/skill', skillRoutes);
app.use('/skillGroup', skillGroupRoutes);
app.use('/other', otherRoutes);
app.use('/office', officeRoutes);
app.use('/assignment', assignmentRoutes);
app.use('/certificate', certificateRoutes);
app.use('/customer', customerRoutes);
app.use('/domain', domainRoutes);
app.use('/language', languageRoutes);
app.use('/course', courseRoutes);

app.use('/file', fileRoutes);
app.use('/authentication', authenticationRoutes);

app.use('/roleToAttributeConnector', roleToAttributeConnectorRoutes);
app.use('/userToSkillConnector', userToSkillConnectorRoutes);
app.use('/skillToSkillGroupConnector', skillToSkillGroupConnectorRoutes);
app.use('/userToOtherConnector', userToOtherConnectorRoutes);
app.use('/userToOfficeConnector', userToOfficeConnectorRoutes);
app.use('/userToAssignmentConnector', userToAssignmentConnectorRoutes);
app.use('/userToCertificateConnector', userToCertificateConnectorRoutes);
app.use('/userToLanguageConnector', userToLanguageConnectorRoutes);
app.use('/userToCourseConnector', userToCourseConnectorRoutes);

app.use(errorMiddleware.errorFilter);

// for debugging
app.get('/kalle', function(req, res) {
    res.send('Your email is: ' + req.headers['x-forwarded-email'] + ' and your accname: ' + req.headers['x-forwarded-user']);
});

var server = app.listen(port, function() {
    console.log('Server started: http://localhost:%s/', server.address().port);
});
