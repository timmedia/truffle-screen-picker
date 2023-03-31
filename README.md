# Screen Picker Package

Truffle package enabling polling by letting viewers select a point on screen. Currently, there are two separate embeds: The viewer embed facilitates the actual poll (overlay on video) and the admin embed controls creating/managing the polls. The overlay runs on port `5173` by default and the admin embed on `5174`. Below are the corresponding dev embed configs. An authentication token is needed in both cases, to manage permissions and ensure each user can only vote once.

### [Viewer embed](viewer-embed)

```json
{
  "url": "http://localhost:5173/",
  "authToken": "AUTH_TOKEN",
  "parentQuerySelector": "#player",
  "contentPageType": "youtube",
  "defaultStyles": {
    "height": "300px",
    "width": "100%"
  }
}
```

### [Admin embed](admin-embed)

Ideally, this would not be an embed, but perhaps accessible via the creator website?

```json
{
  "url": "http://localhost:5174/",
  "authToken": "AUTH_TOKEN",
  "parentQuerySelector": "#above-the-fold",
  "contentPageType": "youtube",
  "defaultStyles": {
    "height": "400px",
    "width": "100%"
  }
}
```

# Backend

Business logic, databases and hosting is handled with Firebase. A realtime database stores the poll entries and firestore knows what polls exists and which are currently active. Hosting is needed to serve the page showing the poll results and can be added as a browser source.
