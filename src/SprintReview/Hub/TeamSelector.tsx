import * as React from "react";
import * as SDK from "azure-devops-extension-sdk";

import { ListSelection } from "azure-devops-ui/List";
import { CoreRestClient } from "azure-devops-extension-api/Core";
import { getClient, IProjectInfo, IExtensionDataManager, IExtensionDataService, CommonServiceIds } from "azure-devops-extension-api";
import { Dropdown } from "azure-devops-ui/Dropdown";
import { IListBoxItem } from "azure-devops-ui/ListBox";

export interface ITeamSelectorState {
    projectInfo?: IProjectInfo;
    selection: ListSelection;
    teams: Team[];
};

export class Team {
    id: string;
    name: string;
    text: string;

    constructor(id: string, name: string) {
        this.id = id;
        this.name = name;
        this.text = name;
    }
}

export interface TeamSelectorProps {
    project: IProjectInfo | undefined;
    onSelect : (team: Team) => void;
}

export class TeamSelector extends React.Component<TeamSelectorProps, ITeamSelectorState> {
    private readonly TeamExtensionId = "selected-team";
    private onSelect : (team: Team) => void;
    private _dataManager?: IExtensionDataManager;

    constructor(props: TeamSelectorProps) {
        super(props);

        this.onSelect = props.onSelect;

        this.state = {
            projectInfo: props.project,
            teams: [],
            selection: new ListSelection({ selectOnFocus: false, multiSelect: false })
        };
    }

    public componentDidMount() {
        console.debug("TeamSelector: componentDidMount");
        if (this.state.projectInfo) {
            this.initializeState(this.state.projectInfo);
        }
    }

    public componentWillReceiveProps(nextProps : TeamSelectorProps) {
        console.debug("TeamSelector: componentWillReceiveProps");

        // Props may get resent from parent. Don't need to re-initialize state if the project is the same.
        if (nextProps.project && nextProps.project !== this.state.projectInfo) {
            this.initializeState(nextProps.project);
        }
    }

    private async initializeState(projectInfo : IProjectInfo): Promise<void> {
        console.debug("TeamSelector: initializeState");

        const coreService = getClient(CoreRestClient);
        let teamResults = await coreService.getTeams(projectInfo.id);
        this.setState({ projectInfo: projectInfo, teams: teamResults.map((webApiTeam) => new Team(webApiTeam.id, webApiTeam.name)) });

        const accessToken = await SDK.getAccessToken();
        const extDataService = await SDK.getService<IExtensionDataService>(CommonServiceIds.ExtensionDataService);
        this._dataManager = await extDataService.getExtensionDataManager(SDK.getExtensionContext().id, accessToken);

        this._dataManager.getValue<Team>(this.TeamExtensionId).then((data) => {
            console.debug("TeamSelector: Checking for previous team selected");
            console.debug(data);
            if (data) {
                let indexOfTeam = this.state.teams.findIndex(x => x.id == data.id);
                this.state.selection.select(indexOfTeam);
                this.onSelect(data);
            } else {
                this.selecteDefaultTeam();
            }
        }, () => {
            console.debug("TeamSelector: Could not fulfill promise to identify previous team");
            this.selecteDefaultTeam();
        });
        
    }

    private selecteDefaultTeam() {
        this.state.selection.select(0); // Start by selecting the first item.
        this.onSelect(this.state.teams[0]);
    }

    public render(): JSX.Element {
        return (
            <Dropdown<Team>
                className="sample-picker"
                placeholder="Loading..."
                items={this.state.teams}
                onSelect={this.onTeamChanged}
                selection={this.state.selection}
            />
        );
    }

    private onTeamChanged = (event: React.SyntheticEvent<HTMLElement>, item: IListBoxItem<Team>) : void => {
        console.log("Team changed to " + item.id);
        // Lookup the team since item.data is undefined
        let team = this.state.teams.find(x => x.id === item.id);
        if (team) {
            this._dataManager!.setValue<Team>(this.TeamExtensionId, team).then(() => {
                if (team) {
                    this.onSelect(team);
                }
            });
        }
    }
}