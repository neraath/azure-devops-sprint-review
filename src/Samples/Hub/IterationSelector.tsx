import * as React from "react";

import { ListSelection } from "azure-devops-ui/List";
import { CoreRestClient, TeamContext } from "azure-devops-extension-api/Core";
import { getClient, IProjectInfo } from "azure-devops-extension-api";
import { Dropdown } from "azure-devops-ui/Dropdown";
import { IListBoxItem } from "azure-devops-ui/ListBox";
import { WorkRestClient } from "azure-devops-extension-api/Work";
import { Team } from "./TeamSelector";
import { Moment } from "moment";
import moment = require("moment");

export interface IIterationSelectorState {
    projectInfo?: IProjectInfo;
    team?: Team;
    selection: ListSelection;
    iterations: Iteration[];
};

export class Iteration {
    id: string;
    name: string;
    text: string;
    path: string;
    startDate: Moment;
    endDate: Moment;

    constructor(id: string, name: string, path: string, startDate: Moment, endDate: Moment) {
        this.id = id;
        this.name = name;
        this.text = name;
        this.path = path;
        this.startDate = startDate;
        this.endDate = endDate;
    }
}

export interface IterationSelectorProps {
    project: IProjectInfo | undefined;
    team: Team | undefined;
    onSelect : (iteration: Iteration) => void;
}

export class IterationSelector extends React.Component<IterationSelectorProps, IIterationSelectorState> {
    private onSelect : (iteration: Iteration) => void;

    constructor(props: IterationSelectorProps) {
        super(props);

        console.debug("CONSTRUCTOR");
        console.debug(props.project);

        this.onSelect = props.onSelect;

        this.state = {
            projectInfo: props.project,
            team: props.team,
            iterations: [],
            selection: new ListSelection()
        };
    }

    public componentDidMount() {
        console.debug("IterationSelector: componentDidMount");
        if (this.state.projectInfo && this.state.team) {
            this.initializeState(this.state.projectInfo, this.state.team);
        }
    }

    public componentWillReceiveProps(nextProps : IterationSelectorProps) {
        console.debug("IterationSelector: componentWillReceiveProps");
        console.debug(nextProps);

        // Props may get resent from parent. Don't need to re-initialize state if the project is the same.
        if (nextProps.project && nextProps.team && (
            nextProps.project !== this.state.projectInfo ||
            nextProps.team !== this.state.team)) {
            console.debug("Project or team differ. Initialize state.");
            this.initializeState(nextProps.project, nextProps.team);
        }
    }

    private async initializeState(projectInfo : IProjectInfo, team: Team): Promise<void> {
        console.debug("IterationSelector: initializeState");
        console.debug(projectInfo);
        console.debug(team);

        console.debug("IterationSelector: initializeState with projectInfo");
        let teamContext : TeamContext = { 
            projectId: projectInfo.id,
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

        this.setState({ 
            projectInfo: projectInfo, 
            team: team, 
            iterations: allIterations.map((iteration) => 
                new Iteration(iteration.id, iteration.name, iteration.path, moment(iteration.attributes.startDate), moment(iteration.attributes.finishDate))) });
        let currentIterationId = 0;
        if (currentIteration.length > 0) {
            let currentIterationFromResults = this.state.iterations.find(x => x.id == currentIteration[0].id);
            if (currentIterationFromResults) {
                currentIterationId = this.state.iterations.indexOf(currentIterationFromResults);
            }
        }
        this.state.selection.select(currentIterationId); // Start by selecting the current iteration. TODO: Save last selected team.
        this.onSelect(this.state.iterations[currentIterationId]);
    }

    public render(): JSX.Element {
        return (
            <Dropdown<Iteration>
                className="sample-picker"
                items={this.state.iterations}
                onSelect={this.onTeamChanged}
                selection={this.state.selection}
            />
        );
    }

    private onTeamChanged = (event: React.SyntheticEvent<HTMLElement>, item: IListBoxItem<Iteration>) => {
        console.log("Iteration changed to " + item.id);
        // Lookup the iteration since item.data is undefined
        let iteration = this.state.iterations.find(x => x.id === item.id);
        if (iteration) {
            console.debug("Passing iteration to subscribers");
            this.onSelect(iteration);
        }
    }
}