import { Switch, Route } from 'react-router-dom';
import Home from './pages/Home/Home'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import Search from './pages/Search'
import Recipe from './pages/Auction/Auction'
import Publish from './pages/Publish/Publish'
import Notifications from './pages/Notifications/Notifications'
import './App.css';


// eslint-disable-next-line import/no-anonymous-default-export
export default () => {
  return (
    <>
      <div>
        <Switch id="main">
          <Route exact path="/" component={SignIn} />
          <Route exact path="/home" component={Home} />
          <Route exact path="/signin" component={SignIn} />
          <Route exact path="/signup" component={SignUp} />
          <Route exact path="/search" component={Search} />
          <Route exact path="/auction/:id" component={Recipe} />
          <Route exact path="/publish" component={Publish} />
          <Route exact path="/notifications" component={Notifications} />
        </Switch>
      </div>
    </>
  );
};

/*
function App() {
  return SearchRecipe();
  //return Header();
  //return SignUp();
  //return Login();

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}
*/
