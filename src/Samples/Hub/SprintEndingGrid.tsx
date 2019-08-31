import * as React from "react";

import { IProjectInfo, getClient } from "azure-devops-extension-api";
import { Iteration } from "./IterationSelector";
import { Team } from "./TeamSelector";
import { TeamContext } from "azure-devops-extension-api/Core";
import { WorkRestClient } from "azure-devops-extension-api/Work";
import { WorkItemTrackingRestClient, Wiql, WorkItem } from "azure-devops-extension-api/WorkItemTracking";
import { WorkItemGrid } from "./WorkItemGrid";

export interface SprintEndingGridState {
    workItems: WorkItem[];
}

export interface SprintEndingGridProps {
    project: IProjectInfo | undefined;
    iteration: Iteration | undefined;
    team: Team | undefined;
}

export class SprintEndingGrid extends React.Component<SprintEndingGridProps, SprintEndingGridState> {
    private project? : IProjectInfo;
    private iteration? : Iteration;
    private team? : Team;

    constructor(props: SprintEndingGridProps) {
        super(props);

        this.project = props.project;
        this.iteration = props.iteration;
        this.team = props.team;

        this.state = {
            workItems: []
        };
    }

    public componentDidMount() {
        this.initializeState();
    }

    public componentWillReceiveProps(props : SprintEndingGridProps) {
        console.debug("SprintEndingGrid: componentWillReceiveProps");
        console.debug(props);
        if (props.iteration && props.project && props.team && (
            props.iteration != this.iteration ||
            props.project != this.project ||
            props.team != this.team
        )) {
            this.iteration = props.iteration
            this.project = props.project;
            this.team= props.team;
            this.initializeState();
        }
    }

    render() : JSX.Element {
        return (
            <WorkItemGrid items={this.state.workItems} />
        );
    }

    private async initializeState() {
        console.debug("SprintEnding: initializeState");
        let project = this.project;
        let team = this.team;
        let iteration = this.iteration;
        console.debug({ project, team, iteration });
        if (!project || !team || !iteration) return;

        console.debug("SprintEnding: initializeState with project and team");
        let teamContext : TeamContext = { 
            projectId: project.id,
            project: '',
            teamId: team.id,
            team: ''
        };
        console.debug(teamContext);

        let workService = getClient(WorkRestClient);
        let teamFieldValues = await workService.getTeamFieldValues(teamContext);
        console.debug("SprintEnding: fetched teamFieldValues")
        console.debug(teamFieldValues);

        const client = getClient(WorkItemTrackingRestClient);
        let wiqlString : Wiql = { query: `SELECT [System.Id] FROM workitems WHERE [System.TeamProject] = '${project.name}' AND [System.AreaPath] = '${teamFieldValues.defaultValue}' AND [System.WorkItemType] = 'User Story' AND [System.IterationPath] = '${iteration.path}' ASOF '${iteration.endDate.format('M/D/Y HH:mm')}'` };
        const idResults = await client.queryByWiql(wiqlString, project.name);
        console.debug("id results: ");
        console.debug(idResults);

        if (idResults.workItems.length == 0) {
            console.debug("No work items. Setting empty.");
            this.setState({ workItems: [] });
            return;
        }

        const columns = ['System.Title','System.State','System.CreatedDate'];
        const results = await client.getWorkItems(idResults.workItems.map(x => x.id), project.name, columns);

        this.setState({ workItems: results });
    }
}