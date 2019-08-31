import * as React from "react";

import { IProjectInfo, getClient } from "azure-devops-extension-api";
import { Iteration } from "./IterationSelector";
import { Team } from "./TeamSelector";
import { TeamContext } from "azure-devops-extension-api/Core";
import { WorkRestClient } from "azure-devops-extension-api/Work";
import { WorkItemTrackingRestClient, Wiql, WorkItem } from "azure-devops-extension-api/WorkItemTracking";
import { WorkItemGrid } from "./WorkItemGrid";

export interface SprintReviewGridBaseState {
    workItems: WorkItem[];
}

export interface SprintReviewGridBaseProps {
    project: IProjectInfo | undefined;
    iteration: Iteration | undefined;
    team: Team | undefined;
}

export abstract class SprintReviewGridBase extends React.Component<SprintReviewGridBaseProps, SprintReviewGridBaseState> {
    protected project? : IProjectInfo;
    protected iteration? : Iteration;
    protected team? : Team;

    constructor(props: SprintReviewGridBaseProps) {
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

    /** 
     * Override this to define the different query you want represented.
    */
   protected abstract getWiqlQuery(project : IProjectInfo, iteration : Iteration, areaPath : string) : Wiql;

    public componentWillReceiveProps(props : SprintReviewGridBaseProps) {
        console.debug("SprintReviewGridBase: componentWillReceiveProps");
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
        console.debug("SprintReviewGridBase: initializeState");
        let project = this.project;
        let team = this.team;
        let iteration = this.iteration;
        console.debug({ project, team, iteration });
        if (!project || !team || !iteration) return;

        console.debug("SprintReviewGridBase: initializeState with project and team");
        let teamContext : TeamContext = { 
            projectId: project.id,
            project: '',
            teamId: team.id,
            team: ''
        };
        console.debug(teamContext);

        let workService = getClient(WorkRestClient);
        let teamFieldValues = await workService.getTeamFieldValues(teamContext);
        console.debug("SprintReviewGridBase: fetched teamFieldValues")
        console.debug(teamFieldValues);

        const client = getClient(WorkItemTrackingRestClient);
        const idResults = await client.queryByWiql(this.getWiqlQuery(project, iteration, teamFieldValues.defaultValue), project.name);
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