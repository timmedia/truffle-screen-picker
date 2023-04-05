# Simulate votes

This script bypasses cloud functions to write votes directly into the database. Therefore, (temporarily) adjust the rules to:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

The script is used with:

    npx ts-node index.ts pollId=fd68e082-0fcb-4c21-a971-cab717b1d51e n=200 distribution=clustered nClusters=5
