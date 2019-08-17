import * as React from "react";
import * as SDK from "azure-devops-extension-sdk";
import * as moment from "moment";

import { CommonServiceIds, getClient, IProjectPageService, IProjectInfo } from "azure-devops-extension-api";
import { WorkRestClient, TeamFieldValues } from "azure-devops-extension-api/Work";
import { WorkItemTrackingRestClient, Wiql, WorkItem } from "azure-devops-extension-api/WorkItemTracking";
import { TeamContext } from "azure-devops-extension-api/Core";

import { ListSelection } from "azure-devops-ui/List";

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
            selection: new ListSelection()
        };
    }

    public componentWillMount() {
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
        }
    }

    public render(): JSX.Element {

        return (
            <div className="sample-hub-section">
                <TeamSelector project={this.state.projectInfo} onSelect={(team : Team) => this.onSelectTeam(team)} />
                <h2>Sprint Ending</h2>
                <WorkItemGrid items={this.state.workItems} />

                <h2>Stories Added to Sprint after Commitment</h2>

                <h2>Stories Removed from Sprint after Commitment</h2>
            </div>
        );
    }

    private async onSelectTeam(team : Team) {
        console.debug("Overview: onSelectTeam");
        console.debug(team);
        console.debug(this.state.projectInfo);
        if (!team) return;
        if (!this.state.projectInfo) return;
        let project = this.state.projectInfo;

        let teamContext : TeamContext = { 
            projectId: project.id,
            project: '',
            teamId: team.id,
            team: ''
        };

        let iterationService = getClient(WorkRestClient);
        let currentIteration = await iterationService.getTeamIterations(teamContext, "Current");
        let allIterations = await iterationService.getTeamIterations(teamContext);
        console.debug("currentIteration:");
        console.debug(currentIteration);
        console.debug("all iterations");
        console.debug(allIterations);

        let teamFieldValues = await iterationService.getTeamFieldValues(teamContext);
        console.debug(teamFieldValues);

        const client = getClient(WorkItemTrackingRestClient);
        let endOfFirstDateOfSprint = moment('2019-07-27 23:59');
        let wiqlString : Wiql = { query: `SELECT [System.Id] FROM workitems WHERE [System.TeamProject] = '${project.name}' AND [System.AreaPath] = '${teamFieldValues.defaultValue}' AND [System.WorkItemType] = 'User Story' AND [System.IterationPath] = '${this.state.iterationPath}' ASOF '${endOfFirstDateOfSprint.format('M/D/Y HH:mm')}'` };
        const idResults = await client.queryByWiql(wiqlString, project.name);
        console.debug("id results: ");
        console.debug(idResults);

        if (idResults.workItems.length == 0) {
            this.setState({ workItems: [] });
            return;
        }

        const columns = ['System.Title','System.State','System.CreatedDate'];
        const results = await client.getWorkItems(idResults.workItems.map(x => x.id), project.name, columns);

        this.setState({ workItems: results });
    }
}