import * as core from '@actions/core';

export interface IConfig {
	url: string; // HTTP(S) data source
	storage: string; // directory where data will be written
	gh_pages_branch: string; // branch used for deploying to GitHub Pages
	gh_pages_url: string; // URL of the GitHub Pages deployment
	git_username: string; // GitHub username that makes the commits
	git_email: string; // GitHub email that makes the commits
	literal_values:string[]; // list that contains the predicates of the types of the observations within the given LDES
	gh_repository: string; // Github Repository
	uri_feature_of_interest:string; // the uri of the predicate that defines the feature of interest
	uri_timestamp: string; // the uri of the predicate that defines the timestamp of the observation
	number_of_observations: number; // the desired number of the observations if dimensionality reduction needs to be executed
}

export function getConfig(): IConfig {
	return {
		url: core.getInput('url'),
		storage: core.getInput('storage'),
		gh_pages_branch: core.getInput('gh_pages_branch'),
		gh_pages_url: core.getInput('gh_pages_url'),
		git_username: core.getInput('git_username'),
		git_email: core.getInput('git_email'),
		literal_values: JSON.parse(core.getInput('literal_values')),
		uri_feature_of_interest: core.getInput('uri_feature_of_interest'),
		uri_timestamp:core.getInput('uri_timestamp'),
		gh_repository:core.getInput('gh_repository'),
		number_of_observations:parseInt(core.getInput('number_of_observations'))
	};
}
