import { configs } from "../config/configs";
import { GoogleSpreadsheet, GoogleSpreadsheetRow, GoogleSpreadsheetWorksheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";
import { Status } from "../enum/Status";

const serviceAccountAuth: JWT = new JWT({
    email: configs.application.auth.client_email,
    key: configs.application.auth.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets',],
});

export async function loadTaskList(): Promise<GoogleSpreadsheetRow<TaskRowData>[]> {
    const spreadsheetId: string = getSpreadsheetId();
    const sheet: GoogleSpreadsheetWorksheet = await getSheet(spreadsheetId, "tasks");

    return await sheet.getRows<TaskRowData>();
}

export function getSpreadsheetId(): string {
    return configs.application.sheet.spreadsheet.id;
}

async function getSheet(spreadsheetId: string, title?: string): Promise<GoogleSpreadsheetWorksheet> {
    const doc: GoogleSpreadsheet = new GoogleSpreadsheet(spreadsheetId, serviceAccountAuth);
    await doc.loadInfo();

    return title ? doc.sheetsByTitle[title] : doc.sheetsByIndex[0];
}

export type TaskRowData = {
    id: string;
    title: string;
    description: string;
    status: Status;
    createdDate: Date;
    updatedDate: Date;
}
