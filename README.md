# New Project From Existing

![this project is under construction](https://klimcode.github.io/base/construction.png)

Clones a git-source to a specific directory and replaces all source-name occurencies by a name of the new Project.

## Installation

```bash
npm i -g npfe
```

## Example

`npfe` memorizes a URI specified before and makes it possible to use aliases for source projects.

```bash
npfe new-project https://github.com/klimcode/base-cra cra
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

## Explanation

Explanation
