const fetch = require('node-fetch');
const fs = require('fs-extra');
let email;
try {
  email = require('../self-email');
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
    const regex = /<meta content="(?<followers>\d+) Followers,( (?<following>\d+) Following,)? (?<posts>\d+) Posts(?<bio>[^"]+)" name="description" \/>/gm;
    const match = await regex.exec(text);
    const { followers, following, posts } = match.groups;

    /** @typedef {{ followers: number; following: number; posts: nunber; }} Data */
    /** @type {Data} */
    const data = { followers: Number(followers), following: Number(following), posts: Number(posts) };
    const fileName = handle + '.data.json';

    if (email) {
      try {
        /** @type {Data} */
        const knownData = await fs.readJson(fileName);
        await email(`
From: Instagram Bot <bot@hubelbauer.net>
To: Tomas Hubelbauer <tomas@hubelbauer.net>
Subject: Instagram Stats for ${handle}
Content-Type: text/html

<ul>
<li>Followers: ${followers} (${knownData.followers === data.followers ? 'unchanged' : `from ${knownData.followers}`})</li>
<li>Following: ${following} (${knownData.following === data.following ? 'unchanged' : `from ${knownData.following}`})</li>
<il>Posts: ${posts} (${knownData.posts === data.posts ? 'unchanged' : `from ${knownData.posts}`})</li>
</ul>

Thanks!
`);
      }
      catch (error) {
        // Ignore the case of no known data being persisted yet
      }
    }

    await fs.writeJson(fileName, data, { spaces: 2 });
  }
};

module.exports = module.exports();
