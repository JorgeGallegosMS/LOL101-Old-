const app = require("../server.js")

const chai = require("chai")
const chaiHttp = require('chai-http');
// const mocha = require('mocha')

// chai.config.includeStack = true

const expect = chai.expect
// const describe = mocha.describe
// const it = mocha.it
chai.use(chaiHttp);

describe('Route Testing', () => {

    // Test Case 1
    it('Should redirect from / and return 200 response.', (done) => {
        chai.request(app)
            .get('/')
            .end((err, res) => {
                if (err) done(err);
                expect(res).to.have.status(200);
                done();
            })
    });

    // Test Case 2
    it('Should render champions1 and return 200 response.', (done) => {
        chai.request(app)
            .get('/champions1')
            .end((err, res) => {
                if (err) done(err);
                expect(res).to.have.status(200);
                done();
            })
    });
});