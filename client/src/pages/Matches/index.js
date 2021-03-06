// import required dependencies and styling
import React, { Component, useEffect, useState } from "react";
import "./index.css"
import MatchRow from "../../components/MatchRow/index";
import { useStoreContext } from '../../store/store';
import axios from "axios";
import MatchProfile from "../../components/MatchProfile/index";
import { useSpring, animated } from 'react-spring';
// function Matches page
const MatchesPage = () => {
  // const data = API.getFakeMatches();
  // declare getters data and match and setters setData and setMatch useState
  let [data, setData] = useState([]);
  let [match, setMatch] = useState({});
  // console.log("Matches Page Data", data);
  //  declare state for context passed to store file
  const [state, dispatch] = useStoreContext();
  // props declared for useSpring animation 
  const props = useSpring({ from: { opacity: 0 }, to: { opacity: 1 }, delay: 300 })
  // use effect axios call on the front end api route for matches page using state username, user data,
  useEffect(() => {
    axios.get("api/users/get_matches", { username: state.user }).then(response => {
      //console.log("Matches Raw Data", response);
      const other_users = response.data;
      let current_user_issues = state.issuesData;
      // map none current user with response data
      let match_data = other_users.map(other_user => {
        // zero out the variable userScore
        let userScore = 0;
        // for each loop using all users data excluding current user send userScore add one and send to issueScore function for algorithm
        other_user.issues.forEach(issue => {
          userScore += issueScore(issue, current_user_issues);
        })
        // clear candidacy info
        let office = null;
        let body = null;
        let level = null;
        // conditional statement if user is a candidate (boolean) get other user's candidate info and match with other user issues
        if (other_user.candidate) {
          office = other_user.campaign.office;
          body = other_user.campaign.body;
          level = other_user.campaign.level;
        }
        let match_object = {
          name: other_user.name, username: other_user.username, score: Math.floor(userScore), candidate: other_user.candidate, office: office, body: body, level: level,
          city: other_user.city, state: other_user.state, county: other_user.county, country: other_user.country, issues: other_user.issues
        };
        return match_object
      }
      )
      // sort scores based on score in desc order
      const sorted_data = match_data.sort((a, b) => {
        return b.score - a.score;
      })
      let return_data = sorted_data.slice(1, (sorted_data.length))
      console.log("Sorted Data", sorted_data);
      // set data and set match = setState
      setData(return_data);
      setMatch(return_data[0]);
    })
  }, []);
  // algorithm function issueScore passing currentIssue and list
  function issueScore(currentIssue, list) {
    // zero out score
    let score = 0;
    // for each loop over list of each issue 
    list.forEach(issue => {
      let matchP = currentIssue.stance;
      let userP = issue.stance;
      let square = userP * matchP
      // conditional statement when issue matches currentissue then square is greater than 0 
      // run algorithm else create a negative score. this allows 2 sides of the aisle matching
      if (issue.issue === currentIssue.issue) {
        // keeping this algorithm incase revisit it
        // if (square > 0) {
        //   score = 20 - Math.sqrt(Math.abs(userP * userP - userP * matchP));
        // } else if (square < 0) {
        //   score = -1 * Math.sqrt(Math.abs(userP * userP - userP * matchP));
        // } else if (square === 0) {
        //   score = -1 * Math.abs(userP - matchP);
        // }

        if (square > 0) {
          score = 10 - Math.abs(userP - matchP);
        } else {
          score = - Math.abs(userP - matchP);
        }
        // if the issue is marked important by a user and matches important with any other user that stance is multiplied by 2
        if (currentIssue.important === issue.important) {
          score = score * 2;
        }
      }
    })
    return score;
  }
  // set matching by username and filter over data to match profile scores with names for rendering on matches page
  const setMatchName = (username) => {
    let profile = data.filter(person => person.username === username);
    // console.log("Username", username);
    // console.log("Profile", profile)
    setMatch(profile[0]);
  }
  // return view of matches page as candidates are set by data filter and mapping candidates and setting Match Name
  // return view of matches by users filtered by data of non-candidates and mapping for users matched
  return (
    <animated.div style={props}>
      <div id="page-container">
        <MatchProfile match={match} />
        <div id="big-container">
          <div className="matches-container">
            <h2>Candidates</h2>
            <div className="list-container">
              {data.filter(match => match.candidate).map(candidate => {
                return <MatchRow match={candidate} setMatchName={setMatchName} />
              })}
            </div>
          </div>
          <br />
          <div className="matches-container">
            <h2>Users</h2>
            <div className="list-container">
              {data.filter(match => !match.candidate).map(candidate => {
                return <MatchRow match={candidate} setMatchName={setMatchName} />
              })}
            </div>
          </div>
        </div>
      </div>
    </animated.div>
  );
};
export default MatchesPage;
