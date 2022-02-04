import React, { useEffect } from 'react';
import './App.css';
import { makeStyles } from '@mui/styles';
import CreateABox from './CreateABox';
import AllBoxes from './AllBoxes';
import Header from './Header';

function App() {

  const classes = useStyles();

  useEffect(()=> {
  
  }, [])
  
  return (
    <div className={classes.root}>
      <Header />
      <div className={classes.header}> Welcome to Lock Box </div>
      <div className={classes.container}>
        <div className={classes.createABox}>
          <CreateABox />
        </div>
        <div className={classes.allBoxes}>
          <AllBoxes />
        </div>
      </div>

    </div>
  );
}

export default App;


const useStyles = makeStyles({
  root: {
  },
  header: {
    height: "50px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  container: {
    border: "1px solid black",
    display: "flex",
    height: "500px",
    padding: "10px",
    justifyContent: "space-between"

  },
  createABox: {
    border: "0px solid black",
    width: "50%"
  },
  allBoxes: {
    border: "0px solid black",
    width: "50%",

  }
});
