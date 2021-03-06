# Data-Forge

The JavaScript data transformation and analysis toolkit inspired by Pandas and LINQ.

*Implemented* in TypeScript.<br>
*Used* in JavaScript ES5+ or TypeScript.

Need to plot charts? Check out [Data-Forge Plot](http://www.the-data-wrangler.com/introducing-data-forge-plot/).

Need to learn data wrangling? See my book [Data Wrangling with JavaScript](http://bit.ly/2t2cJu2) or blog [The Data Wrangler](http://www.the-data-wrangler.com/).

Do prototyping and data analysis in JavaScript with [Data-Forge Notebook](http://www.data-forge-notebook.com/).

Need to get in touch? Please see my contact details at the end.

[![Build Status](https://travis-ci.org/data-forge/data-forge-ts.svg?branch=master)](https://travis-ci.org/data-forge/data-forge-ts)
[![Coverage Status](https://coveralls.io/repos/github/data-forge/data-forge-ts/badge.svg?branch=master)](https://coveralls.io/github/data-forge/data-forge-ts?branch=master)
[![npm version](https://badge.fury.io/js/data-forge.svg)](https://badge.fury.io/js/data-forge)
[![GitHub license](https://img.shields.io/github/license/Naereen/StrapDown.js.svg)](https://github.com/data-forge/data-forge-ts/blob/master/LICENSE)
[![GitHub issues](https://img.shields.io/github/issues/Naereen/StrapDown.js.svg)](https://GitHub.com/data-forge/data-forge-ts/issues/)

**Please note** that this TypeScript repository replaces the [previous JavaScript version of Data-Forge](https://github.com/data-forge/data-forge-js).

## BREAKING CHANGES

As of v1.3.0 file system support has been removed from the Data-Forge core API. This is after repeated issues from users trying to get Data-Forge working in the browser, especially under AngularJS 6.

Functions for reading and writing files have been moved to the separate code library [Data-Forge FS](https://github.com/data-forge/data-forge-fs).

If you are using the file read and write functions prior to 1.3.0 then your code will no longer work when you upgrade to 1.3.0. The fix is simple though, where usually you would just require in Data-Forge as follows:

```javascript
const dataForge = require('data-forge');
```

Now you must also require in the new library as well:

```javascript
const dataForge = require('data-forge');
require('data-forge-fs');
```

Data-Forge FS augments Data-Forge core so that you can use the readFile/writeFile functions as in previous versions and as is shown in this readme and the guide.

If you still have problems with AngularJS 6 please see this workaround:
https://github.com/data-forge/data-forge-ts/issues/3#issuecomment-438580174

## Install

    npm install --save data-forge data-forge-fs

## Quick start

Data-Forge can load CSV, JSON or arbitrary data sets. 

Parse the data, filter it, transform it, aggregate it, sort it and much more.

Use the data however you want or export it to CSV or JSON.

Here's an example:

```JavaScript
const dataForge = require('data-forge');
require('data-forge-fs'); // For readFile/writeFile.

dataForge.readFileSync('./input-data-file.csv') // Read CSV file (or JSON!)
    .parseCSV()
    .parseDates(["Column B"]) // Parse date columns.
    .parseInts(["Column B", "Column C"]) // Parse integer columns.
    .parseFloats(["Column D", "Column E"]) // Parse float columns.
    .dropSeries(["Column F"]) // Drop certain columns.
    .where(row => predicate(row)) // Filter rows.
    .select(row => transform(row)) // Transform the data.
    .asCSV() 
    .writeFileSync("./output-data-file.csv"); // Write to output CSV file (or JSON!)
```

## From the browser

Data-Forge also works in the browser, just don't include Data-Forge FS or try to call readFile or writeFile - the file system functions only work under Node.js.

### Install

Install via Bower (or NPM)

    bower install --save data-forge

### Include

Include the code in your HTML

    <script language="javascript" type="text/javascript" src="bower_components/data-forge/data-forge.js"></script>

Data-Forge has been tested with Browserify and Webpack. Please see links to examples below.

### Use

Use it via the `dataForge` global variable.

    var myDataframe = new dataForge.DataFrame(... your data here ...);
    console.log(myDataframe.toString());

## Features

- Import and export CSV and JSON data and text files (when using [Data-Forge FS](https://github.com/data-forge/data-forge-fs)).
- Or work with arbitrary JavaScript data.
- Many options for working with your data:
    - Filtering
    - Transformation
    - Extracting subsets
    - Grouping, aggregation and summarization
    - Sorting
    - And much more
- Great for slicing and dicing tabular data:
    - Add, remove, transform and generate named columns (series) of data.
- Great for working with time series data.
- Your data is indexed so you have the ability to merge and aggregate.
- Your data is immutable! Transformations and modifications produce a new dataset.
- Build data pipeline that are evaluated lazily.
- Inspired by Pandas and LINQ, so it might feel familiar!

## Contributions

Want a bug fixed or maybe to improve performance?

Don't see your favourite feature?

Need to add your favourite Pandas or LINQ feature?

Please contribute and help improve this library for everyone!

Fork it, make a change, submit a pull request. Want to chat? See my contact details at the end or reach out on Gitter.



## Platforms

- Node.js (npm install --save data-forge data-forge-fs) ([see example here](https://github.com/data-forge/data-forge-examples-and-tests/tree/master/package-test/npm))
- Browser
    - Via bower (bower install --save data-forge) ([see example here](https://github.com/data-forge/data-forge-examples-and-tests/tree/master/package-test/bower))
    - Via Browserify ([see example here](https://github.com/data-forge/data-forge-examples-and-tests/tree/master/examples/2.%20plot%20-%20in%20browser))
    - Via Webpack ([see example here](https://github.com/data-forge/data-forge-examples-and-tests/tree/master/examples/3.%20plot%20-%20in%20browser%20-%20with%20dates))

## Documentation

- [Changes](docs/changes.md)
- [The guide](docs/guide.md)
- [Key concepts](docs/concepts.md)
- [API docs](https://data-forge.github.io/data-forge-ts/)
- [Data-Forge FS](https://github.com/data-forge/data-forge-fs/)
- [Data-Forge Plot](https://github.com/data-forge/data-forge-plot/)
- [Gitter](https://gitter.im/data-forge)

## Resources

- [The Data Wrangler](http://www.the-data-wrangler.com/)
- [Data Wrangling with JavaScript](http://bit.ly/2t2cJu2)
- [Data-Forge Notebook](http://www.data-forge-notebook.com/)

## Contact

Please reach and tell me what you are doing with Data-Forge or how you'd like to see it improved.

- Twitter: @ashleydavis75
- Email: ashley@codecapers.com.au
- Linkedin: www.linkedin.com/in/ashleydavis75
- Web: www.codecapers.com.au



<!--todo:
[npm-image]: https://img.shields.io/npm/v/express.svg
[npm-url]: https://www.npmjs.com/package/data-forge
[downloads-image]: https://img.shields.io/npm/dm/express.svg
[downloads-url]: https://npmjs.org/package/express
[travis-image]: https://img.shields.io/travis/expressjs/express/master.svg?label=linux
[travis-url]: https://travis-ci.org/expressjs/express
[appveyor-image]: https://img.shields.io/appveyor/ci/dougwilson/express/master.svg?label=windows
[appveyor-url]: https://ci.appveyor.com/project/dougwilson/express
[coveralls-image]: https://img.shields.io/coveralls/expressjs/express/master.svg
[coveralls-url]: https://coveralls.io/r/expressjs/express?branch=master
--->
