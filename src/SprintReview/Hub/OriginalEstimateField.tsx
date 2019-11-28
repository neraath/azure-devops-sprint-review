import * as React from "react";

import { TaskQueryService } from "./TaskQueryService";

export interface OriginalAndCompletedTime {
    OriginalEstimate: number;
    CompletedWork: number;
}

export interface IOriginalEstimateState {
    WorkItemId: number;
    OriginalEstimate?: number;
}

export class OriginalEstimateField extends React.Component<{ workItemId: number }, IOriginalEstimateState> {
    private taskService : TaskQueryService;

    constructor(props : { workItemId: number }) {
        super(props);
        this.taskService = new TaskQueryService(props.workItemId);
        this.state = {
            WorkItemId: props.workItemId
        };
    }

    public componentDidMount() {
        this.initializeState();
    }

    private async initializeState() : Promise<void> {
        console.debug("GETTING ORIGINAL");
        let times = await this.taskService.getOriginalAndCompletedTime(this.state.WorkItemId);
        this.setState({
            OriginalEstimate: times.OriginalEstimate
        });
    }

    public render() : JSX.Element {
        return (
            <div>{this.state.OriginalEstimate}</div>
        );
    }
}