# grunt-css-mini

> a grunt plugin to zip css selectors in css or html files.

## Getting Started
This plugin requires Grunt `~0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-css-mini --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-css-mini');
```

## The "css_mini" task

### Overview
In your project's Gruntfile, add a section named `css_mini` to the data object passed into `grunt.initConfig()`.

```js
// muti targets
grunt.initConfig({
  cssmini: {
      app1: {
          options: {
              cssSrc: ['test/fixtures/app1/*.css'],
              cssDest: 'test/tmp'
          },
          src: 'test/fixtures/app1/*.html',
          dest: 'test/tmp'
      },
      app2: {
          options: {
              cssSrc: ['test/fixtures/app2/*.css'],
              cssDest: 'test/tmp'
          },
          src: 'test/fixtures/app2/*.html',
          dest: 'test/tmp'
      }
  },
});

// or single target
grunt.initConfig({
  cssmini: {
      options: {
          cssSrc: ['test/fixtures/app1/*.css'],
          cssDest: 'test/tmp'
      },
      html: {
          src: 'test/fixtures/app1/*.html',
          dest: 'test/tmp'
      }
  },
});
```

### Options

#### options.separator
Type: `String`
Default value: `',  '`

A string value that is used to do something with whatever.

#### options.punctuation
Type: `String`
Default value: `'.'`

A string value that is used to do something else with whatever else.

### Usage Examples

#### Default Options
In this example, the default options are used to do something with whatever. So if the `testing` file has the content `Testing` and the `123` file had the content `1 2 3`, the generated result would be `Testing, 1 2 3.`

```js
grunt.initConfig({
  css_mini: {
    options: {},
    files: {
      'dest/default_options': ['src/testing', 'src/123'],
    },
  },
});
```

#### Custom Options
In this example, custom options are used to do something else with whatever else. So if the `testing` file has the content `Testing` and the `123` file had the content `1 2 3`, the generated result in this case would be `Testing: 1 2 3 !!!`

```js
grunt.initConfig({
  css_mini: {
    options: {
      separator: ': ',
      punctuation: ' !!!',
    },
    files: {
      'dest/default_options': ['src/testing', 'src/123'],
    },
  },
});
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_
