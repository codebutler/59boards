const request  = require('request');
const csv = require('csv-parser');
const t2map = require('through2-map');
const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const JSONStream = require('JSONStream');

const OUTPUT_DIR = path.join(path.dirname(__filename), '..', 'src', 'shared', 'data');
const DISTRICT_INFO = require(path.join(OUTPUT_DIR, 'districts-info.json'));

const findDistrict = (borough, number) => _.find(DISTRICT_INFO, district =>
    district.borough.toLowerCase() === borough.toLowerCase()
    && parseInt(district.number) === parseInt(number));

// Community Board Leadership (Manhattan)
// https://data.cityofnewyork.us/City-Government/Community-Board-Leadership/3gkd-ddzn

request.get('https://data.cityofnewyork.us/api/views/3gkd-ddzn/rows.csv?accessType=DOWNLOAD')
    .pipe(csv())
    .pipe(t2map.obj(item => [
        findDistrict(
            item['Borough'] || 'Manhattan',
            item['Community Board']
        )['id'].toString(),
        _(item)
            .mapKeys((value, key) => _.camelCase(key))
            .mapValues((value) => value.trim())]))
    .pipe(JSONStream.stringifyObject('{\n', ',\n', '\n}\n', '  '))
    .pipe(fs.createWriteStream(path.join(OUTPUT_DIR, 'districts-leadership.json')));
