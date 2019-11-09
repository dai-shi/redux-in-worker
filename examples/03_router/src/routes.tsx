import React from 'react';
import { Route, Switch } from 'react-router';
import { Link } from 'react-router-dom';

import Counter from './Counter';
import Person from './Person';

const Home: React.FC = () => (
  <ul>
    <li><Link to="/counter">Counter</Link></li>
    <li><Link to="/person">Person</Link></li>
  </ul>
);

const routes = (
  <div>
    <Switch>
      <Route exact path="/" component={Home} />
      <Route path="/counter" component={Counter} />
      <Route path="/person" component={Person} />
      <Route component={Home} />
    </Switch>
  </div>
);

export default routes;
