import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { Context } from '@actions/github/lib/context';
import { getInput } from '@actions/core' ;
import { Utils, ContextHelper } from '@technote-space/github-action-helper';
import { ReplaceResult } from 'replace-in-file';

const {isSemanticVersioningTagName, getBoolValue, getPrefixRegExp} = Utils;

const normalizeVersion = (version: string): string => version.replace(/^v/, '');

export const getBranchPrefix = (): string => getInput('BRANCH_PREFIX');

const getBranchPrefixRegExp = (): RegExp => getPrefixRegExp(getBranchPrefix());

const getVersionFromBranch = (branch: string): string => branch.replace(getBranchPrefixRegExp(), '');

export const isValidBranch = (branch: string): boolean => !!getBranchPrefix() && getBranchPrefixRegExp().test(branch) && isSemanticVersioningTagName(getVersionFromBranch(branch));

export const getTestTagPrefix = (): string => getInput('TEST_TAG_PREFIX');

const getTestTagPrefixRegExp = (): RegExp => getPrefixRegExp(getTestTagPrefix());

export const isTestTag = (tagName: string): boolean => !!getTestTagPrefix() && getTestTagPrefixRegExp().test(tagName);

export const getTestTag = (tagName: string): string => tagName.replace(getTestTagPrefixRegExp(), '');

export const getPackageVersionToUpdate = (tagName: string): string => normalizeVersion(isTestTag(tagName) ? getTestTag(tagName) : tagName);

export const isValidTagName = (tagName: string): boolean => isSemanticVersioningTagName(getPackageVersionToUpdate(tagName));

export const getReplaceResultMessages = (results: ReplaceResult[]): string[] => results.map(result => `${result.hasChanged ? '✔' : '✖'} ${result.file}`);

export const getCommitMessage = (): string => getInput('COMMIT_MESSAGE', {required: true});

export const isCommitDisabled = (): boolean => getBoolValue(getInput('COMMIT_DISABLED'));

export const getDefaultBranch = (context: Context): string | undefined => context.payload.repository ? context.payload.repository.default_branch : undefined;

export const getBranch = (context: Context): string => ContextHelper.isPr(context) ? Utils.getPrBranch(context) : Utils.getBranch(context);

export const getNextVersion = (): string => {
	const version = getInput('NEXT_VERSION');
	if (isValidTagName(version)) {
		return version;
	}

	return '';
};

export const isSpecifiedNextVersion = (): boolean => !!getNextVersion();

export const getTagName = (context: Context): string => {
	const nextVersion = getNextVersion();
	if (nextVersion) {
		return nextVersion;
	}

	const tagName = ContextHelper.getTagName(context);
	if (tagName) {
		return tagName;
	}

	return getVersionFromBranch(getBranch(context));
};

export const isValidTagNameContext = (context: Context): boolean => isValidTagName(ContextHelper.getTagName(context));

export const isValidBranchContext = (context: Context): boolean => isValidBranch(getBranch(context));

export const isValidContext = (context: Context): boolean => isSpecifiedNextVersion() || isValidTagNameContext(context) || isValidBranchContext(context);

export const findAutoloadFile = (workDir: string): string | never => {
	const result = readdirSync(workDir, {withFileTypes: true})
		.filter(dirent => dirent.isFile() && /\.php$/.test(dirent.name))
		.map(({name}) => join(workDir, name))
		.find(path => /Version\s*:\s*v?\d+(\.\d+)*$/m.test(readFileSync(path, {encoding: 'utf-8'})));
	if (!result) {
		throw new Error('Autoload file not found.');
	}

	return result.replace(getPrefixRegExp(workDir), '').replace(/^\//, '');
};
