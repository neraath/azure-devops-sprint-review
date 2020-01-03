import * as React from "react";
import * as SDK from "azure-devops-extension-sdk";

import { ListSelection } from "azure-devops-ui/List";
import { CoreRestClient, TeamContext } from "azure-devops-extension-api/Core";
import { getClient, IProjectInfo, IExtensionDataService, CommonServiceIds, IExtensionDataManager } from "azure-devops-extension-api";
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
    startDate: Date;
    endDate: Date;

    constructor(id: string, name: string, path: string, startDate: Date, endDate: Date) {
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
    private readonly IterationExtensionId = "selected-iteration";
    private onSelect : (iteration: Iteration) => void;
    private _dataManager?: IExtensionDataManager;

    constructor(props: IterationSelectorProps) {
        super(props);

        this.onSelect = props.onSelect;

        this.state = {
            projectInfo: props.project,
            team: props.team,
            iterations: [],
            selection: new ListSelection({ selectOnFocus: false, multiSelect: false })
        };
    }

    public componentDidMount() {
        if (this.state.projectInfo && this.state.team) {
            this.initializeState(this.state.projectInfo, this.state.team);
        }
    }

    public componentWillReceiveProps(nextProps : IterationSelectorProps) {
        // Props may get resent from parent. Don't need to re-initialize state if the project is the same.
        if (nextProps.project && nextProps.team && (
            nextProps.project !== this.state.projectInfo ||
            nextProps.team !== this.state.team)) {
            this.initializeState(nextProps.project, nextProps.team);
        }
    }

    private async initializeState(projectInfo : IProjectInfo, team: Team): Promise<void> {
        let teamContext : TeamContext = { 
            projectId: projectInfo.id,
            project: '',
            teamId: team.id,
            team: ''
        };
        
        let iterationService = getClient(WorkRestClient);
        let allIterations = await iterationService.getTeamIterations(teamContext);

        this.setState({ 
            projectInfo: projectInfo, 
            team: team, 
            iterations: allIterations.map((iteration) => 
                new Iteration(iteration.id, iteration.name, iteration.path, iteration.attributes.startDate, iteration.attributes.finishDate)) });

        const accessToken = await SDK.getAccessToken();
        const extDataService = await SDK.getService<IExtensionDataService>(CommonServiceIds.ExtensionDataService);
        this._dataManager = await extDataService.getExtensionDataManager(SDK.getExtensionContext().id, accessToken);

        this._dataManager.getValue<Iteration>(this.IterationExtensionId).then((data) => {
            console.debug("IterationSelector: Checking for previous iteration selected");
            console.debug(data);
            if (data) {
                let indexOfIteration = this.state.iterations.findIndex(x => x.id == data.id);
                if (indexOfIteration >= 0) {
                    this.state.selection.select(indexOfIteration);
                    this.onSelect(data);
                } else {
                    this.selectCurrentIteration(iterationService, teamContext);
                }
            } else {
                this.selectCurrentIteration(iterationService, teamContext);
            }
        }, () => {
            this.selectCurrentIteration(iterationService, teamContext);
        });
        
    }

    private async selectCurrentIteration(iterationService : WorkRestClient, teamContext : TeamContext) {
        console.debug('selecting CURRENT iteration');
        let currentIteration = await iterationService.getTeamIterations(teamContext, "Current");

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
                placeholder="Loading..."
                items={this.state.iterations}
                onSelect={this.onIterationChanged}
                selection={this.state.selection}
            />
        );
    }

    private onIterationChanged = (event: React.SyntheticEvent<HTMLElement>, item: IListBoxItem<Iteration>) => {
        console.log("Iteration changed to " + item.id);
        // Lookup the iteration since item.data is undefined
        let iteration = this.state.iterations.find(x => x.id === item.id);
        console.debug(iteration);
        if (iteration) {
            this._dataManager!.setValue<Iteration>(this.IterationExtensionId, iteration).then(() => {
                if (iteration) {
                    this.onSelect(iteration);
                }
            });
        }
    }
}