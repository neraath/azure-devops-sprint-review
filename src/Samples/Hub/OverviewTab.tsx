import * as React from "react";
import * as SDK from "azure-devops-extension-sdk";
import * as moment from "moment";

import { CommonServiceIds, getClient, IProjectPageService, IProjectInfo } from "azure-devops-extension-api";
import { WorkRestClient } from "azure-devops-extension-api/Work";
import { WorkItemTrackingRestClient, Wiql, WorkItem, WorkItemExpand } from "azure-devops-extension-api/WorkItemTracking";
import { CoreRestClient, WebApiTeam, TeamContext } from "azure-devops-extension-api/Core";

import { Dropdown } from "azure-devops-ui/Dropdown";
import { ListSelection } from "azure-devops-ui/List";
import { IListBoxItem } from "azure-devops-ui/ListBox";

import { WorkItemGrid } from "./WorkItemGrid";
import { TeamSelector, Team } from "./TeamSelector";

export interface IOverviewTabState {
    projectName?: string;
    iterationPath?: string;
    areaPath?: string;
    extensionData?: string;
    selection: ListSelection;
    workItems: WorkItem[];
    workItemsAddedAfterSprintStart: WorkItem[];
    workItemsRemovedAfterSprintStart: WorkItem[];
    teams: WebApiTeam[];
    projectInfo?: IProjectInfo;
}

export class OverviewTab extends React.Component<{}, IOverviewTabState> {
    constructor(props: {}) {
        super(props);

        this.state = {
            iterationPath: "Azure DevOps Sprint Review\\Iteration 1",
            areaPath: "Azure DevOps Sprint Review\\Core",
            workItems: [],
            workItemsAddedAfterSprintStart: [],
            workItemsRemovedAfterSprintStart: [],
            teams: [],
            selection: new ListSelection()
        };
    }

    public componentDidMount() {
        this.initializeState();
    }

    private async initializeState(): Promise<void> {
        await SDK.ready();

        const projectService = await SDK.getService<IProjectPageService>(CommonServiceIds.ProjectPageService);
        const project = await projectService.getProject();

        console.debug("Overview: initializeState");
        if (project) {
            console.debug("Overview: initializeState with projectInfo");
            let projectInfo : IProjectInfo = project;
            this.setState({ projectName: projectInfo.name, projectInfo: projectInfo });

            const coreService = getClient(CoreRestClient);
            let teamResults = await coreService.getTeams(project.id);
            this.setState({ teams: teamResults });
            this.state.selection.select(0);

            let teamContext : TeamContext = { 
                projectId: project.id,
                project: '',
                teamId: teamResults[0].id,
                team: ''
            };

            let iterationService = getClient(WorkRestClient);
            let currentIteration = await iterationService.getTeamIterations(teamContext, "Current");
            let allIterations = await iterationService.getTeamIterations(teamContext);
            console.debug("currentIteration:");
            console.debug(currentIteration);
            console.debug("all iterations");
            console.debug(allIterations);

            const client = getClient(WorkItemTrackingRestClient);
            let endOfFirstDateOfSprint = moment('2019-07-27 23:59');
            let wiqlString : Wiql = { query: `SELECT [System.Id] FROM workitems WHERE [System.TeamProject] = '${project.name}' AND [System.AreaPath] = '${this.state.areaPath}' AND [System.WorkItemType] = 'User Story' AND [System.IterationPath] = '${this.state.iterationPath}' ASOF '${endOfFirstDateOfSprint.format('M/D/Y HH:mm')}'` };
            const idResults = await client.queryByWiql(wiqlString, project.name);
            console.debug("id results: ");
            console.debug(idResults);

            if (idResults.workItems.length == 0) return;

            const columns = ['System.Title','System.State','System.CreatedDate'];
            const results = await client.getWorkItems(idResults.workItems.map(x => x.id), project.name, columns);

            this.setState({ workItems: results });

            //console.debug("Results Obtained: ");
            //console.debug(results);
        }
    }

    public render(): JSX.Element {

        return (
            <div className="sample-hub-section">
                <TeamSelector project={this.state.projectInfo} onSelect={(team : Team) => alert("team selected: " + team.name)} />
                <h2>Sprint Ending</h2>
                <WorkItemGrid items={this.state.workItems} />

                <h2>Stories Added to Sprint after Commitment</h2>

                <h2>Stories Removed from Sprint after Commitment</h2>
            </div>
        );
    }
}