var bytes = require('bytes');
var expect = require('expect.js');
var supertest = require('supertest');
var moment = require('moment');
var express = require('express');
var app = require('../');

describe('', function() {
  describe('GET /users', function() {
    it('200 "user#index"', function(done) {
      supertest(app)
      .get('/users')
      .expect(200)
      .expect('user#index', done);
    });
  });

  describe('json middleware', function() {

    describe('strict option is false (default)', function() {
      var app = express();
      app.use(express.json({ strict: false }));
      app.post('/', function(req, res) { res.send('root'); });

      describe('POST / ("string")', function() {
        it('200', function(done) {
          supertest(app)
          .post('/')
          .type('json')
          .send('"string"')
          .expect(200, done);
        });
      });

      describe('POST / ({ "key": "value" })', function() {
        it('200', function(done) {
          supertest(app)
          .post('/')
          .type('json')
          .send('{ "key": "value" }')
          .expect(200, done);
        });
      });

      describe('POST / ([ "value1", "value2" ])', function() {
        it('200', function(done) {
          supertest(app)
          .post('/')
          .type('json')
          .send('[ "value1", "value2" ]')
          .expect(200, done);
        });
      });
    });

    describe('strict option is true', function() {
      var app = express();
      app.use(express.json({ strict: true }));
      app.post('/', function(req, res) { res.send('root'); });

      describe('POST / ("string")', function() {
        it('400', function(done) {
          supertest(app)
          .post('/')
          .type('json')
          .send('string')
          .expect(400, done);
        });
      });

      describe('POST / ({ "key": "value" })', function() {
        it('200', function(done) {
          supertest(app)
          .post('/')
          .type('json')
          .send({ key: 'value' })
          .expect(200, done);
        });
      });

      describe('POST / ([ "value1", "value2" ])', function() {
        it('200', function(done) {
          supertest(app)
          .post('/')
          .type('json')
          .send([ 'value1', 'value2' ])
          .expect(200, done);
        });
      });
    });

    describe('reviver option (default)', function() {
      var app = express();
      app.use(express.json());
      app.post('/', function(req, res) { res.send('n=' + req.body.n); });

      describe('POST / (n=5)', function() {
        it('200 "n=5"', function(done) {
          supertest(app)
          .post('/')
          .type('json')
          .send({ n: 5 })
          .expect(200)
          .expect('n=5', done);
        });
      });
    });

    describe('reviver option (number*2)', function() {
      var app = express();
      app.use(express.json({
        reviver: function(k, v) {
          if (typeof v === 'number') {
            return v * 2;
          }
          return v;
        }
      }));
      app.post('/', function(req, res) { res.send('n=' + req.body.n); });

      describe('POST / (n=5)', function() {
        it('200 "n=10"', function(done) {
          supertest(app)
          .post('/')
          .type('json')
          .send({ n: 5 })
          .expect(200)
          .expect('n=10', done);
        });
      });
    });

    describe('limit option (default)', function() {
      var app = express();
      app.use(express.json());
      app.post('/', function(req, res) { res.send('root'); });

      describe('POST / (1mb data)', function() {
        it('200', function(done) {
          var data_length = bytes('1mb');
          var data = [ new Array(data_length + 1 - '[""]'.length).join('x') ];
          supertest(app)
          .post('/')
          .type('json')
          .send(data)
          .expect(200, done)
        });
      });

      describe('POST / (>1mb data)', function() {
        it('413', function(done) {
          var data_length = bytes('1mb') + 1;
          var data = [ new Array(data_length + 1 - '[""]'.length).join('x') ];
          supertest(app)
          .post('/')
          .type('json')
          .send(data)
          .expect(413, done)
        });
      });
    });

    describe('limit option (2mb)', function() {
      var app = express();
      app.use(express.json({ limit: bytes('2mb') }));
      app.post('/', function(req, res) { res.send('root'); });

      describe('POST / (2mb data)', function() {
        it('200', function(done) {
          var data_length = bytes('2mb');
          var data = [ new Array(data_length + 1 - '[""]'.length).join('x') ];
          supertest(app)
          .post('/')
          .type('json')
          .send(data)
          .expect(200, done)
        });
      });

      describe('POST / (>2mb data)', function() {
        it('200', function(done) {
          var data_length = bytes('2mb') + 1;
          var data = [ new Array(data_length + 1 - '[""]'.length).join('x') ];
          supertest(app)
          .post('/')
          .type('json')
          .send(data)
          .expect(413, done)
        });
      });

    });

    describe('verify options', function() {
      describe('always return 403 "verify error"', function() {
        it('403', function(done) {
          var app = express();
          app.use(express.json({
            verify: function(req, res, buf) {
              var e = new Error('verify error');
              throw e;
            }
          }));
          app.post('/', function(req, res) { res.send('root'); });
          supertest(app)
          .post('/')
          .send({ user: 'name' })
          .expect(403, done);
        });
      });

      describe('always return 404 "not found"', function() {
        it('404', function(done) {
          var app = express();
          app.use(express.json({
            verify: function(req, res, buf) {
              var e = new Error('not found');
              e.status = 404;
              throw e;
            }
          }));
          app.post('/', function(req, res) { res.send('root'); });
          supertest(app)
          .post('/')
          .send({ user: 'name' })
          .expect(404, done);
        });
      });
    });
  });

  describe('urlencoded middleware', function() {
      var app = express();
      app.use(express.urlencoded());
      app.post('/', function(req, res) { res.send(req.body.name); });

      describe('POST /', function() {
        it('200', function(done) {
          supertest(app)
          .post('/')
          .type('urlencoded')
          .send({ name: 'value' })
          .expect(200)
          .expect('value', done);
        });
      });
  });

});

