# WP Version Check Action

[![CI Status](https://github.com/technote-space/wp-version-check-action/workflows/CI/badge.svg)](https://github.com/technote-space/wp-version-check-action/actions)
[![codecov](https://codecov.io/gh/technote-space/wp-version-check-action/branch/main/graph/badge.svg)](https://codecov.io/gh/technote-space/wp-version-check-action)
[![CodeFactor](https://www.codefactor.io/repository/github/technote-space/wp-version-check-action/badge)](https://www.codefactor.io/repository/github/technote-space/wp-version-check-action)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/technote-space/wp-version-check-action/blob/main/LICENSE)

*Read this in other languages: [English](README.md), [日本語](README.ja.md).*

This is a `GitHub Actions` to check versions of wp plugin files before publish.

## Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
<details>
<summary>Details</summary>

- [Usage](#usage)
  - [Used when push](#used-when-push)
  - [Used in the release process](#used-in-the-release-process)
- [Target files](#target-files)
- [Options](#options)
- [Action event details](#action-event-details)
  - [Target events](#target-events)
  - [Conditions](#conditions)
- [Author](#author)

</details>
<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Usage
### Used when push
   e.g. `.github/workflows/check_version.yml`
   ```yaml
   on: push
   name: Check version
   jobs:
     checkVersion:
       name: Check version
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v2

         # Use this GitHub Action
         - name: Check version
           uses: technote-space/wp-version-check-action@v1
           with:
             BRANCH_PREFIX: release/
   ```

### Used in the release process
   e.g. `.github/workflows/release.yml`
   ```yaml
   on:
    push:
      tags:
        - 'v*'
   name: Publish Package
   jobs:
     release:
       name: Publish Package
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v2
         - uses: actions/setup-node@v2
           with:
             node-version: '12.x'
             registry-url: 'https://registry.npmjs.org'

         # Use this GitHub Action
         - name: Check version
           uses: technote-space/wp-version-check-action@v1
           with:
             COMMIT_DISABLED: 1

         - run: npm install
         - run: npm run build
         - run: npm publish
           env:
             NODE_AUTH_TOKEN: ${{ secrets.NPM_AUTH_TOKEN }}
   ```
[More details of target event](#action-event-details)

## Target files
- readme.txt
  - `Stable tag:`
- update.json
  - `"version"`
- autoload file (PHP file which contains `Version` info)
  - `Version:`

## Options
| name | description | default | required | e.g. |
|:---:|:---|:---:|:---:|:---:|
|BRANCH_PREFIX|Branch name prefix| | |`release/`|
|COMMIT_DISABLED|Whether commit is disabled| | |`true`|
|COMMIT_MESSAGE|Commit message of update version commit|`feat: update version`|true| |
|TEST_TAG_PREFIX|Prefix for test tag| | |`test/`|
|NEXT_VERSION|Specify next version| | |`v1.2.3`|
|GITHUB_TOKEN|Access token|`${{github.token}}`|true|`${{secrets.ACCESS_TOKEN}}`|

## Action event details
### Target events
| eventName: action | condition |
|:---:|:---:|
|push: *|[condition1](#condition1)|
|release: published|[condition1](#condition1)|
|release: rerequested|[condition1](#condition1)|
|pull_request: opened, reopened, synchronize|[condition2](#condition2)|
|created: *|[condition3](#condition3)|

### Conditions
#### condition1
- tags
  - semantic versioning tag (e.g. `v1.2.3`)
- branches
  - `${BRANCH_PREFIX}${tag}`
    - tag: semantic versioning tag (e.g. `v1.2.3`)
    - e.g. branch: `release/v1.2.3`
#### condition2
- branches
  - `${BRANCH_PREFIX}${tag}`
    - tag: semantic versioning tag (e.g. `v1.2.3`)
    - e.g. branch: `release/v1.2.3`
#### condition3
- tags
  - semantic versioning tag (e.g. `v1.2.3`)

## Author
[GitHub (Technote)](https://github.com/technote-space)  
[Blog](https://technote.space)
