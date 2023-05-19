# Screen Picker Package

Truffle poll package where viewers vote by clicking anywhere on the screen. Currently, there are two separate embeds: The viewer embed facilitates the actual poll (overlay on YouTube stream) and the admin embed controls creating/managing the polls. By default, the overlay runs on port `5173` and the admin embed on `5174`. Below are the corresponding dev embed configs. An authentication token is needed in both cases.

## Usage

A poll is identified by a unique poll id and is owned by an org (identified by the org id). To be able to create a poll for an org, the logged in Truffle user must have the `Admin` role. When starting a poll, the evaluation mode must be specified. By default, the submitted votes are evaluated using a k-means clustering algorithm. However, if there are pre-defined, discrete areas which viewers should be able to vote on, e.g. a grid of buttons, please select a binning mode. The layout of these areas is created through the "Poll Layouts" tab.

## Build

Remember to specify the environment when deploying (`development`, `staging`, `production`). The hosting predeploy scripts will build the vite projects with the correct environment variables.

    firebase deploy --only hosting --project production -m "Update Result Visualizer"

## [Viewer embed](viewer-embed)

```json
{
  "url": "http://localhost:5173/viewer",
  "authToken": "AUTH_TOKEN",
  "parentQuerySelector": "#player",
  "contentPageType": "youtube",
  "defaultStyles": {
    "height": "100%",
    "width": "100%",
    "position": "absolute",
    "top": "0px",
    "left": "0px",
    "mix-blend-mode": "hard-light"
  }
}
```

Also hosted on

```bash
https://SITE_ID.firebaseapp.com/viewer/
https://screen-picker-embed.firebaseapp.com/viewer/ # Production
```

where `SITE_ID` is determined by the mode (e.g. `screen-picker-embed` for `production`, c.f. [`.firebaserc`](.firebaserc))

## [Admin embed](admin-embed)

Ideally, this would not be an embed, but perhaps accessible via the creator website?

```json
{
  "url": "http://localhost:5174/admin",
  "authToken": "AUTH_TOKEN",
  "parentQuerySelector": "#above-the-fold",
  "contentPageType": "youtube",
  "defaultStyles": {
    "height": "428px",
    "width": "100%"
  }
}
```

```bash
https://SITE_ID.firebaseapp.com/admin/
https://screen-picker-embed.firebaseapp.com/admin/ # Production
```

## [Poll results](results-visualizer)

Result are shown on a separate page, which connects to the Realtime Database. You can either access the visualization via a permalink to a specific poll

```bash
https://SITE_ID.firebaseapp.com/visualizer?orgId=YOUR_ORG_ID&pollId=YOUR_POLL_ID
https://screen-picker-results.firebaseapp.com/visualizer?orgId=YOUR_ORG_ID&pollId=YOUR_POLL_ID # Production
```

or open

```bash
https://SITE_ID.firebaseapp.com/latest?orgId=YOUR_ORG_ID
https://screen-picker-results.firebaseapp.com/latest?orgId=YOUR_ORG_ID # Production
```

which redirects to the most recent poll of the specified org.

# Backend

Business logic, databases and hosting are handled with Firebase. A Realtime Database stores the poll entries and Firestore saves what polls exists and which are currently active. Hosting is needed to serve the page showing the poll results, which can be added as a browser source in OBS.

# Simulate entries

To create mock database entries (votes) for debugging, check out [simulate-votes](simulate-votes).
