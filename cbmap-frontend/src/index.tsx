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

const LOGGING = true;
const CACHING = false;

const middlewares = LOGGING ? [logger] : [];

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
