import * as React from "react";

import { ListSelection } from "azure-devops-ui/List";
import { WebApiTeam, CoreRestClient, TeamContext } from "azure-devops-extension-api/Core";
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

        console.debug("CONSTRUCTOR");
        console.debug(props.project);

        this.onSelect = props.onSelect;

        this.state = {
            projectInfo: props.project,
            teams: [],
            selection: new ListSelection()
        };
    }

    public componentDidMount() {
        this.initializeState();
    }

    public componentWillReceiveProps(nextProps : TeamSelectorProps) {
        console.debug("TeamSelector: componentWillReceiveProps");
        console.debug(nextProps);
        this.setState({ projectInfo: nextProps.project });
        this.initializeState();
    }

    private async initializeState(): Promise<void> {
        console.debug("TeamSelector: initializeState");
        console.debug(this.state.projectInfo);

        if (this.state.projectInfo)
        {
            console.debug("TeamSelector: initializeState with projectInfo");
            const coreService = getClient(CoreRestClient);
            let teamResults = await coreService.getTeams(this.state.projectInfo.id);
            this.setState({ teams: teamResults.map((webApiTeam) => new Team(webApiTeam.id, webApiTeam.name)) });
            this.state.selection.select(0);
            console.debug("team results");
            console.debug(teamResults);

            let teamContext : TeamContext = { 
                projectId: this.state.projectInfo.id,
                project: '',
                teamId: teamResults[0].id,
                team: ''
            };
            console.debug("team context: ");
            console.debug(teamContext);
        }
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

    private onTeamChanged = (event: React.SyntheticEvent<HTMLElement>, item: IListBoxItem<Team>): void => {
        console.log("Team changed to " + item.id);
        let team = this.state.teams.find(x => x.id === item.id);
        if (team) {
            this.onSelect(team);
        }
    }
}