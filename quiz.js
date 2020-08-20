const moment = require('moment');
const SQLMethods = require('./sql');

module.exports = class Quiz
{
  constructor(first_name, last_name, id, time_limit, question_length)
  {
    this.first_name = first_name;
    this.last_name  = last_name;
    this.id         = id;
    this.start_time = null;
    this.current_question = {};
    this.cid            = 0;
    this.max_questions  = question_length;
    this.time_limit     = time_limit;
    this.complete       = false;
    this.expired        = false;
  }

  async start()
  {
    this.sm = new SQLMethods();
    this.questions = await this.fetchQuestions();
    this.current_question = this.questions[Object.keys(this.questions)[this.cid]];
    this.start_time = moment();
    return this.start_time;
  }

  submit(qid, answer)
  {
    if(Object.keys(this.questions).includes(qid))
    {
      this.questions[qid].user_answer = answer;
      this.questions[qid].submitted   = true;
      this.cid++;
      this.current_question = this.questions[Object.keys(this.questions)[this.cid]];
      if ( this.cid > this.max_questions - 1)
      {
        this.complete = true;
      }
    }
  }

  currentQuestion()
  {
    let formatted_question = {};
    formatted_question.qid     = this.current_question.qid;
    formatted_question.text    = this.current_question.question;
    formatted_question.answers = this.current_question.answers;
    return formatted_question;
  }

  active()
  {
    return(this.start_time != null && this.complete == false);
  }

  timeLeft()
  {
    let difference = moment.duration(moment().diff(this.start_time));
    let seconds_left = this.time_limit - difference.minutes()*60 - difference.hours()*60*60 - difference.seconds();
    if (seconds_left <= 0)
    {
      this.expired = true;
    }
    return seconds_left;
  }

  isExpired()
  {
    let time_left = this.timeLeft();
    if (time_left <= 0)
    {
      this.expired = true;
    }
    return this.expired;
  }

  async fetchQuestions()
  {
    let questions = await this.sm.questionSelectAll(this.max_questions);
    let obj = {};
    questions.forEach((q, idx)=>{
      q.index = idx;
      q.user_answer = null;
      q.submitted = false;
      obj[q.qid] = q;
    });
    return obj;
  }
};
