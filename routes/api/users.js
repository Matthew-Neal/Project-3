// declare express router required 
const { response } = require('express');
const express = require('express');

const router = express.Router();
// model document for database users model
const User = require('../../database/models/user');
const passport = require('../../passport');
// Future development routing below
// router.put('/:id', (req, res) => {
//   console.log('route id hit', req.params.id);
//   console.log('put body', req.body)
//   const user_id = req.params.id;
//   User.findOne({ _id: user_id })
//     .then(res => {
//       const findIssue = res.issues.map(i => i.issue).indexOf(req.body.issue)
//       console.log("index of issues, ", findIssue)

//       res.issues[findIssue].important = !res.issues[findIssue].important
//       User.findOneAndUpdate({ _id: user_id }, { $set: { issues: res.issues } })
//         .then(res => res.json({ res }))
//         .catch(err => console.log(err))
//     })

// });
// router get matches route using mongoose .find by request body of username followed by individual fields
router.get("/get_matches", (req, res) => {
  User.find({ username: { $ne: req.body.username } }, 'username name issues candidate campaign city state country county').then(users => {
    // console.log("users", users);
    res.send(users);
  });
});

// router post delete user route using mongoose deleteOne by request body username
router.post("/delete", (req, res) => {
  // console.log("User to be deleted", req.body);
  User.deleteOne({ username: req.body.username }).then(() => res.send(200)).catch((err) => res.send(422).json(err));
});
// router post update route using mongoose findOneAndUpdate by request body username 
router.post("/update", (req, res) => {
  //console.log("Username on update route", req.body);
  // updates all fields data
  User.findOneAndUpdate({ username: req.body.username },
    {
      $set: {
        name: req.body.userData.name,
        city: req.body.userData.city,
        county: req.body.userData.county,
        state: req.body.userData.state,
        country: req.body.userData.country,
        issues: req.body.issuesData,
        candidate: req.body.candidateData.candidate,
        campaign: req.body.candidateData.campaign
      }
    }, { new: true })
    .then((document) => {
      // console.log("document after update:", document);
      res.send(200);
    }).catch((err) => res.send(422).json(err));
});

// router post route using .findOne by username validation of unique name
router.post('/', (req, res) => {
  const { username, password } = req.body;

  User.findOne({ username: username }, (err, user) => {
    if (err) {
      console.log('User Create Error: ', err);
      return;
    }

    if (user) {
      res.json({
        error: `Sorry, already a user with the username: ${username}`,
      });
      return;
    }
    // new user declared for User model using required fields username and password
    const newUser = new User({
      username: username,
      password: password,
    });
    // conditional new user save if no error in response
    newUser.save((err, savedUser) => {
      if (err) return res.json(err);

      res.json(savedUser);
    });
  });
});
// router post login  and passport authenticated posted by mongoose .find by username
router.post(
  '/login',
  (req, res, next) => {
    next();
  },
  passport.authenticate('local'),
  (req, res) => {
    console.log('LOGGED IN', req.user);


    User.find({ username: req.user.username }).then(document => {
      console.log("document issues at login:", document[0].issues);
      const { name, city, county, state, country, zip, issues, candidate, campaign } = document[0];

      res.send({
        username: req.user.username,
        userData: { name, city, county, state, country, zip },
        issuesData: issues,
        candidateData: { candidate, campaign },
        matchesData: null,
        currentMatch: null
      });
    })

  }
);
// router get by .find by username then returns all user data
router.get('/', (req, res) => {
  if (req.user) {
    console.log('Hit GET Route', req.user);

    User.find({ username: req.user.username }).then(document => {
      const { name, city, county, state, country, zip, issues, candidate, campaign } = document;

      res.send({
        username: req.user.username,
        userData: { name, city, county, state, country, zip },
        issuesData: issues,
        candidateData: { candidate, campaign },
        matchesData: null,
        currentMatch: null
      });
    })

  } else {
    res.json({ user: null });
  }
});
// router post logout conditional by request user data
router.post('/logout', (req, res) => {
  if (req.user) {
    req.logout();
    res.status(200).json({ msg: 'LOGGED OUT' });
  } else {
    res.status(404).json({ msg: 'NO USER TO LOGOUT' });
  }
});

module.exports = router;
