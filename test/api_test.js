const SQLMethods = require('../sql');
const expect = require("chai").expect;
const dotenv = require('dotenv').config();
const crypto = require("crypto");
const axios  = require('axios');
const errors = require('../errors');
//Brief example of api test would build out more thoroughly for production
let id = null;
describe("API Running", function(){
  it ('running', async function(){
      let response = await axios.get(process.env.API_HOST)
      .then((res)=>{
        expect(res.status).to.equal(200)
      })
  })
  it ('get 404', async function(){
    let response = await axios.get(process.env.API_HOST+crypto.randomBytes(8).toString('hex'))
    .catch((err)=>{
        expect(err.response.status).to.equal(404)
    })
  })

  it ('post 404', async function(){
    let response = await axios.post(process.env.API_HOST+crypto.randomBytes(8).toString('hex'), {})
    .catch((err)=>{
        expect(err.response.status).to.equal(404)
    })
  })
})

describe("API Submit User Info", function(){
  it ('submit-info-success', async function(){
    let payload = {"first_name":crypto.randomBytes(8).toString('hex'),
                   "last_name":crypto.randomBytes(8).toString('hex'),
                   "email":`${crypto.randomBytes(8).toString('hex')}@test.com`}
    let request = await axios.post(process.env.API_HOST+'submit-info',payload)
    .then((res)=>{
      id = res.data.payload.id;
      expect(res.status).to.equal(200);
      expect(res.data.payload.id).to.be.a('string');
    })
    .catch((err)=>{
    })
  })
  //

  it ('submit-info-missing-all-fields', async function(){
    let request = await axios.post(process.env.API_HOST+'submit-info',{})
    .then((res)=>{

    })
    .catch((err)=>{
      expect(err.response.status).to.equal(400);
    })
  })

  describe("Quiz", function(){
    it('start-quiz-success', async function(){
      let request = await axios.post(process.env.API_HOST+'start-quiz',{"id":id})
      .then((res)=>{
        expect(Object.keys(res.data.payload.start_time).length).to.be.above(0)
        expect(res.status).to.equal(200)
      })
      .catch((err)=>{
      })
    })
    it('start-quiz-fail', async function(){
      let request = await axios.post(process.env.API_HOST+'start-quiz',{"id":crypto.randomBytes(8).toString('hex')})
      .catch((err)=>{
        expect(err.response.status).to.equal(400)
      })
    })
    it('start-quiz-duplicate-fail', async function(){
      let request = await axios.post(process.env.API_HOST+'start-quiz',{"id":id})
      .catch((err)=>{
        expect(err.response.status).to.equal(400)
      })
    })
    it('next-question', async function(){
      let request = await axios.post(process.env.API_HOST+'next-question', {"id":id})
      .then((res)=>{
        expect(res.status).to.equal(200)
        expect(Object.keys(res.payload)).to.include('id')
        expect(Object.keys(res.payload)).to.include('data')
      })
      .catch((err)=>{
      })
    })
  })
})
