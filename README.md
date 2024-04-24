<div>
  <h1 align="center"><a href="https://www.epicweb.dev/workshops">Epic CRUD</a></h1>
  <strong>
    Workshop tagline
  </strong>

## Read and Write Basics

- [x] Nested Routing
- [x] Create a form
- [x] Server-side validation with Zod
- [x] Create a Prisma schema
- [x] Write to the database
- [x] Read from the database
- [x] Clear the forms after submission
- [ ] Error handling
- [ ] Optimistically show new pending items

## Pagination

- [x] Paginate items server-side
- [x] Allow user to configure page size
- [ ] Add extra items for partial pages

## Data display and sorting

- [x] Add a new column to the table
- [x] Display dates with user's timezone
- [ ] Sort data by column

## Search and Filtering

- [x] Filter/search data server-side
- [ ] Cache items client side
- [ ] Use filter as default settings for new items

## Customize schema

- [ ] Add project settings to schema
- [ ] Create project settings route
- [ ] Allow adding and removing statuses and priorities
- [ ] Read table schema from server and update all references to hardcoded
      values

## Update and Delete items

- [ ] Allow selecting items
- [ ] Add select all button
- [ ] Delete selected items
- [ ] Optimistically hide items while deleting
- [ ] Edit selected items
- [ ] Optimistically modify items while editing

## Detailed item management

- [ ] Add dynamic route for each item
- [ ] Add breadcrumbs to the issue page
- [ ] Add next/previous buttons, use hotkeys to navigate
- [ ] Edit issue title and description
- [ ] Autosave edits with a debounce
- [ ] Delete item and redirect to index
- [ ] Add error boundary 404 page

## Dependent data

- [ ] Add nested relationships to schema
- [ ] Add parent issue input to edit form
- [ ] Add child issues to edit form
- [ ] Add nested issue inputs to table view
- [ ] Allow creating children from issue page
- [ ] Filter issues by parent/child
- [ ] Cascading deletes

## Dashboarding

- [ ] Add dashboard route
- [ ] Fetch data (?)
- [ ] Defer slow queries
- [ ] Use suspense keys to unblock client navigations

# Workshop 2

## User management

- [ ] Connect login route
- [ ] Protect app routes from unauthenticated users
- [ ] Attach user info to documents
- [ ] Restrict user from editing others' documents

## Audit logs

- [ ] Add event log to schema
- [ ] Update mutations to log events
- [ ] Create audit route to view all events

## Commenting

- [ ] Add comment schema
- [ ] Add comment form to issue

## Notifications

##

<hr />

<div align="center">
  <a
    alt="Epic Web logo with the words Deployed Version"
    href="https://epicweb-dev-crud-bulk-operations.fly.dev/"
  >
    <img
      width="300px"
      src="https://github-production-user-asset-6210df.s3.amazonaws.com/1500684/254000390-447a3559-e7b9-4918-947a-1b326d239771.png"
    />
  </a>
</div>

<hr />

<!-- prettier-ignore-start -->
[![Build Status][build-badge]][build]
[![GPL 3.0 License][license-badge]][license]
[![Code of Conduct][coc-badge]][coc]
<!-- prettier-ignore-end -->

## Prerequisites

- TODO: add prerequisites
- Some
- Pre-requisite
- links
- here

## Pre-workshop Resources

Here are some resources you can read before taking the workshop to get you up to
speed on some of the tools and concepts we'll be covering:

- TODO: add resources

## System Requirements

- [git][git] v2.18 or greater
- [NodeJS][node] v18 or greater
- [npm][npm] v8 or greater

All of these must be available in your `PATH`. To verify things are set up
properly, you can run this:

```shell
git --version
node --version
npm --version
```

If you have trouble with any of these, learn more about the PATH environment
variable and how to fix it here for [windows][win-path] or
[mac/linux][mac-path].

## Setup

This is a pretty large project (it's actually many apps in one) so it can take
several minutes to get everything set up the first time. Please have a strong
network connection before running the setup and grab a snack.

> **Warning**: This repo is _very_ large. Make sure you have a good internet
> connection before you start the setup process. The instructions below use
> `--depth` to limit the amount you download, but if you have a slow connection,
> or you pay for bandwidth, you may want to find a place with a better
> connection.

Follow these steps to get this set up:

```sh nonumber
git clone --depth 1 https://github.com/jacobparis/crud-bulk-operations.git
cd crud-bulk-operations
npm run setup
```

If you experience errors here, please open [an issue][issue] with as many
details as you can offer.

## The Workshop App

Learn all about the workshop app on the
[Epic Web Getting Started Guide](https://www.epicweb.dev/get-started).

[![Kent with the workshop app in the background](https://github-production-user-asset-6210df.s3.amazonaws.com/1500684/280407082-0e012138-e01d-45d5-abf2-86ffe5d03c69.png)](https://www.epicweb.dev/get-started)

<!-- prettier-ignore-start -->
[npm]: https://www.npmjs.com/
[node]: https://nodejs.org
[git]: https://git-scm.com/
[build-badge]: https://img.shields.io/github/actions/workflow/status/jacobparis/crud-bulk-operations/validate.yml?branch=main&logo=github&style=flat-square
[build]: https://github.com/jacobparis/crud-bulk-operations/actions?query=workflow%3Avalidate
[license-badge]: https://img.shields.io/badge/license-GPL%203.0%20License-blue.svg?style=flat-square
[license]: https://github.com/jacobparis/crud-bulk-operations/blob/main/LICENSE
[coc-badge]: https://img.shields.io/badge/code%20of-conduct-ff69b4.svg?style=flat-square
[coc]: https://kentcdodds.com/conduct
[win-path]: https://www.howtogeek.com/118594/how-to-edit-your-system-path-for-easy-command-line-access/
[mac-path]: http://stackoverflow.com/a/24322978/971592
[issue]: https://github.com/jacobparis/crud-bulk-operations/issues/new
<!-- prettier-ignore-end -->
