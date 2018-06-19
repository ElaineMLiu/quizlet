//app.js is the entry point to the node.js application
//$npm init --> dependencies are in the project folder's package.json
//$npm install --> You already installed them
//$node app --> will come to this entry code

//----------- require the DEPENDENCIES ----------------
const express = require('express');
var bodyParser = require('body-parser');
var path = require('path');//core module didn't need to separately install
var expressValidator = require('express-validator');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const passport = require('passport'); //local strategy stuff in config/passport.js, check if matches db

const config = require('./config/database'); //This includes the object of variables exported from here and calls it config
mongoose.connect(config.database);  //mongoose.connect('mongodb://localhost/nodeqb');
let db = mongoose.connection;

// Check the connection
db.once('open', function(){
  console.log('Connected to MongoDB');
});

// Check for DB errors
db.on('error', function(err){
  console.log(err);
});

//just do this, like it makes a server
const app = express();

//socket.io initialization
//var http = require('http').Server(app);
//var io = require('socket.io')(http);
//var server = app.listen(3000);
var server = app.listen(3000, function(){
  console.log('Server Started on Port 3000');
});
var io = require('socket.io').listen(server);

// -------------------- VIEW ENGINE ------------------------
// is this also middleware?
// instead of res.send('hi');     res.json(people);
// This will get the 'html'-type of homepage from ./views/index.ejs
// You can also use pug=jade, but it is indent-based and weird syntax
// EJS is a lot nicer, just like html, php
// embedded javascript
app.set('view engine', 'ejs'); //how you want to render the 'html' pages
app.set('views', path.join(__dirname, 'views')); // where are the files you want to view


// ------------------- MIDDLEWARE MUST PUT BEFORE ROUTES  -----------------------
// function that has access to req and res objects and next middleware firing after it
// runs every time the application is loaded
// most modules have their own middleware to set up
        // example custom middleware: logger outputs to cmd at each refresh
        /*
        var logger = function(req, res, next){
          console.log('Logging...'); //on cmd, at each browser refresh
          next(); //ends the middleware and starts next one
        }
        //to do anything, we need to use the MIDDLEWARE
        app.use(logger);
        */
// middelware for body-parser module, it's in their documentation
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));


//Global variables, put in own middleware
//errors is a global variable to be also seen in index.ejs

app.use(function(req,res,next){
  res.locals.errors =null; //set global variable to null by default
  next();
});



app.use(expressValidator()); //expressValidator middleware

//middleware so that we can find our public folder
// We make the public folder to hold static resource files
// like css and jquery
      // for example if in ./public/index.html has the words TEST,
      // this loads on browser and only shows TEST, overwrites a hello world from this file!
      // So, if you have angularjs application, it would be in public/
      // But, we want to render views from server.
// set Static path
app.use(express.static(path.join(__dirname,'public')));

// Express Session Middleware Tutorials Part 8
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
  //cookie: { secure: true }
}))

// Express Messages MIDDLEWARE
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  // sets global variable messages tothe express-messages module
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// ------- CONFIGURING PASSPORT LOCAL STRATEGY STUFF  ----------
// Bring in Passport config, like ctrl+v that code to Here
require('./config/passport')(passport);
// 2 lines of middleware for passport http://www.passportjs.org/docs/downloads/html/
// search for initialize()
app.use(passport.initialize());
app.use(passport.session());
// make a GLOBAL VARIABLE called 'user' for all the routes '*'
// user is the row from the User table found after passport authenticates the username and password from the login.ejs form
// user is null otherwise (if it doesn't exist yet)
// E.g. We can use this in the navbar in views/partials/header.ejs:
//       if user is not null, show Logout    else show the Register or login button
app.get('*', function(req,res,next){   //'*' replace with '/' works??
  res.locals.user = req.user || null; //res.locals is a global variable setting for this page, req.user is returned by done callback in config/passport.js
  next();  //calls the next middleware
});

// --------------------- BRING IN THE TABLES FROM THE DATABASE ----------------------
// database is 'nodeqb'
// tables are 'quizzes', 'users', 'questions', 'scores'
// Bring in the Models (which are the actual array of objects/entries in the tables/collections, not just the schema?)
let Quiz = require('./models/quiz'); // quiz.js is the structure of each entry in the quizzes table
let User = require('./models/user'); // ./models/user.js
let Question = require('./models/question'); // ./models/question.js
let Score = require('./models/score'); // ./models/score.js


// ------------------- ROUTES -----------------------
//now we can create routes
//won't do anything until you listen to browser port 3000

// This function can be added to any route you want to protect!
// For example, you don't wan't manual URL access to /, quiz list, if not logged in
// and use it like:  app.get('/quizzes/add', ensureAuthenticated, function(...){...});
function ensureAuthenticated(req, res, next){
  if(req.isAuthenticated()){  //passport has gotten req.user all checked and you haven't req.logout() yet
    return next();
  }else{
    req.flash('danger', 'Please log in');
    res.redirect('/users/login');
  }
}// end ensureAuthenticated function


// Testing if the manual databases are loading
// Home page .ejs lists out all the data in the table
app.get('/testDB/quizzes',function(req,res){
  Quiz.find({}, function(err, quizzes){ //query all {} the quizzes in the Quiz table
    if(err){
      console.log(err);  //error in query
    }else{   //show all the quizzes info in list on index.ejs page
      res.render('index_quizzes', {
        title: 'Quizzes',
        quizzes: quizzes
      });
    }
  });
});
app.get('/testDB/users',function(req,res){
  User.find({}, function(err, users){ //query all {} the quizzes in the Quiz table
    if(err){
      console.log(err);  //error in query
    }else{   //show all the quizzes info in list on index.ejs page
      res.render('index_users', {
        title: 'Users',
        users: users
      });
    }
  });
});
app.get('/testDB/questions',function(req,res){
  Question.find({}, function(err, questions){ //query all {} the quizzes in the Quiz table
    if(err){
      console.log(err);  //error in query
    }else{   //show all the quizzes info in list on index.ejs page
      res.render('index_questions', {
        title: 'Questions',
        questions: questions
      });
    }
  });
});
app.get('/testDB/scores',function(req,res){
  Score.find({}, function(err, scores){ //query all {} the quizzes in the Quiz table
    if(err){
      console.log(err);  //error in query
    }else{   //show all the quizzes info in list on index.ejs page
      res.render('index_scores', {
        title: 'Scores',
        scores: scores
      });
    }
  });
});


        /*
        app.get('/', function(req,res){
          //res.send('Hello World');
          let quizzes = [
            {
              id: 1,
              title: 'Gravity',
              class: 'wXy1z',
              description: 'Chapter 8 Review',
              reviewable: true,
              plays: 0,
              created_at: '2018_5_2'
            },
            {
              id: 2,
              title: 'Kinematics',
              class: 'wXy1z',
              description: 'Chapters 1~3 Review',
              reviewable: false,
              plays: 0,
              created_at: '2017_8_01'
            }
          ];
          res.render('index',{
              title: 'Quizzes',
              quizzes: quizzes
          });
        });
        */
// Home page index.ejs lists out all the quizzes in the Quiz table
app.get('/',ensureAuthenticated, function(req,res){
  if(req.user.role == 'teacher'){
    let query = {class: req.user.class};
    Quiz.find(query, function(err, quizzes){ //query all {} the quizzes in the Quiz table

        if(err){
          console.log(err);  //error in query
        }else{   //show all the quizzes info in list on index.ejs page
          res.render('index', {
            title: 'Quizzes',
            quizzes: quizzes,
            user: req.user || null,
          });
        }


    });  //end quiz find
  } //end if teacher

  if(req.user.role == 'student'){
    //console.log('student');
    let query = {class: req.user.class, reviewable: true};
    Quiz.find(query, function(err, quizzes){ //query all {} the quizzes in the Quiz table
      if(err){
        console.log(err);  //error in query
      }else{   //show all the quizzes info in list on index.ejs page
        res.render('index_student', {
          title: 'Quizzes',
          quizzes: quizzes,
          user: req.user || null
        });
      }
    });  //end quiz find
  } //end if student

});

// ------------------------------ 'AddQuiz', 'ABOUT',' DELETE' quiz BUTTON ROUTES -----------------------------------
// Render the add-quiz page in add_quiz.ejs
// Browser makes request to get that page
app.get('/quizzes/add', ensureAuthenticated, function(req,res){
  if(req.user.role === 'teacher'){
    res.render('add_quiz',{
        title: 'Add Quiz',
        user: req.user || null
    });
  }else{
    req.flash('danger', 'Not Authorized');
    res.redirect('/');
  }
});

// Browser has form in add_quiz.ejs page
// Post the data in the form to SERVER
app.post('/quizzes/add', function(req,res){
  /*
  console.log('Form from add_quiz.ejs, /articles/add Submitted');
  console.log(req.body.title); //need body parser to get this form field
  return;
  */
  //Use Express validator to check for rules
  req.checkBody('title', 'Title is required').notEmpty();
  req.checkBody('description', 'Description is required').notEmpty();
  //req.checkBody('class', 'Class is required').notEmpty();
  //Get errors
  errors = req.validationErrors();
  if(errors){
    console.log(errors);
    console.log('ERRORS');
    res.render('add_quiz', {
      title: 'Add Quiz',
      errors:errors
    });
  }else{
    // ----- MAKE A ROW FOR QUIZ TABLE in ./models/quiz.js from nodeqb database -----------
    let quiz = new Quiz(); //so this is setting up a data to Quiz table
    quiz.title = req.body.title; //need body parser to get this form field
    quiz.class = req.user.class; //req.body.class;
    quiz.author = req.user._id;
    quiz.description = req.body.description;
    // ----- SAVE ABOVE ROW TO QUIZ TABLE in ./models/quiz.js from nodeqb database -----------
    quiz.save(function(err){
      if(err){
        console.log(err);
        return;
      }else{
        req.flash('success', 'Quiz Added');
        res.redirect('/'); // entry added without error, redirect to homepage
        // go to browser localhost:3000/quizzes/add to test out
        // go to mongo shell and db.find().pretty()
      }
    });
  }
});

// Route for the Quiz PLAY button in index.ejs
// the list of quizzes, click the quiz PLAY button, sends the quiz._id through URL
// query the quiz entry for this  _id
// It goes to localhost:/3000/quiz/...weird_quiz_id... and the view is rendered from ./views/quiz.ejs
app.get('/quiz/:id', ensureAuthenticated, function(req,res){
  Quiz.findById(req.params.id, function(err, quiz){
    if(req.user.role === 'teacher' && req.user.class === quiz.class){
      Question.find({ quiz_id: quiz._id}, function(err,questions){ // 5b1c0a5136bbf1389cfdb00c
        res.render('quiz', {     //SEND TO QUIZ.EJS  PLAY PAGE
          title: 'Play this Quiz',
          quiz: quiz,
          questions: questions,
          user: req.user || null
          });
        });
    }else{
      req.flash('danger', 'Not Authorized');
      res.redirect('/');
    }

    });
});




// Route for student view when playing the quiz game
app.get('/student/:id',function(req,res){
  const quizId = req.params.id;

  res.render('student', {
    quizId: quizId,
    //numQuestions: numQuestions
  });
});

// Route for the Quiz EDIT button in index.ejs
// This gets the form to edit the quiz
// the list of quizzes, click the quiz EDIT button, sends the quiz._id through URL
// query the quiz entry for this  _id
// It goes to localhost:/3000/quiz/edit/...weird_quiz_id... and the view is rendered from ./views/edit_quiz.ejs
// edit_quiz.ejs is just like add_quiz.ejs except for the post url and values are filled in
// edit_quiz.ejs will then post to the same url, passing the quiz _id in the URL
app.get('/quizzes/edit/:id',ensureAuthenticated, function(req,res){
  Quiz.findById(req.params.id, function(err, quiz){
    if(req.user.role === 'teacher' && req.user.class === quiz.class){
      User.findById(quiz.author, function(err, user){
        //console.log(quiz);
        //return;
        res.render('edit_quiz', {
          title: 'Edit Quiz Info',
          quiz: quiz,
          author: user.name,
          user: req.user || null
        });
      });
    }else{
      req.flash('danger', 'Not Authorized');
      res.redirect('/');
    }

  });
});

// Route to post the form's data to server, after the quiz is EDITed. Similar to adding a quiz
// The form in edit_quiz.ejs sends the id in the URL again
app.post('/quizzes/edit/:id', function(req,res){
  //Use Express validator to check for rules
  req.checkBody('title', 'Title is required').notEmpty();
  req.checkBody('description', 'Description is required').notEmpty();
  //req.checkBody('class', 'Class is required').notEmpty();
  //Get errors
  errors = req.validationErrors();

  // ----- make an object -----------
  let quiz = {}; //empty object
  quiz.title = req.body.title; //append data into object
  //quiz.class = req.body.class;
  quiz.description = req.body.description;

  // ----- Make a query --------
  let query = {_id:req.params.id};

  if(errors){
    /*
    Quiz.findById(req.params.id, function(err, quiz){
      res.render('edit_quiz', {
        title: 'Edit Quiz Info',
        quiz: quiz,
        errors: errors
      });
      */
      req.flash('danger', 'Fill in all the fields');
      res.redirect('/quizzes/edit/'+req.params.id);

  }else{
    // ----- Update the queried entry in QUIZ TABLE in ./models/quiz.js from nodeqb database -----------
    Quiz.update(query, quiz, function(err){
      if(err){
        console.log(err);
        return;
      }else{
        req.flash('success', 'Quiz Info Updated');
        res.redirect('/'); // entry added without error, redirect to homepage
        // go to browser localhost:3000/quizzes/add to test out
        // go to mongo shell and db.find().pretty()
      }
    });
  }

});

// ------ Route for the DELETE buttons -----
// any button of class .delete-quiz and attribute 'data-id' set to quiz_id in any ejs file, since footer has the script main.js
// and main.js attaches an on-click event to the delete button and gets the attribute
// Then main.js makes jquery ajax delete request to this route, passing quiz _id in URL
app.delete('/quizzes/delete/:id', function(req,res){
  let query = {_id: req.params.id};
  Quiz.remove(query,function(err){
    if(err){
      console.log(err);
    }
    res.send('Success'); //default would be 200 status, server sends this response
  });
});


// ------------------------------ 'EDIT' quiz QUESTIONS BUTTON ROUTES -----------------------------------
// Render the add-question page in add_question.ejs
// Browser makes request to get that page
app.get('/quizzes/questions/add/:id', ensureAuthenticated, function(req,res){
  Quiz.findById(req.params.id, function(err, quiz){
    if(req.user.role === 'teacher' && req.user.class === quiz.class){
      Question.find({ quiz_id: quiz._id}, function(err,questions){ // 5b1c0a5136bbf1389cfdb00c
        //console.log(questions);
        //console.log(quiz);
        res.render('add_question', {
          title: 'Question Editor',
          quiz: quiz,
          questions: questions,
          user: req.user || null
        });
      });
      //console.log(quiz);
      //return;
    }else{
      req.flash('danger', 'Not Authorized');
      res.redirect('/');
    }
    });
});

app.post('/quizzes/questions/add/:id', function(req,res){
  //Use Express validator to check for rules
  req.checkBody('question', 'Question is required').notEmpty();
  req.checkBody('choiceA', 'Choice A is required').notEmpty();
  req.checkBody('choiceB', 'Choice B is required').notEmpty();
  req.checkBody('choiceC', 'Choice C is required').notEmpty();
  req.checkBody('choiceD', 'Choice D is required').notEmpty();
  req.checkBody('choiceCorrect', 'Correct Choice is required').notEmpty();
  //Get errors
  errors = req.validationErrors();


  if(errors){
    req.flash('danger', 'Fill in all the fields and Pick a Choice');
    res.redirect('/quizzes/questions/add/'+req.params.id);
  }else{

    Quiz.findById(req.params.id, function(err, quiz){
      let query = {_id: req.params.id}
      let newquiz={};
      newquiz = quiz;
      newquiz.numQuestions = quiz.numQuestions+1;
      Quiz.update(query, newquiz, function(err){


        Question.find({ quiz_id: quiz._id}, function(err,questions){ // 5b1c0a5136bbf1389cfdb00c
          //console.log(questions);
          //console.log(quiz);
          /*
          var newQuestion = {
            question: req.body.question,
            quiz_id: quiz._id,
            order: 1,
            choiceA: req.body.choiceA,
            choiceB: req.body.choiceB,
            choiceC: req.body.choiceC,
            choiceD: req.body.choiceD,
            choiceCorrect: req.body.choiceCorrect,
            author: "5b1cdd4da9e1c08be5eea5bc",  //by login
            included: true
          };
          console.log(newQuestion);
          db.questions.insert(newQuestion,function(err,result){
            if(err){
              console.log(err);
            }

          });
          res.redirect('/'); //instead of going to /users/add URL
          console.log('SUCCESS');
          */
          // use express validator to check some rules
        //  req.checkBody('question','Question is Required').notEmpty();

          let question = new Question();
          question.question = req.body.question;
          question.quiz_id = quiz._id;
          question.order = 1;
          question.choiceA = req.body.choiceA;
          question.choiceB = req.body.choiceB;
          question.choiceC = req.body.choiceC;
          question.choiceD = req.body.choiceD;
          question.choiceCorrect = req.body.choiceCorrect;
          question.author = "5b1cdd4da9e1c08be5eea5bc";  //by login
          question.included = true;
          //console.log(question);
          question.save(function(err){
            if(err){
              console.log(err);
              return;
            }else{
              req.flash('success', 'Question Added');
              res.redirect('/quizzes/questions/add/'+quiz._id);
            }
          });
        }); //end saving questions to database
      });
    });
  }
}); //end this route


app.get('/quizzes/questions/edit/:id/:pid', ensureAuthenticated, function(req,res){

  Quiz.findById(req.params.id, function(err, quiz){
    if(req.user.role === 'teacher' && req.user.class === quiz.class){
      fillQuestion = Question.findById(req.params.pid);
      Question.find({ quiz_id: quiz._id}, function(err,questions){ // 5b1c0a5136bbf1389cfdb00c
        Question.findById({_id: req.params.pid},function(err, fillQuestion){
          console.log(fillQuestion);
          res.render('edit_question', {
            title: 'Question Editor',
            quiz: quiz,
            questions: questions,
            fillQuestion: fillQuestion,
            user: req.user || null
          });
        });
        //console.log(questions);
        //console.log(quiz);
      });
    }else{
      req.flash('danger', 'Not Authorized');
      res.redirect('/');
    }

  });
});


app.post('/quizzes/questions/edit/:id/:pid', function(req,res){
  //Use Express validator to check for rules
  req.checkBody('question', 'Question is required').notEmpty();
  req.checkBody('choiceA', 'Choice A is required').notEmpty();
  req.checkBody('choiceB', 'Choice B is required').notEmpty();
  req.checkBody('choiceC', 'Choice C is required').notEmpty();
  req.checkBody('choiceD', 'Choice D is required').notEmpty();
  req.checkBody('choiceCorrect', 'Correct Choice is required').notEmpty();
  //Get errors
  errors = req.validationErrors();


  if(errors){
    req.flash('danger', 'Fill in all the fields and Pick a Choice');
    res.redirect('/quizzes/questions/edit/'+req.params.id+'/'+req.params.pid);
  }else{
    Quiz.findById(req.params.id, function(err, quiz){
      Question.find({ quiz_id: quiz._id}, function(err,questions){ // 5b1c0a5136bbf1389cfdb00c
        let question = {};
        question.question = req.body.question;
        question.quiz_id = quiz._id;
        question.order = 1;
        question.choiceA = req.body.choiceA;
        question.choiceB = req.body.choiceB;
        question.choiceC = req.body.choiceC;
        question.choiceD = req.body.choiceD;
        question.choiceCorrect = req.body.choiceCorrect;
        question.author = "5b1cdd4da9e1c08be5eea5bc";  //by login
        question.included = true;
        //console.log(question);
        let query = {_id:req.params.pid};
        Question.update(query, question, function(err){
          if(err){
            console.log(err);
            return;
          }else{
            req.flash('success', 'Question Updated');
            res.redirect('/quizzes/questions/add/'+quiz._id);
          }
        });
      }); //end saving questions to database
    });
  }

}); //end this route

// ----- route for publishing quiz or not  --------------
app.post('/quizzes/reviewable/:id', function(req,res){
  //let quiz = {};
    Quiz.findById(req.params.id, function(err, quiz){
      if(req.body.reviewable=="true"){
        quiz.reviewable = true;
      }else{
        quiz.reviewable = false;
      }
      let query = {_id: req.params.id};
      Quiz.update(query, quiz, function(err){
        if(err){
          console.log(err);
          return;
        }else{
          req.flash('success', 'Publish Status Updated');
          res.redirect('/');
        }
      });
    });
}); //end this route

app.delete('/quizzes/questions/delete/:pid', function(req,res){
  //console.log(req.params.pid);
  let query = {_id: req.params.pid};
  Question.remove(query,function(err){
    if(err){
      console.log(err);
    }
    res.send('Success'); //default would be 200 status, server sends this response
  });
});

// ----- ROUTE for REGISTRATION page --------
app.get('/users/register',function(req, res){
  res.render('register');
});

app.post('/users/register',function(req, res){
  //res.render('register');
  // The form in views/register.ejs has these fields, posted to server here

  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const password2 = req.body.password2;
  const class_code = req.body.class_code;
  const class_title = req.body.class_title;
  const role = req.body.role;

  req.checkBody('name', 'Name is required').notEmpty();
  req.checkBody('email', 'Email is required').notEmpty();
  req.checkBody('email', 'Email is not valid').isEmail();
  req.checkBody('class_code', 'Class code is required').notEmpty();
  req.checkBody('class_title', 'Class title is required').notEmpty();
  req.checkBody('role', 'Teacher or Student is required').notEmpty();
  req.checkBody('password', 'Password is required').notEmpty();
  req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

  let errors = req.validationErrors();

  if(errors){  //re-render the register.ejs view and pass the errors in for message to show
    res.render('register', {
      errors: errors,
      user: req.user || null
    });
  }else{  //validation passes and submit a new user
    //Check if the email already exists
    let queryE = {email: email};
    User.findOne(queryE, function(err, user){
      if(user){
        req.flash('error', 'This email is already registered');
        res.redirect('/users/register');
      }else{


          // Check if the class code is taken
          let queryC = {class: class_code};
          User.findOne(queryC, function(err, user){
            if(err) throw err;
            if(user && role==='teacher'){ // a person was found who already has this class code
              req.flash('error', 'This class code is already used by another teacher');
              res.redirect('/users/register');
            }else{
              if(!user && role==='student'){ // a person was found who already has this class code
                req.flash('error', 'Ask your teacher for the class code');
                res.redirect('/users/register');
              }else{
                      // ============ pull the stuff in here===============
                      let newUser = new User({   //The schema brought in earlier, this is the actual table, adds a row into it
                        name: name,
                        email: email,
                        role: role,
                        class: class_code,
                        class_title: class_title,
                        password: password //plain text right now

                      });

                      // Use bcryptjs which was required above to generate a salt and hash the password
                      bcrypt.genSalt(10, function(err,salt){
                        bcrypt.hash(newUser.password, salt, function(err,hash){
                          if(err){
                            console.log(err);
                          }else{
                            newUser.password = hash;
                            // Save the validated form data into the databases
                            newUser.save(function(err){
                              if(err){
                                console.log(err);
                              }else{
                                req.flash('success', 'Welcome to Quizlet! You may now log in');
                                res.redirect('/users/login');
                              }
                            }); //end saving the newUser to dB

                          }
                        });
                      }); //end the hashing stuff for bcrypgenSalt
                    // ============ the stuff in here===============

              }
            }


            
          });  //end the user findOne


        }
    });
  } //end else validation passes and submit a new user
});  //end the app.post for users/register  ROUTE

// ---------- ROUTE for the login page ---------------
app.get('/users/login', function(req,res){
  res.render('login');
});

// This uses the passport config stuff above in the middleware section that brought in config/passport.js
app.post('/users/login', function(req, res, next){
  passport.authenticate('local', {  // use our local strategy in config/passport.js
    successRedirect: '/',  //if all okay, go here and we'll have a 'req.user' object, we can have access control based on this!
    failureRedirect: '/users/login',
    failureFlash: true  // This makes a div on this page <div class="alert alert-danger"> message in config/passport.js</div>
                        // class = "alert alert-success" if okay,
                        // and we styled it to be bootstrap colors in public/css/style.css
  })(req, res, next);  //end passport.authenticate, need pass in the req, res, next. req.user object is there if found this user in DB
});

// ---- ROUTe for the Logout  in navbar in views/header.ejs -------------
// All pages have access to global variable res.local.user, if it exists, logout button is there
app.get('/users/logout', function(req,res){
  req.logout(); // This erases the global user variable to null, so login button appears instead
  req.flash('success', 'You are logged out');
  res.redirect('/users/login');
});

// ---- ROUTE for question page when playing, teacher view --------------
app.get("/questionPage/:pid", function(req,res){
  Question.findById(req.params.pid, function(err, question){
    res.render('questionPage', {question: question});
  });
});

// ---- ROUTE for answer page when playing, teacher view --------------
app.get("/answerPage/:pid", function(req,res){
  Question.findById(req.params.pid, function(err, question){
    res.render('answerPage', {question: question});
  });
});

// ------------- SERVER LISTENS TO BROWSER ---------------------
//The server needs to listen to the browser, port 3000
// When it starts up and listens, callback is to show on command line the message
// $node app --> comes to this file, and server started up
//if you didn't set up the routes yet:
  // browser localhost:3000 shows 'cannot GET /' cuz no homepage made yet. '/' is homepage
  // browser localhost:3000/about shows 'cannot GET /about' cuz no about.html view yet
  /*
app.listen(3000, function(){
  console.log('Server Started on Port 3000');
});
*/

// ------------- SOCKET.IO SERVER SIDE ---------------------
var numUsers = 0;

io.on('connection', (socket) => {
  console.log("user connected");

  var addedUser = false;
  var  q = 0; //keeps track of which questions we're on
  var questionArray = [];

  // when the client emits 'add user', this listens and executes
  socket.on('add user', (username) => {
    if (addedUser) return;

    // we store the username in the socket session for this client
    socket.username = username;
    ++numUsers;
    addedUser = true;
    socket.emit('login', {
      numUsers: numUsers
    });
    // echo globally, except to socket that we received the message from
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers
    });
    console.log("number of users: " + numUsers);
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', () => {
    if (addedUser) {
      --numUsers;

      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });

  // when teacher (a client) emits to start quiz, broadcast to other clients (students)  and also self
  socket.on('start quiz', (quizId) => {
    Quiz.findById(quizId, function(err, quiz){
        Question.find({ quiz_id: quiz._id}, function(err,questions){
           questionArray = questions;
           //console.log(questionArray);
           socket.broadcast.emit('start quiz', {questionId: questions[q]._id, numQuestions: questions.length, q: q});
           socket.emit('start quiz', {questionId: questions[q]._id, numQuestions: questions.length, q: q});
           ++q;
        }); //end findQuestions
    }); //end findQuiz
    //doesn't get here
  });  //end 'start quiz' stuff

  // when teacher (a client) emits to show answer, broadcast to other clients (students) and also self
  socket.on('show answer', function(msg) {
    Quiz.findById(msg.quizId, function(err, quiz){
        Question.find({ quiz_id: quiz._id}, function(err,questions){
           questionArray = questions;
           //console.log(questionArray);
           socket.broadcast.emit('show answer', {questionId: questions[msg.q]._id, numQuestions: questions.length, q: msg.q});
           socket.emit('show answer', {questionId: questions[msg.q]._id, numQuestions: questions.length, q: msg.q});
        }); //end findQuestions
    }); //end findQuiz
    //doesn't get here
  });  //end 'shown answer' stuff

  // student sends answer and we check
  socket.on('student answer', function(msg){
    var isCorrect = false;
    Quiz.findById(msg.quizId, function(err, quiz){
        Question.find({ quiz_id: quiz._id}, function(err,questions){
          question = questions[msg.q];
          if(question.choiceCorrect === msg.studentChoice){
            isCorrect = true;
          }
          //console.log(isCorrect);
          socket.emit('check answer', {isCorrect: isCorrect});
        }); //end findQuestions
    }); //end findQuiz
  });

  // when teacher (a client) emits to get next question, broadcast to other clients (students) and also self
  socket.on('next question', function(msg) {
    Quiz.findById(msg.quizId, function(err, quiz){
        Question.find({ quiz_id: quiz._id}, function(err,questions){
           questionArray = questions;
           //console.log(questionArray);
           socket.broadcast.emit('next question', {questionId: questions[msg.q]._id, numQuestions: questions.length, q: msg.q});
           socket.emit('next question', {questionId: questions[msg.q]._id, numQuestions: questions.length, q: msg.q});
        }); //end findQuestions
    }); //end findQuiz
    //doesn't get here
  });  //end 'shown answer' stuff

  // when teacher (a client) emits to end quiz, broadcast to other clients (students)
  socket.on('end quiz', (msg) => {
    Quiz.findById(msg.quizId, function(err, quiz){
      quiz.plays  = quiz.plays+1;
      let query = {_id: msg.quizId};
      Quiz.update(query, quiz, function(err){
        socket.broadcast.emit('end quiz');
        socket.emit('end quiz');
      });
    });

  });
});
