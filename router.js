#!/usr/bin/env node
const bodyParser = require('body-parser');
const Quiz       = require('./quiz');
const uuid       = require('./utils/uuid');
const errors     = require('./errors');
const dotenv     = require('dotenv').config();
const logger = require('./logger')();

module.exports = class Router
{
  constructor(app, express){
    this.app       = app;
    this.express   = express;
    this.router    = this.express.Router();
    this.sql_methods = null;
    this.quizzes = {};
  }
//==========================================================================
//  Utility Methods
//==========================================================================

  formatReponse(code, success, data)
  {
    let payload = {"status":code, "success":success, "payload":data};
    return payload;
  }

  quiz(first_name, last_name)
  {
    let id = uuid(4);
    this.quizzes[id] = new Quiz(first_name,
                                last_name,
                                id,
                                process.env.DEFAULT_TIMEOUT_MINUTES*60,
                                process.env.DEFAULT_QUESTION_LENGTH);
    return id;
  }


//==========================================================================
//  Router
//==========================================================================

  async initRouter(){
    this.app.use(bodyParser.urlencoded({extended: true}));
    this.app.use(bodyParser.json());

    let self = this;

    this.router.get('/', function(req,res,next){
      res.send(self.formatReponse(200, true, "confirmed"));
    });

  //==========================================================================
  //  Quiz Methods
  //==========================================================================


  this.router.post('/start-quiz', async function(req, res ,next){
    //Must Submit User Info @submit-info to acquire ID
    if (Object.keys(req.body).includes("id") &&
        Object.keys(self.quizzes).includes(req.body.id) &&
        !self.quizzes[req.body.id].active())
    {
      logger.info(`Starting Quiz for ID : ${req.body.id}`);
      let start_time =  await self.quizzes[req.body.id].start();
      let payload = self.formatReponse(200, true,
        {"id":req.body.id, "start_time":start_time, "time_left":self.quizzes[req.body.id].timeLeft()});
      res.status(200).send(payload);
    }
    else
    {
      logger.error(`Start Quiz Error : ID:${req.body.id} | ${errors.missing_quiz_id}`);
      let payload = self.formatReponse(400, false, {"error":errors.missing_quiz_id});
      res.status(400).send(payload);
    }
  });

  this.router.post('/next-question', function(req, res, next){
      if(Object.keys(req.body).includes('id') && Object.keys(self.quizzes).includes(req.body.id) && self.quizzes[req.body.id].active())
      {
        let current_question = self.quizzes[req.body.id].currentQuestion();
        logger.info(`Next Question for ID: ${req.body.id} | QID: ${current_question.qid}`);
        res.status(200).send(self.formatReponse(200, true, {"id":req.body.id,
                            "data":current_question,
                            "time_left":self.quizzes[req.body.id].timeLeft(),
                            "done":self.quizzes[req.body.id].complete}));
      }
      else if(Object.keys(req.body).includes('id') && Object.keys(self.quizzes).includes(req.body.id) && !self.quizzes[req.body.id].active())
      {
        res.status(400).send(self.formatReponse(400, false, {"error": errors.quiz_not_started}));
      }
      else {
        res.status(400).send(self.formatReponse(400, false, {"error": errors.missing_quiz_id}));
      }
  });

  this.router.post('/submit-question', function(req,res,next){
    if(Object.keys(req.body).includes('id') &&
       Object.keys(req.body).includes('answer') &&
       Object.keys(self.quizzes).includes(req.body.id))
    {
      if (!self.quizzes[req.body.id].isExpired() &&
          !self.quizzes[req.body.id].questions[req.body.qid].submitted &&
          !self.quizzes[req.body.id].complete)
      {
        logger.info(`Submit Question for ID: ${req.body.id} | QID: ${req.body.qid}`);
        self.quizzes[req.body.id].submit(req.body.qid, req.body.answer);
        res.status(200).send(self.formatReponse(200, true,
          {"done":self.quizzes[req.body.id].complete,"time_left":self.quizzes[req.body.id].timeLeft()}));
      }
      else if (Object.keys(req.body).includes('id') &&
               Object.keys(req.body).includes('answer') &&
               self.quizzes[req.body.id].complete)
      {
        logger.info(`Submit Question Quiz Complete idea: ${req.body.id}`);
        res.status(200).send(self.formatReponse(200, true,
          {"done":self.quizzes[req.body.id].complete, "time_left":self.quizzes[req.body.id].timeLeft()}));
      }
      else if (self.quizzes[req.body.id].isExpired()
              && !self.quizzes[req.body.id].questions[req.body.qid].submitted
              && !self.quizzes[req.body.id].complete)
      {
        res.status(400).send(self.formatReponse(400, false, {"error": errors.quiz_expired}));
      }
      else {
        res.status(400).send(self.formatReponse(400, false, {"error": errors.question_submitted}));
      }
    }
    else{
      res.status(400).send(self.formatReponse(400, false, {"error": errors.quiz_missing}));
    }
  });

  //==========================================================================
  // User Methods
  //==========================================================================

  this.router.post('/submit-info', function(req, res, next){
    //Submit User Info. Returns ID which is used to access quiz properties
    if (!req.body.first_name || !req.body.last_name || !req.body.email)
    {
      res.status(400).send(self.formatReponse(400, false, {"error": errors.submit_missing}));
    }
    // TODO: Email parse
    else
    {
      logger.info(`Submitting User Info fn: ${req.body.first_name} ln: ${req.body.last_name} e: ${req.body.email}`);
      let quiz_id = self.quiz(req.body.first_name, req.body.last_name, req.body.email);
      res.status(200).send(self.formatReponse(200, true, {"id":quiz_id}));
    }
  });

  //==========================================================================
  //  Routing Error Methods
  //==========================================================================

  this.router.get('*', function(req,res,next){
    res.status(404).send(self.formatReponse(404, false, null));
  });

  this.router.post('*', function(req, res, next){
    res.status(404).send(self.formatReponse(404, false, null));
  });

  this.app.use('/',this.router);
  }
};
