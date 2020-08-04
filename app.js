if (process.env.NODE_ENV !== 'production') { require('dotenv').config()}

const express = require('express')
const app = express()
const passport = require('passport')
const flash = require('express-flash');
const session = require('express-session')
const expressValidator = require('express-validator');
const mongoose = require('mongoose')
const User = require('./models/user');
const authRouter = require('./routes/auth');
const authenticateUser = require('./passport-config')
const LocalStrategy = require('passport-local').Strategy;


app.use(express.static('resources'));
app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))

app.use(passport.initialize());
app.use(passport.session());



// Express Messages Middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// // Express Validator Middleware
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

app.use(authRouter)

passport.serializeUser(function(user, done) {
  done(null, user.id)
})
passport.deserializeUser(function(id, done){
  User.findOne({
    _id : id
  }, '-password -salt', function(err, user){
    done(err, user)
  })
})

passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser));

// Uncomment this line will cause try to connect to db on localserver, but there have to be mongodb installed.
mongoose.connect(process.env.MONGO_URI,
 {useNewUrlParser: true,
useUnifiedTopology: true})
.catch(error => handleError(error));

//ROUTES: ======================================================================
app.get('/', (req, res) => {
  res.render('index.ejs')})

  app.get('/products/add', (req, res) => {
    res.render('products/add/products.ejs')
  })

  app.get('/products', (req, res) => {
    res.render('products/products_list.ejs')
  })
// =============================================================================

app.listen(4000, console.log('Serwer jest uruchomiony na porcie 4000'))