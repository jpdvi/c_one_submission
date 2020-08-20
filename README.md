# Instructions
  ## Environment Setup
    - Install Postgresql

    - Set default DB variables in .env file to local config  

    - Create Database "test"

    - In the .env file set desired question length and quiz time.

    - run npm install in root directroy

    - run npm run db:seed and wait for it to finish

    - run npm run app:start to run linter and start server

    - run npm run test to view unit tests

  ## Workflow
    - All successful requests should return the remaining time on the quiz. If expired it will be 0 or negative.

    - Send POST request to http://localhost:3001/submit-info containing   
      first_name, last_name and email fields in the body of the request.

    - Server will respond with a UUID token. Save this.

    - To start quiz send POST request to http://localhost:3001/start-quiz  
      containing the UUID Token as 'id' in the body.

    - Server will respond with a confirmation and the time_left on the quiz.

    - To get the next question send a POST request to http://localhost:3001/next-question  
      containing the UUID token as 'id' in the body of the request.
    -- the response will contain a QID field which is the id of the question. store this in order to submit response.

    - To submit an answer send a POST request to http://localhost:3001/submit-question with the body containing:  
       id (UUID Token), qid (question id token from next-question)  
       and answer (question answer from next question)

    - When the quiz is complete the submit-question end point  
      will return and 200 code request containing a confirmation.

  ## Examples

  ### Submit User Info
    -Request
       curl -H "Content-type: application/json" -d '{"first_name": "xxx", "last_name":"xxx", "email":"xxx@xxx.com"}'       
       'http://localhost:3001/submit-info'

    -Response
       {"status":200,"success":true,"payload":{"id":"93384d90a3-c7c0c37b34-bfdb552c96-6705ce43ad"}}

  ### Start Quiz
    -Request
      curl -H "Content-type: application/json" -d '{"id":"93384d90a3-c7c0c37b34-bfdb552c96-6705ce43ad"}'       
         'http://localhost:3001/start-quiz'
    -Response
      {"status":200,"success":true,"payload":{"id":"93384d90a3-c7c0c37b34-bfdb552c96-6705ce43ad","start_time":"2018-10-23T17:56:48.891Z","time_left":3600}}

  ### Next Question
     - Request
        curl -H "Content-type: application/json" -d '{"id": "93384d90a3-c7c0c37b34-bfdb552c96-6705ce43ad"}'       
        'http://localhost:3001/next-question'
     - Response
                {
                "status": 200,
                "success": true,
                "payload": {
                    "id": "93384d90a3-c7c0c37b34-bfdb552c96-6705ce43ad",
                    "data": {
                        "qid": "3816b8392888d7b2",
                        "text": "<p>What was the name of the security vulnerability found in Bash in 2014?</p>}",
                        "answers": [
                            "Heartbleed",
                            "Bashbug",
                            "Stagefright",
                            "Shellshock"
                        ]
                    },
                    "time_left": 3541,
                    "done": false
                }
            }
  ### Submit Answer
    -Request
        curl -H "Content-type: application/json" -d '{"id": "93384d90a3-c7c0c37b34-bfdb552c96-6705ce43ad", "qid":"3816b8392888d7b2", "answer":"Shellshock"}'       
    'http://localhost:3001/submit-question'

    -Response
            {
          "status": 200,
          "success": true,
          "payload": {
              "done": false,
              "time_left": 2363
          }
      }
