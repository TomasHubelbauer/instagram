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

## Data

The Instagram page HTML source sets a `window.sharedData` variable which
at the `entry_data.ProfilePage[0].graphql.user` path contains the following:

- `biography` - the user bio
- `external_url` - the user web
- `edge_followed_by.count` - followers #
- `edge_follow.count` - following #
- `full_name` - the full name
- `id`
- `profile_pic_url` - timestamped!
- `profile_pic_url_hd` - timestamped!
- `username`
- `edge_owner_to_timeline_media.count` - posts #
- `edge_owner_to_timeline_media.edges[].node` - posts
  - `__typename` - `GraphImage`/`GraphVideo`
  - `id`
  - `edge_media_to_caption.edges[0].node.text` post description
  - `shortcode` - URL ID
  - `display_url` - timestamped!
  - `edge_liked_by.count` - likes #
  - `media_preview` - Base64 unknown format
  - `thumbnail_src` - timestamped!
  - `thumbnail_resources` - `src` (timestamped), `config_width`, `config_height`
  - `is_video` - how related to `__typename`
  - `video_view_count` - if `is_video`

It might be necessary to send a cookie to download the timestamped images.

## To-Do

### Create a direcctory instead of a single JSON

### Download the posts to back them up
