/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from 'vscode';
import { GitExtension } from './git';
import { Client } from '@notionhq/client';
import { isSameHour } from "date-fns";
require('dotenv').config();

export const notion = new Client({
	auth: process.env.NOTION_TOKEN!
});

const gitFunctions = async() => {
	const gitBaseExtension = vscode.extensions.getExtension<GitExtension>('vscode.git')!.exports;
	const git = gitBaseExtension.getAPI(1);
	
	const repo = git.repositories[0];
	const head = repo.state.HEAD;

	// Get the branch and commit 
	const commit = head?.commit;
	// Get head of any other branch
	const lastCommit = (await repo.getCommit(commit ? commit : ""));
	const aux: any = await notion.databases.query({
		database_id: process.env.NOTION_DATABASE_ID!
	});

	if(isSameHour(new Date(lastCommit.authorDate!), new Date(Date.now()))){
		if(aux.results[0].properties.git_commit.rich_text[0].plain_text === lastCommit.message){
			await notion.pages.update({
				page_id: aux.results[0].id,
				properties: {
					Status: {
						status: {
							color: "green",
							id: "78382035-451a-46b9-9567-67bd9b802210",
							name: "Done"
						}
					}
				}
			});
		}
	}
};

// This method is called when your extension is activated
export function activate(context: vscode.ExtensionContext){
	gitFunctions();
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('autocompletednotion.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from AutoCompletedNotion!');
	});

	context.subscriptions.push(disposable);
};

// This method is called when your extension is deactivated
export function deactivate() {}
