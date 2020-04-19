const fetch = require('node-fetch');
const fs = require('fs-extra');
const email = require('../self-email');
const { eml, subject, sender, recipient } = require('../self-email');

module.exports = async function () {
  let handles = process.argv[2] || process.env.INSTAGRAM_HANDLES;
  if (!handles) {
    throw new Error('The handle(s) must be passed in a command line argument!');
  }

  handles = handles.split(',');
  for (const handle of handles) {
    const response = await fetch('https://www.instagram.com/' + handle);
    const text = await response.text();
    const regex = /<script type="text\/javascript">window._sharedData = (?<json>[^;]+);<\/script>/gm;
    const match = await regex.exec(text);
    const json = match.groups.json;
    const user = JSON.parse(json).entry_data.ProfilePage[0].graphql.user;

    /** @typedef {{ followers: number; following: number; posts: nunber; }} Data */
    /** @type {Data} */
    const data = {
      stamp: new Date().toISOString(),
      bio: user.biography,
      web: user.external_url,
      followers: user.edge_followed_by.count,
      following: user.edge_follow.count,
      name: user.full_name,
      id: user.id,
      avatar: user.profile_pic_url,
      handle: user.username,
      posts: user.edge_owner_to_timeline_media.count,
    };

    console.log(handle);
    console.log('\tfollowers', data.followers);
    console.log('\tfollowing', data.following);
    console.log('\tposts', data.posts);

    const fileName = handle + '.data.json';
    try {
      /** @type {Data} */
      const knownData = await fs.readJson(fileName);

      const followerChange = [
        `${data.followers} (-${knownData.followers - data.followers})`,
        `${data.followers} (unchanged)`,
        `${data.followers} (+${data.followers - knownData.followers})`
      ][Math.sign(data.followers - knownData.followers) + 1];

      const followingChange = [
        `${data.following} (-${knownData.following - data.following})`,
        `${data.following} (unchanged)`,
        `${data.following} (+${data.following - knownData.following})`
      ][Math.sign(data.following - knownData.following) + 1];

      const postsChange = [
        `${data.posts} (-${knownData.posts - data.posts})`,
        `${data.posts} (unchanged)`,
        `${data.posts} (+${data.posts - knownData.posts})`
      ][Math.sign(data.posts - knownData.posts) + 1];

      // TODO: Email the differences (followers, unfollowers, following, unfollowing, new post embed)
      await email(
        eml(
          subject(`Instagram Stats for ${handle}`),
          sender('Instagram <bot+insta@hubelbauer.net>'),
          recipient('Tomas Hubelbauer <tomas@hubelbauer.net>'),
          `<h1>Instagram Stats for ${handle}</h1>`,
          '<h2>Followers</h2>',
          followerChange,
          '<h2>Following</h2>',
          followingChange,
          '<h2>Posts</h2>',
          postsChange,
          '<p>Thanks!</p>'
        )
      );
    }
    catch (error) {
      console.log(error);
      // Ignore the case of no known data being persisted yet
    }

    await fs.writeJson(fileName, data, { spaces: 2 });
  }
};

module.exports = module.exports();
