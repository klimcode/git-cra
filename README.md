# New Project From Existing

![this project is under construction](https://klimcode.github.io/base/construction.png)

Clones a git-source to a specific directory and replaces all source-name occurencies by a name of the new Project.

## Installation

```bash
npm i -g npfe
```

## Usage examples

`npfe` memorizes a URI specified before and makes it possible to use aliases for source projects.

```bash
npfe new-project https://github.com/klimcode/base-cra cra

## later
npfe new-project-2 cra
```

If called w/o arguments then the config file will be opened.

```bash
npfe
```

If source URI or Alias is not specified then the first memorized alias will be used

```bash
npfe new-project
```

## CLI

```bash
npfe <new-project-name> <URI | alias> <new-alias>
```

`npfe` considers if `<URI | alias>` contains a dot symbol (.) then it's a **URI** else it's an **alias**.

If URI specified and it is not memorized yet then the `<new-alias>` argument will be used as an alias for the URI specified.
If `<new-alias>` is not spesicied then a placeholder `source_#` will be used as an alias.

## Configuration

1. `sources` -- is a list of source repos
2. `firstForced` -- if `true` then `npfe` will silently use the first source repo for cases where `<URI | alias>` is omitted.
3. `clearHistory` -- if `true` then the commits history will be cleared.
4. `gitUriTemplate` -- is a URI for the new project's git origin. `%repo%` will be replaced by the new project's name automatically.
5. `commands` -- a list of terminal commands that will be executed at the final stage. It's convenient to place a `npm install` command here, e.g.

## package.json

Additionally, all occurrences of the source project's name will be replaced by the new project's name in the `package.json` file.
