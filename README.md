### Create user

    nvm use
    truffle-cli user create

# Flow

- Create new poll in Admin UI (select channel ID)
  - Cloud Functions uses invidious to fetch livestream URL and saves it in Firestore (ID of document is video ID)
  - Poll is opened automatically (set `currentlyVoting` to `true`)
- In Admin UI, streamer can end poll
