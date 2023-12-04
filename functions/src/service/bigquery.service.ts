import { Query, RowMetadata, SimpleQueryRowsResponse } from "@google-cloud/bigquery";
import { Task } from "../model/task";
import { FilterDto } from "../dto/filter.dto";
import { getBigQuery, getBigQueryTableName } from "../utils/bigquery.utils";
import { APP_LOCATION } from "../consts/app.consts";

export async function getTaskListWithStatusAndCreatedDateRange(filterDto: FilterDto): Promise<Task[] | null> {
    const sqlQuery: string = `SELECT
                                  JSON_QUERY(data, '$')
                              FROM \`${getBigQueryTableName("tasks_raw_latest")}\`
                              WHERE
                                  JSON_VALUE(data, '$.status') = @status AND
                                  JSON_VALUE(data, '$.createdDate') BETWEEN @start AND @end`;
    const query: Query = {
        query: sqlQuery,
        location: APP_LOCATION,
        params: {
            status: filterDto.status,
            start: filterDto.createdDateRange.start,
            end: filterDto.createdDateRange.end
        }
    };
    const response: SimpleQueryRowsResponse = await getBigQuery().query(query);

    return response[0].map((task: RowMetadata) => (task as Task));
}
