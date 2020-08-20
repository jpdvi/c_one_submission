module.exports = {
  "questions": "CREATE TABLE IF NOT EXISTS questions (id serial, qid character varying UNIQUE, question character varying, answers character varying[], correct_answer character varying)"
}
