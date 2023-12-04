import { BigQuery } from "@google-cloud/bigquery";
import { configs } from "../config/configs";
import { DATASET } from "../consts/app.consts";

export function getBigQuery(): BigQuery {
    return new BigQuery();
}

export function getBigQueryTableName(tableName: string): string {
    return `${configs.application.auth.project_id}.${DATASET}.${tableName}`;
}
