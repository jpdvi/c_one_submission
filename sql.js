const {Pool, Client} = require('pg');
const dotenv         = require('dotenv').config();

module.exports = class SQLMethods
{
  constructor()
  {
    this.con = null;
    this.init();
  }

  async init()
  {
    await this.connectToSql();
  }

  executeSqlQuery(q)
  {
    let self = this;
    return new Promise(function(resolve, reject){
      self.con.query(q, function(err, result, field){
        if (err)
        {
          reject(err)
          console.log(err);
        }
        resolve(result)
      })
    })
  }

  async connectToSql()
  {
    let self = this;
    let connection = new Pool({
      connectLimit : 10,
      host:process.env.DB_HOST,
      user:process.env.DB_USER,
      password:process.env.DB_PASSWORD,
      database:process.env.DB_NAME
    })
    this.con = connection;
    return
  }
  
  end()
  {
    this.con.end();
  }

  async questionInsert(question, answers, correct_answer, qid)
  {
    let self = this;
    let query = `INSERT INTO questions (question, answers, correct_answer, qid)
                 SELECT '${question}', '${answers}', '${correct_answer}', '${qid}'
                 WHERE NOT EXISTS (SELECT 1 FROM questions WHERE question = '${question}')`;
    let result = await this.executeSqlQuery(query);
    return result
  }

  async questionSelectAll(number)
  {
    // This has very poor performance on large data sets.
    // Would need to handle random selection in the api side in production
    let query = `SELECT * FROM questions ORDER BY RANDOM() LIMIT ${number}`
    let result = await this.executeSqlQuery(query);
    return result.rows;
  }
}
