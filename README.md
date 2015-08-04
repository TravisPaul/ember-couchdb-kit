[![Build Status](https://travis-ci.org/ValidUSA/ember-couch.svg?branch=2.0.0-alpha)](https://travis-ci.org/ValidUSA/ember-couch)[![License](https://img.shields.io/badge/license-MIT-blue.svg)](MIT-LICENSE)

# Ember Couch

An `ember-data` kit for Apache CouchDB. A collection of adapters to work with CouchDB documents, attachments, revisions, and the changes feed. Based off of [ember-couchdb-kit by Aleksey Zatvobor](https://github.com/Zatvobor/ember-couchdb-kit).

## Version
Version 0.0.1 of this addon is tested to work with Ember 1.13.6 and Ember Data 1.13.7.

## Installation and Setup
    ember install ember-couch

In your adapters and serializers you must import then extend the adapter and serializer you wish to use from ember-couch. There are 3 adapters you can extend and 3 serializers you can extend. They are:
### Adapters
* DocumentAdapter
* AttachmentAdapter
* RevAdapter (experimental)
### Serializers
* DocumentSerializer
* AttachmentSerializer
* RevSerializer (experimental)

Example adapter:
```js
import { DocumentAdapter } from 'ember-couch';

export default DocumentAdapter.extend({
   host: 'localhost:5984',
   db: 'boards'
});
```
Example serializer:
```js
import { DocumentSerializer } from 'ember-couch';

export default DocumentSerializer.extend();
```

If you would like to work with the changes feed, just add this statement to the top of your route:
```js
import { ChangesFeed } from "ember-couch";
```

## Features 
Some notable features:
* natural `findRecord/createRecord/deleteRecord` functions;
* document's attachments designed as `hasMany` relationship;
* document's revisions designed as `belongsTo` and `hasMany` relationships;
* ability to work with `/_changes` feeds;

For other features have a look at our example app located in
`tests/dummy/app`

#### Contribution

See [CONTRIBUTING.md](CONTRIBUTING.md)


#### License

`ember-couch` source code is released under MIT-License. Check [LICENSE.md](LICENSE.md) for more details.
