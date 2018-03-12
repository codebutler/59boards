import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { applyMiddleware, createStore } from 'redux';
import { createLogger } from 'redux-logger';
import thunk from 'redux-thunk';
import 'typeface-roboto';
import App from './app/App';
import './index.css';
import reducer from './shared/reducers';
import registerServiceWorker from './app/registerServiceWorker';
import { ConnectedRouter, routerMiddleware } from 'react-router-redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import createBrowserHistory from 'history/createBrowserHistory';

// Pollyfills
import 'core-js/es7/promise';
import { googleAnalytics } from './shared/reactGAMiddlewares';

const LOGGING = false;
const CACHING = false;

const history = createBrowserHistory();

const middlewares = [];
middlewares.push(thunk);
middlewares.push(routerMiddleware(history));
middlewares.push(googleAnalytics);
if (LOGGING) {
    middlewares.push(createLogger({
        diff: true
    }));
}

const store = createStore(
    reducer, composeWithDevTools(
    applyMiddleware(...middlewares)
));

ReactDOM.render(
    <Provider store={store}>
        <ConnectedRouter history={history}>
            <App />
        </ConnectedRouter>
    </Provider>,
    document.getElementById('root')
);

if (CACHING) {
  registerServiceWorker();
}
