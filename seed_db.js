const crypto    = require('crypto');
const fs        = require('fs');
const tables    = require('./scripts/io/tables.js');
const questions = JSON.parse(fs.readFileSync('./scripts/io/dump/questions.json', 'utf8')).results;
const SQLMethods = require('./sql');

let sql_methods = new SQLMethods();
sql_methods.executeSqlQuery(tables.questions)
.then((res)=>{
  questions.forEach((q, idx)=>{
    if (idx % 5 === 0)
    {
      q.question = `<div><img src=https://picsum.photos/200/300/?random/><p>${q.question}</p></div>`
    }
    else
    {
      q.question = `<p>${q.question}</p>}`
    }
    let answers = `{${q.incorrect_answers.map((a)=>{return(a.toString())}).concat([q.correct_answer]).toString()}}`;
    sql_methods.questionInsert(q.question, answers, q.correct_answer, crypto.randomBytes(8).toString('hex'));
  })
});
