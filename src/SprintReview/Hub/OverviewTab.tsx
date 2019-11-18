import * as React from "react";
import * as SDK from "azure-devops-extension-sdk";

import { CommonServiceIds, IProjectPageService, IProjectInfo } from "azure-devops-extension-api";
import { WorkItem } from "azure-devops-extension-api/WorkItemTracking";

import { ListSelection } from "azure-devops-ui/List";

import { TeamSelector, Team } from "./TeamSelector";
import { IterationSelector, Iteration } from "./IterationSelector";
import { StoriesAddedAfterSprintCommitmentGrid } from "./StoriesAddedAfterSprintCommitmentGrid";
import { SprintEndingGrid } from "./SprintEndingGrid";
import { StoriesRemovedAfterSprintCommitmentGrid } from "./StoriesRemovedAfterSprintCommitmentGrid";

export interface IOverviewTabState {
    projectName?: string;
    extensionData?: string;
    selection: ListSelection;
    workItems: WorkItem[];
    workItemsAddedAfterSprintStart: WorkItem[];
    workItemsRemovedAfterSprintStart: WorkItem[];
    projectInfo?: IProjectInfo;
    iteration?: Iteration;
    team?: Team;
}

export class OverviewTab extends React.Component<{}, IOverviewTabState> {
    constructor(props: {}) {
        super(props);

        this.state = {
            workItems: [],
            workItemsAddedAfterSprintStart: [],
            workItemsRemovedAfterSprintStart: [],
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
            let projectInfo : IProjectInfo = project;
            this.setState({ projectName: projectInfo.name, projectInfo: projectInfo });
        }
    }

    public render(): JSX.Element {

        return (
            <div className="sample-hub-section">
                <div className="flex-row">
                    <TeamSelector project={this.state.projectInfo} onSelect={(team : Team) => this.onSelectTeam(team)} />
                    <IterationSelector project={this.state.projectInfo} team={this.state.team} onSelect={(iteration : Iteration) => this.onSelectIteration(iteration)} />
                </div>
                <h2>Sprint Ending</h2>
                <SprintEndingGrid project={this.state.projectInfo} iteration={this.state.iteration} team={this.state.team} />

                <h2>Stories Added to Sprint after Commitment</h2>
                <StoriesAddedAfterSprintCommitmentGrid project={this.state.projectInfo} iteration={this.state.iteration} team={this.state.team} />

                <h2>Stories Removed from Sprint after Commitment</h2>
                <StoriesRemovedAfterSprintCommitmentGrid project={this.state.projectInfo} iteration={this.state.iteration} team={this.state.team} />
            </div>
        );
    }

    private async onSelectTeam(team : Team) {
        console.debug("Overview: onSelectTeam");
        if (!team) return;
        this.setState({ team: team });
    }

    private async onSelectIteration(iteration : Iteration) {
        console.debug("Overview: onSelectIteration");
        if (!iteration) return;
        this.setState({ iteration: iteration });
    }
}