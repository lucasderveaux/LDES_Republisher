import * as core from '@actions/core';

export interface IConfig {
	url: string; // HTTP(S) data source
	storage: string; // directory where data will be written
	gh_pages_branch: string; // branch used for deploying to GitHub Pages
	gh_pages_url: string; // URL of the GitHub Pages deployment
	git_username: string; // GitHub username that makes the commits
	git_email: string; // GitHub email that makes the commits
	literal_values:string;
	gh_repository: string;
	url_feature_of_interest:string;
	url_timestamp: string;
}

export function getConfig(): IConfig {
	return {
		url: core.getInput('url'),
		storage: core.getInput('storage'),
		gh_pages_branch: core.getInput('gh_pages_branch'),
		gh_pages_url: core.getInput('gh_pages_url'),
		git_username: core.getInput('git_username'),
		git_email: core.getInput('git_email'),
		literal_values: core.getInput('literal_values'),
		url_feature_of_interest: core.getInput('url_feature_of_interest'),
		url_timestamp:core.getInput('url_timestamp'),
		gh_repository:core.getInput('gh_repository')
	};
}
