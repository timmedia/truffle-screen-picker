# Screen Picker Package

Truffle poll package where viewers select a point on screen. Currently, there are two separate embeds: The viewer embed facilitates the actual poll (overlay on YouTube stream) and the admin embed controls creating/managing the polls. The overlay runs on port `5173` by default and the admin embed on `5174`. Below are the corresponding dev embed configs. An authentication token is needed in both cases (to manage permissions and ensure each viewer can only vote once).

## Usage

A poll is identified by a unique poll id and is owned by an org (identified by the org id). To be able to create a poll for an org, the logged in Truffle user must have the `Admin` role. When starting a poll, the evaluation mode must be specified. By default, the submitted votes are evaluated using a k-means clustering algorithm. However, if there are pre-defined, discrete areas which viewers should be able to vote on, e.g. a grid of buttons, please select a binning mode. The layout of these areas is defined in the "Poll Layouts" tab.

## Build

Remember to specify the environment when building and deploying the Vite projects (`development`, `staging`, `production`).

    npm run build -- --mode=development
    firebase use development

## [Viewer embed](viewer-embed)

```json
{
  "url": "http://localhost:5173/",
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

## [Admin embed](admin-embed)

Ideally, this would not be an embed, but perhaps accessible via the creator website?

```json
{
  "url": "http://localhost:5174/",
  "authToken": "AUTH_TOKEN",
  "parentQuerySelector": "#above-the-fold",
  "contentPageType": "youtube",
  "defaultStyles": {
    "height": "428px",
    "width": "100%"
  }
}
```

## [Poll results](results-visualizer)

Result are shown on a separate page, which connects to the Realtime Database. Note that at least 10 votes are needed in order to see something, as otherwise the k-means algorithm used produces trash. You can either access the visualization via a permalink to a specific poll

    https://truffle-demos.firebaseapp.com/pollResults?pollId=YOUR_POLL_ID

or open

    https://truffle-demos.firebaseapp.com/latestPollResults?orgId=YOUR_ORG_ID

which redirects to the latest poll of the specified org.

# Backend

Business logic, databases and hosting are handled with Firebase. A Realtime Database stores the poll entries and Firestore saves what polls exists and which are currently active. Hosting is needed to serve the page showing the poll results, which can be added as a browser source in OBS.

# Simulate entries

To create mock database entries (votes) for debugging, check out [simulate-votes](simulate-votes).
