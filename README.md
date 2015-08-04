[![Build Status](https://travis-ci.org/ValidUSA/ember-couch.svg?branch=2.0.0-alpha)](https://travis-ci.org/ValidUSA/ember-couch)[![License](https://img.shields.io/badge/license-MIT-blue.svg)](MIT-LICENSE)

# Ember Couch

An `ember-data` kit for Apache CouchDB. A collection of adapters to work with CouchDB documents, attachments, revisions, changes feed. Based off of [ember-couchdb-kit by Aleksey Zatvobor](https://github.com/Zatvobor/ember-couchdb-kit).

## Version
This addon is tested to work with versions of Ember and Ember-Data are:
* Ember 1.13.5, Ember-Data 1.13.6

## Installation
In your command prompt use:
`ember install ember-couch`

## Features 
Some notable features:
* natural `findRecord/createRecord/deleteRecord` functions;
* document's attachements designed as `hasMany` relationship;
* document's revisions designed as `belongsTo` and `hasMany` relationships;
* ability to work with `/_changes` feeds;

For other features have a look at our dummy app located in
`tests/dummy/app`

#### Contribution

See [CONTRIBUTING.md](CONTRIBUTING.md)


#### License

`ember-couch` source code is released under MIT-License. Check [LICENSE.md](LICENSE.md) for more details.
