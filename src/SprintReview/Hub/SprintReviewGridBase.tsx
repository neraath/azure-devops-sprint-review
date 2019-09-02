import * as React from "react";

import { IProjectInfo, getClient } from "azure-devops-extension-api";
import { Iteration } from "./IterationSelector";
import { Team } from "./TeamSelector";
import { TeamContext } from "azure-devops-extension-api/Core";
import { WorkRestClient } from "azure-devops-extension-api/Work";
import { WorkItemTrackingRestClient, Wiql, WorkItem } from "azure-devops-extension-api/WorkItemTracking";
import { WorkItemGrid } from "./WorkItemGrid";
import { IterationQueryService } from "./IterationQueryService";

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
    protected queryService : IterationQueryService;

    constructor(props: SprintReviewGridBaseProps) {
        super(props);

        this.project = props.project;
        this.iteration = props.iteration;
        this.team = props.team;
        this.queryService = new IterationQueryService();

        this.state = {
            workItems: []
        };
    }

    public componentDidMount() {
        this.initializeState();
    }

    /** 
     * Override this to define how to fetch the work items you want represented in the grid.
    */
   protected abstract async getWorkItems(project : IProjectInfo, team : Team, iteration : Iteration) : Promise<WorkItem[]>;

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
        let results = await this.getWorkItems(project, team, iteration);
        this.setState({ workItems: results });
    }
}