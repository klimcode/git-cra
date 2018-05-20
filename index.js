#!/usr/bin/env node

const PATH = require('path');
const FILE = require('fs-handy-wraps');
const SHELL = require('shelljs');
const CLI = require('inquirer');
const OPN = require('opn');
const CH = require('chalk');
const RUN = require('brief-async');
const { LOG, ERR } = require('./helpers');

const { HOME, CWD } = FILE;
const HOMEDIR = PATH.join(HOME, 'npfe');
const CONFIG_FILE = PATH.join(HOMEDIR, 'config.json');

const ARGS = process.argv.slice(2);
const PROJECT_NAME = ARGS[0] || '';
const PROJECT_PATH = PATH.join(CWD, PROJECT_NAME);
const SOURCE_URL = ARGS[1] || '';
const SOURCE_ALIAS = ARGS[2] || '';
let CONFIG;


const getConfig = (args, resolve) => {
  const [configPath] = args;
  const getDefaultConfig = () => {
    LOG(CH`{cyanBright The default Config is created here:} ${configPath}`);
    return FILE.read('default-config.json');
  };

  FILE.getConfig(configPath, getDefaultConfig, null, resolve);
};
const preparations = (args, resolve) => {
  const [config] = args;
  CONFIG = config; // Global variable mutation!

  // Test 1: is git installed?
  if (!SHELL.which('git')) {
    ERR(CH`{red Error: git is not found}`);
    SHELL.exit(1);
  }

  // Test 2: is Project name specified?
  if (!PROJECT_NAME) {
    LOG(CH`{cyanBright Config editing mode...}`);
    OPN(CONFIG_FILE);
    SHELL.exit(0);
  }

  // Test 3: destination folder existing
  if (SHELL.test('-e', PROJECT_PATH)) {
    const questions = [{
      message: `The directory ${PROJECT_PATH} is existed already. Clear it?`,
      type: 'confirm',
      name: 'toClear',
    }];
    CLI.prompt(questions).then((answers) => {
      if (answers.toClear) {
        const isRemoved = SHELL.rm('-rf', PROJECT_PATH);
        if (isRemoved.code) {
          ERR(CH`{red Ensure the directory is not used by another application then retry.}`);
          SHELL.exit(0);
        }

        resolve(config);
      } else {
        SHELL.exit(0);
      }
    });
  } else {
    resolve(config);
  }
};
const getSourceUrl = (args, resolve) => {
  const [config, sourceArgv, sourceAlias] = args;
  const { sources } = config;

  const isAlias = sourceArgv.search('/') === -1;
  const knownSource = sources.find(base =>
    (isAlias && (base.alias === sourceArgv)) ||
    (base.url === sourceArgv));
  const sourceUrl = isAlias
    ? knownSource && knownSource.url
    : sourceArgv;


  // debugger;
  if (isAlias) {
    if (knownSource) {
      LOG(CH`{cyanBright Source Project's URI is:} ${sourceUrl}`);
      resolve(sourceUrl);
    } else {
      LOG(CH`{yellow Unknown alias:} ${sourceAlias}`);
      const firstSource = sources[0];

      if (config.firstForced) {
        LOG(CH`{cyanBright Using the first source repo} ({yellow ${firstSource.alias}:} ${firstSource.url})`);
        resolve(firstSource.url);
      } else {
        const questions = [{
          message: `Use the first alias? (${firstSource.alias}: ${firstSource.url})`,
          type: 'confirm',
          name: 'useDefault',
        }];
        CLI.prompt(questions).then((answers) => {
          if (answers.useDefault) {
            resolve(firstSource.url);
          } else {
            SHELL.exit(0);
          }
        });
      }
    }
  } else if (knownSource) {
    LOG(CH`{yellow This URI had been used already.} You may specify only alias ${sourceAlias} instead`);
    resolve(sourceUrl);
  } else {
    // The new alias will be added to the config. Mutation!
    const aliasBase = sourceAlias || 'source_';
    const alias = sourceAlias || `${aliasBase}${config.sources.length}`;
    config.sources.push({ alias, url: sourceUrl });
    FILE.write(CONFIG_FILE, JSON.stringify(config, null, 2));
    LOG(CH`{cyanBright New alias ${alias} is added to the Config}`);
  }
};
const cloneSourceProject = (args, resolve) => {
  const [sourceUrl, projectName] = args;


  SHELL.exec(`git clone ${sourceUrl} ${projectName}`);
  LOG(CH`{cyanBright Source project is cloned}`);

  SHELL.cd(`${projectName}`);

  if (CONFIG.clearHistory) {
    const isRemoved = SHELL.rm('-rf', '.git');
    if (isRemoved.code) {
      ERR(CH`{red Can not remove ${'.git'}. It's possibly locked}`);
      SHELL.exit(0);
    }

    SHELL.exec('git init');
    SHELL.exec('git add .');
    SHELL.exec('git commit -m "Initial commit"');
    LOG(CH`{cyanBright Commits history of the source project is cleared}`);
  }

  resolve(projectName);
};
const setNewGitOrigin = (args, resolve) => {
  const [projectName] = args;

  const setOrigin = (origin) => {
    if (CONFIG.clearHistory) {
      SHELL.exec(`git remote add origin ${origin}`);
    } else {
      SHELL.exec(`git remote set-url origin ${origin}`);
    }

    LOG(CH`{cyanBright Next step is a forced push of Initial commit to the New Project\'s repo}`);
    SHELL.exec('git push -u --force origin master');
    resolve();
  };


  if (CONFIG.gitUriTemplate) {
    const originUriFromConfig = CONFIG.gitUriTemplate.replace('%repo%', projectName);
    setOrigin(originUriFromConfig);
  } else {
    const questions = [{
      message: `What is the Origin URI of ${projectName}?`,
      type: 'input',
      name: 'originUri',
    }];
    CLI.prompt(questions).then((answers) => {
      LOG(CH`{cyanBright Tip: it's convenient to set up the} "gitUriTemplate" {cyanBright in the Config file.}`);
      setOrigin(answers.originUri);
    });
  }
};
const replaceName = (args, resolve) => {
  const oldName = JSON.parse(SHELL.cat('package.json')).name;

  SHELL.sed('-i', oldName, PROJECT_NAME, 'package.json');
  LOG(CH`{cyanBright The Source Project's name is replaced to the New Project's name in:} package.json`);

  resolve();
};
const runCommands = () => {
  const { commands } = CONFIG;

  if (commands && commands.length) {
    LOG(CH`{cyanBright Next step: commands specified in the Config:}\n`, commands);

    commands.forEach((command) => {
      SHELL.exec(command);
    });
  }

  SHELL.exit(0);
};


const roadmap = [
  [CONFIG_FILE],                      getConfig,
  [getConfig],                        preparations,
  [preparations, SOURCE_URL, SOURCE_ALIAS], getSourceUrl,
  [getSourceUrl, PROJECT_NAME],       cloneSourceProject,
  [cloneSourceProject, PROJECT_NAME], setNewGitOrigin,
  [setNewGitOrigin],                  replaceName,
  [replaceName],                      runCommands,
];
RUN(roadmap);
