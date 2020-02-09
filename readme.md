# Instagram

Scrapes followers and posts off Instagram and emails changes.

## Running

`node . ${handles}`

`handles` is a comma-separated string of Instagram handles.
It can also be provided through a `INSTAGRAM_HANDLES` environment variable.

A file name `${handle}.data.json` will be created.

If `../self-email` is present on the system, a notification email will be sent
with follower/following/posts changes.

You can also `require('./insta')` to get a promise of the running scraper
and wait for success (no return value) or catch an error.
