# LDES_Republisher

`LDES_Republisher` is Github Action that reads in a [Linked Data Event Stream](https://w3id.org/ldes/specification) and converts it into a new [Linked Data Event Stream](https://w3id.org/ldes/specification) suitable for interdepency research between time series and republishes it on Github Pages.

A time series is a collection of observations that are repeatedly measured of time and arranged chronologically.

## Usage

Create a yaml file in the `.github/workflows/` directory in the repository where you want to fetch data. An example:

```yaml
name: crowdscan

on:
  # - on push to branch 'main'
  push:
    branches:
      - main

jobs:
  Crowdscan:
    # The type of runner that the job will run on
    runs-on: ubuntu-latest
    # Steps represent a sequence of tasks that will be executed as part of the job
    steps:
      # Checks-out your repository under $GITHUB_WORKSPACE, so your job can access it
      - uses: actions/checkout@v3
      # Runs a single command using the runners shell
      - name: Fetch and write data crowdscan
        uses: lucasderveaux/LDES_Republisher@main
        with:
          url: "https://production.crowdscan.be/feed/public/gent_langemunt/v1/1"
          storage: CS
          literal_values: '["http://www.w3.org/ns/sosa/hasSimpleResult"]'
          uri_timestamp: 'http://www.w3.org/ns/sosa/resultTime'
          uri_feature_of_interest: 'http://www.w3.org/ns/sosa/hasFeatureOfInterest'
          number_of_observations: '24'

```

In order for the LDES_Republisher to work correctly the second yaml file needs to be added:
```yaml
name: GitHub Pages

on:
  workflow_run:
    workflows: [Crowdscan]
    types: [failed, completed]

jobs:
  deploy:
    runs-on: ubuntu-20.04
    concurrency:
      group: ${{ github.workflow }}-${{ github.ref }}
    steps:
      - uses: actions/checkout@v3
        with:
          submodules: true  # Fetch Hugo themes (true OR recursive)
          fetch-depth: 0    # Fetch all history for .GitInfo and .Lastmod
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        if: ${{ github.ref == 'refs/heads/main' }}
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./public

```
Notice that the Github Pages action starts when the previous Github action is finished. This is made possible by the event that triggers the workflow.

If multiple Linked Data Event Streams need to be happen those workflows need to be executed chronologically by adding the right events. Meaning:
```
on:
  workflow_run:
    workflows: [Crowdscan]
    types: [failed, completed]
````


The `LDES_Republisher` action will perform the following operations:
1. fetch data from the provided `url`
2. extract the right data from the `literal_values`, `uri_timestamp`, `uri_feature_of_interest` and potentially `number_of_observations`
3. split and store the fetched data across turtle files in the `storage` directory
4. commit and push all of the data to your repo
5. push all the data to the `gh-pages` branch
6. deploy the data to GitHub Pages on branch `gh-pages`.

## Inputs

### `url`

URL to a LDES or tree:Collection dataset from which you want to fetch data. The given LDES needs to contain time series with their observations in order for the LDES_Republisher to work.

### `storage`

Name of the output directory where the fetched data will be stored.

### `literal_values`
Contains a string of a list of the URIs of the predicates of the different kind of observations that can be found within the given LDES

### `uri_timestamp`
The URI of the predicate that defines the timestamp of the observation.

### `uri_feature_of_interest`
A list of the URIs fo the predicates of the different kind of observations that can be found within the given LDES.

### `number_of_observations` (optional)
The number of observations that will be in the regular time series in the created LDES. It's only possible to use the number of observations for dimensionality reduction. If the number of the observations given as a parameter is larger than the actual observations in the time series of the given LDES nothing will happen.

## Output
For a certain type of observation a Linked Data Event Stream is grouped by day and by feature of interest.
