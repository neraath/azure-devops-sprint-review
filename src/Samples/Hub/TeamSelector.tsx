import * as React from "react";

import { ListSelection } from "azure-devops-ui/List";
import { CoreRestClient } from "azure-devops-extension-api/Core";
import { getClient, IProjectInfo } from "azure-devops-extension-api";
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
    private onSelect : (team: Team) => void;

    constructor(props: TeamSelectorProps) {
        super(props);

        this.onSelect = props.onSelect;

        this.state = {
            projectInfo: props.project,
            teams: [],
            selection: new ListSelection()
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
        this.state.selection.select(0); // Start by selecting the first item. TODO: Save last selected team.
        this.onSelect(this.state.teams[0]);
    }

    public render(): JSX.Element {
        return (
            <Dropdown<Team>
                className="sample-picker"
                items={this.state.teams}
                onSelect={this.onTeamChanged}
                selection={this.state.selection}
            />
        );
    }

    private onTeamChanged = (event: React.SyntheticEvent<HTMLElement>, item: IListBoxItem<Team>) => {
        console.log("Team changed to " + item.id);
        // Lookup the team since item.data is undefined
        let team = this.state.teams.find(x => x.id === item.id);
        if (team) {
            this.onSelect(team);
        }
    }
}