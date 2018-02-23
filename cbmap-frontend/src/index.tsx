import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import 'typeface-roboto';
import reducer from './reducers/index';
import { Provider } from 'react-redux';
import { applyMiddleware, createStore } from 'redux';
import logger from 'redux-logger';
import { BrowserRouter } from 'react-router-dom';
import thunk from 'redux-thunk';

const LOGGING = true;
const CACHING = false;

const middlewares = [];
middlewares.push(thunk);
if (LOGGING) {
    middlewares.push(logger);
}

const store = createStore(
    reducer,
    applyMiddleware(...middlewares)
);

ReactDOM.render(
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>,
    document.getElementById('root')
);

if (CACHING) {
  registerServiceWorker();
}
