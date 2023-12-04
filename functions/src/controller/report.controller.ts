import * as functions from "firebase-functions"
import { getTaskListWithStatusAndCreatedDateRange } from "../service/bigquery.service";
import { handleErrors, onRequestWithCorsAsync } from "../utils/http.utils";
import { FilterDto } from "../dto/filter.dto";
import { MISSING_REQUEST_DATA_ERROR } from "../consts/app.consts";
import { Task } from "../model/task";

exports.getTaskListWithStatusAndCreatedDateRange = onRequestWithCorsAsync(async (request, response) => {
    try {
        const filterDto: FilterDto = request.body?.data;
        if (!filterDto) {
            handleErrors(
                {
                    source: '[report.controller:getTaskListWithStatusAndCreatedDateRange]',
                    description: MISSING_REQUEST_DATA_ERROR
                },
                response,
                400
            );
            return;
        }

        const filteredTaskList: Task[] | null = await getTaskListWithStatusAndCreatedDateRange(filterDto);

        if (filteredTaskList && filteredTaskList.length !== 0) {
            functions.logger.log(`[report.controller:getTaskListWithStatusAndCreatedDateRange] Filtered task list received successfully. Length of the filtered task list is ${filteredTaskList?.length} items.`);
            response.status(200).json({data: filteredTaskList});
        } else {
            functions.logger.log("[report.controller:getTaskListWithStatusAndCreatedDateRange] Filtered task list is empty or doesn't exist.");
            response.status(200).json({data: []});
        }
    } catch (error: any) {
        handleErrors(
            {
                source: '[report.controller:getTaskListWithStatusAndCreatedDateRange]',
                description: 'Error getting filtered task list with status and created date range.',
                errorMessage: error.message
            },
            response,
            500
        )
    }
});
