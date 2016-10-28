var fs = require('fs');
var nock = require('nock');

var BypassAuth;

describe('BypassAuth', function() {
  beforeEach(function() {
    BypassAuth = require("../lib/bypass_auth.js");
  });

  describe(".loginWithCredentials", function() {
    beforeEach(function() {
      var scope = nock('http://localhost:3005')
        .post('/auth')
        .reply(200, JSON.parse(fs.readFileSync(__dirname + '/fixtures/admin_auth.json')));
    });

    it("returns a promise", function(){
      var promise = BypassAuth.loginWithCredentials("http://localhost:3005", "user", "password", "User");
      expect(typeof(promise.then)).toEqual('function');
    });

    it("returns admin data if successful", function(done) {
      var promise = BypassAuth.loginWithCredentials("http://localhost:3005", "user", "password", "User");
      promise.then(function(admin) {
        expect(admin).toEqual(JSON.parse(fs.readFileSync(__dirname + '/fixtures/admin_auth.json')));
        done();
      })
    });
  });

  describe(".login", function() {
    beforeEach(function() {
      var scope = nock('http://localhost:3005')
        .get('/session')
        .reply(200, JSON.parse(fs.readFileSync(__dirname + '/fixtures/admin_session.json')));
    });

    it("throws an error if no session_token is passed in", function() {
      expect(()=> { BypassAuth.login() }).toThrow(new Error("Invalid session token"));
    });

    it("returns a promise", function() {
      var promise = BypassAuth.login("http://localhost:3005", "sdfgjdsfgfds");
      expect(typeof(promise.then)).toEqual('function');
    });

    it("returns admin data if successful", function(done) {

      var promise = BypassAuth.login("http://localhost:3005", "CORRECT");
      promise.then(function(admin) {
        expect(admin).toEqual(JSON.parse(fs.readFileSync(__dirname + '/fixtures/admin_session.json')));
        done();
      });
    });
  });

  describe(".deviceLogin", function() {
    beforeEach(function() {
      var scope = nock('http://localhost:3005')
        .get('/session')
        .reply(200, JSON.parse(fs.readFileSync(__dirname + '/fixtures/auth.json')));
    });

    it("throws an error if no session_token is passed in", function() {
      expect(()=> { BypassAuth.deviceLogin() }).toThrow(new Error("Invalid device token"));
    });

    it("returns a promise", function() {
      var promise = BypassAuth.deviceLogin("http://localhost:3005", "sdfgjdsfgfds");
      expect(typeof(promise.then)).toEqual('function');
    });

    it("returns user data if successful", function(done) {

      var promise = BypassAuth.deviceLogin("http://localhost:3005", "CORRECT");
      promise.then(function(user) {
        expect(user).toEqual({"user": {}});
        done();
      });
    });
  });

  describe(".restrictToAdmin", function() {
    it("calls next if account.type is Admin", function() {
      var spy = jasmine.createSpy();
      BypassAuth.restrictToAdmin({user: {account: {type: "Admin"}}}, {}, spy);
      expect(spy).toHaveBeenCalled();
    });

    it("sends a 401 if not an Admin", function() {
      var spy = jasmine.createSpyObj('res', ['sendStatus']);
      BypassAuth.restrictToAdmin({user: {account: {type: "User"}}}, spy, {});
      expect(spy.sendStatus).toHaveBeenCalledWith(401);
    });
  });

  describe(".restrictToSuperAdmin", function() {
    it("calls next if account is super_admin", function() {
      var spy = jasmine.createSpy();
      BypassAuth.restrictToSuperAdmin({user: {account: {type: "Admin", super_admin: true}}}, {}, spy);
      expect(spy).toHaveBeenCalled();
    });

    it("sends a 401 if not an Admin", function() {
      var spy = jasmine.createSpyObj('res', ['sendStatus']);
      BypassAuth.restrictToSuperAdmin({user: {account: {type: "Admin"}}}, spy, {});
      expect(spy.sendStatus).toHaveBeenCalledWith(401);
    });
  });

  describe(".restrictToVenues", function() {
    it("returns a 401 if the venue id is not in the account venue ids", function() {
      var spy = jasmine.createSpyObj('res', ['sendStatus']);
      BypassAuth.restrictToVenues({params: {venue_id: 4}, user: {account: {venue_ids: [1,2,3]}}}, spy)
      expect(spy.sendStatus).toHaveBeenCalledWith(401);
    });

    it("returns a 401 if there are no account venues", function() {
      var spy = jasmine.createSpyObj('res', ['sendStatus']);
      BypassAuth.restrictToVenues({params: {venue_id: 4}, user: {account: {}}}, spy)
      expect(spy.sendStatus).toHaveBeenCalledWith(401);
    });

    it("returns a 401 if no venue was passed in", function() {
      var spy = jasmine.createSpyObj('res', ['sendStatus']);
      BypassAuth.restrictToVenues({params: {}, user: {account: {venue_ids: [1,2,3,4]}}}, spy)
      expect(spy.sendStatus).toHaveBeenCalledWith(401);
    });

    it("calls next if the venue id is in the account venue ids", function() {
      var nextSpy = jasmine.createSpy();
      BypassAuth.restrictToVenues({params: {venue_id: 3}, user: {account: {venue_ids: [1,2,3]}}}, {}, nextSpy)
      expect(nextSpy).toHaveBeenCalled();
    });

    it("calls next if the user is a super admin", function() {
      var nextSpy = jasmine.createSpy('nextSpy');
      BypassAuth.restrictToVenues({params: {venue_id: 10}, user: {account: {super_admin: true, venue_ids: [1,2,3]}}}, {}, nextSpy);
      expect(nextSpy).toHaveBeenCalled();
    });
  });

});
