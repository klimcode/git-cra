#!/usr/bin/env node

const PATH = require('path');
const FILE = require('fs-handy-wraps');
const SHELL = require('shelljs');
const CLI = require('inquirer');
const BRIEF = require('brief-async');
const { LOG, ERR } = require('./helpers');

const { HOME, CWD } = FILE;
const HOMEDIR = PATH.join(HOME, 'npfe');
const CONFIG_FILE = PATH.join(HOMEDIR, 'config.json');

const ARGS = process.argv.slice(2);
// const [PROJECT_NAME] = ARGS;
const PROJECT_NAME = 'new-test-project';
const PROJECT_PATH = PATH.join(CWD, PROJECT_NAME);


const getConfig = (args, resolve) => {
  const [configPath] = args;
  const getDefaultConfig = () => {
    LOG(`Default config created here ${configPath}`);
    return FILE.read('default-config.json');
  };

  FILE.getConfig(configPath, getDefaultConfig, null, resolve);
};
const preparations = (args, resolve) => {
  // const [config] = args;

  // Test 1: is git installed?
  if (!SHELL.which('git')) {
    ERR('Error: git is not found');
    SHELL.exit(1);
  }

  // Test 2: destination folder exist. Remove it?
  LOG(PROJECT_PATH);
  if (SHELL.test('-e', PROJECT_PATH)) {
    const questions = [{
      type: 'confirm',
      name: 'toClear',
      message: `The directory ${PROJECT_PATH} is existed already. Clear it?`,
    }];
    CLI.prompt(questions).then((answers) => {
      if (answers.toClear) SHELL.rm('-rf', PROJECT_PATH);
    });
  }
};

const roadmap = [
  [CONFIG_FILE],  getConfig,
  [getConfig],    preparations,
  // [readConfig],                 makeThings,
];
BRIEF(roadmap);


/*


if (process.argv.length < 4) {
  console.log('Please provide an app name and a ZIP with the template');
  console.log('e.g.');
  console.log('$ craft MyApp https://github.com/stoyan/fail/archive/master.zip');
  process.exit(1);
}

const fs = require('fs-extra');
const path = require('path');
const request = require('request');
const url = require('url');
const unzip = require('extract-zip');

const stat = fs.statSync;

const zip = process.argv[3];
const app = process.argv[2];

const replacebles = [
  '.html',
  '.css',
  '.js',
  '.json',
].reduce((res, el) => {res[el] = 1; return res;}, {});

let tempDir;
let tempUnzipDir;
const appDir = path.resolve(process.cwd(), app);

log('Validating...');
const uri = url.parse(zip);
if (!uri.host || !uri.path || !uri.protocol) {
  fail(zip, 'is not a valid URL');
}

try {
  stat(appDir);
  logError(appDir, 'already exists, giving up');
  process.exit(1);
} catch (_) {}

log('Making app dirs...');
fs.mkdirSync(appDir);
tempDir = fs.mkdtempSync(appDir);
tempUnzipDir = fs.mkdtempSync(tempDir);

log('Downloading template...');
const localZip = path.resolve(tempDir, 'template.zip');
const file = fs.createWriteStream(localZip);

request
  .get(zip)
  .on('error', err => fail(err))
  .pipe(file);

file.on('finish', () => {
  file.close(() => {
    let packageDir;
    log('Unzipping...');
    unzip(localZip, {
        dir: tempUnzipDir,
        onEntry: entry => {
          if (entry.fileName.endsWith('package.json')) {
            packageDir = path.resolve(tempUnzipDir, path.dirname(entry.fileName));
          }
        },
      }, err => {
        if (err) {
          fail('Error unzipping, giving up', localZip);
        }
        if (!packageDir) {
          fail('package.json missing from the template, giving up');
        }
        log('Configuring app...')
        createApp(packageDir, appDir);
    });
  });
});

function createApp(source, dest) {
  fs.copy(source, dest, (err) => {
    if (err) {
      fail(err);
    }
    const packageJson = path.resolve(dest, 'package.json');
    const oldPackage = require(packageJson);

    // replace all app names in all files
    replaceFiles(dest, oldPackage.name, app);

    // write package json
    oldPackage.name = app;
    oldPackage.version = '1.0.0';
    fs.writeFile(packageJson, JSON.stringify(oldPackage, null, 2), (err) => {
      if (err) {
        logError(err);
      }
    });

    // write readme
    fs.writeFile(
      path.resolve(dest, 'README.md'),
      `# ${app}\n\nHello`,
      () => {}
    );

    done();
  });
}

function rmTemp() {
  if (tempDir) {
    fs.removeSync(tempDir);
  }
  if (tempUnzipDir) {
    fs.removeSync(tempUnzipDir);
  }
}

function replaceFiles(dir, seek, replaceWith) {
  fs.readdirSync(dir).forEach(f => {
    if (f.startsWith('.')) {
      return; // no .DS_Store etc, thank you
    }
    if (f === 'package.json' || f.startsWith('README')) {
      return; // special plan for these
    }

    const file = path.resolve(dir, f);
    const stats = stat(file);

    if (stats.isDirectory()) {
      return replaceFiles(file, seek, replaceWith);
    }
    if (!replacebles[path.extname(f)]) {
      return; // images and such
    }

    fs.readFile(file, 'utf-8', (err, contents) => {
      if (err) {
        logError(err);
      }
      contents = contents.replace(new RegExp(seek, 'g'), replaceWith);
      fs.writeFile(file, contents, (err) => {
        if (err) {
          logError(err);
        }
      });
    });

  });
}

function fail(...msg) {
  logError(msg.join(' '));
  rmTemp();
  if (appDir) {
    fs.removeSync(appDir);
  }
  process.exit(1);
}

function log(...msg) {
  console.log('\x1B[90m'+ msg.join(' ') +'\x1B[39m'); // thanks echomd
}

function logError(...msg) {
  console.log('\x1B[31m✖ ' + msg.join(' ') + '\x1B[39m');
}

function done() {
  console.log('\x1B[32m✔ Success\x1B[39m');
  console.log('\nNext steps...');
  console.log('  cd ' + app);
  console.log('  npm install .');
  rmTemp();

  const postcraft = path.resolve(appDir, 'postcraft.txt');
  fs.readFile(postcraft, 'utf-8', (err, contents) => {
    if (err) {}
    console.log('\nAnd a word from your template creator...');
    console.log(contents);
    fs.remove(postcraft);
  });

}
*/
