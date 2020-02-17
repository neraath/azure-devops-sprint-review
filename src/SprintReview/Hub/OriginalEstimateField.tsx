import * as React from "react";

import { TaskQueryService } from "./TaskQueryService";

export interface IOriginalEstimateState {
    OriginalEstimate?: number;
}

export class OriginalEstimateField extends React.Component<{ workItemId: number }, IOriginalEstimateState> {
    private taskService : TaskQueryService;
    private workItemId : number;

    constructor(props : { workItemId: number }) {
        super(props);
        this.taskService = new TaskQueryService();
        this.workItemId = props.workItemId;
        this.state = {};
    }

    public componentDidMount() {
        this.initializeState();
    }

    private async initializeState() : Promise<void> {
        console.debug("GETTING ORIGINAL");
        let times = await this.taskService.getOriginalAndCompletedTime(this.workItemId);
        this.setState({
            OriginalEstimate: times.OriginalEstimate
        });
    }

    public render() : JSX.Element {
        return (
            <div>{isNaN(this.state.OriginalEstimate) ? 0 : this.state.OriginalEstimate}</div>
        );
    }
}