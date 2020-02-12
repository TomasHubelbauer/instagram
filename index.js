const fetch = require('node-fetch');
const fs = require('fs-extra');
let email;
let headers;
try {
  email = require('../self-email');
  headers = require('../self-email/headers');
}
catch (error) {
  // Ignore the lack of emailer on the system
}

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
    if (email) {
      try {
        /** @type {Data} */
        const knownData = await fs.readJson(fileName);
        await email(
          headers('Instagram Bot', `Instagram Stats for ${handle}`),
          '<ul>',
          `<li>Followers: ${data.followers} (${knownData.followers === data.followers ? 'unchanged' : `from ${knownData.followers}`})</li>`,
          `<li>Following: ${data.following} (${knownData.following === data.following ? 'unchanged' : `from ${knownData.following}`})</li>`,
          `<il>Posts: ${data.posts} (${knownData.posts === data.posts ? 'unchanged' : `from ${knownData.posts}`})</li>`,
          '</ul>',
          'Thanks!'
        );
      }
      catch (error) {
        console.log(error);
        // Ignore the case of no known data being persisted yet
      }
    }

    await fs.writeJson(fileName, data, { spaces: 2 });
  }
};

module.exports = module.exports();
