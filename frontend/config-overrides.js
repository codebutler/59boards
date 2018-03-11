const paths = require('react-scripts-ts/config/paths');

const path = require("path");
const ruleChildren = (loader) => loader.use || loader.oneOf || Array.isArray(loader.loader) && loader.loader || []

const findIndexAndRules = (rulesSource, ruleMatcher) => {
    let result = undefined
    const rules = Array.isArray(rulesSource) ? rulesSource : ruleChildren(rulesSource)
    rules.some((rule, index) => result = ruleMatcher(rule) ? {index, rules} : findIndexAndRules(ruleChildren(rule), ruleMatcher))
    return result
}

const createLoaderMatcher = (loader) => (rule) => rule.loader && rule.loader.indexOf(`${path.sep}${loader}${path.sep}`) !== -1
const fileLoaderMatcher = createLoaderMatcher('file-loader')

const addBeforeRule = (rulesSource, ruleMatcher, value) => {
    const {index, rules} = findIndexAndRules(rulesSource, ruleMatcher)
    rules.splice(index, 0, value)
}

module.exports = function override(config) {
    config.module.rules.push({
        test: /\.(js|jsx)$/,
        include: paths.appSrc,
        loader: require.resolve('babel-loader'),
        options: {
            babelrc: false,
            presets: [require.resolve('babel-preset-react-app')],
            cacheDirectory: true,
        },
    });
    addBeforeRule(config.module.rules, fileLoaderMatcher, {
        test: /\.html$/,
        use: [
            { loader: require.resolve('html-loader') }
        ]
    });
    addBeforeRule(config.module.rules, fileLoaderMatcher, {
        test: /\.md$/,
        use: [
            { loader: require.resolve('html-loader') },
            { loader: require.resolve('markdown-loader') }
        ]
    });
    return config;
};
