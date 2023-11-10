import { configs } from "../config/configs";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";
import { Status } from "../enum/Status";

const serviceAccountAuth = new JWT({
    email: configs.application.auth.client_email,
    key: configs.application.auth.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets',],
});

export async function loadTaskList() {
    const spreadsheetId = getSpreadsheetId();
    const sheet = await getSheet(spreadsheetId, "tasks");

    return await sheet.getRows<TaskRowData>();
}

export function getSpreadsheetId(): string {
    return configs.application.sheet.spreadsheet.id;
}

async function getSheet(spreadsheetId: string, title?: string) {
    try {
        const doc = new GoogleSpreadsheet(spreadsheetId, serviceAccountAuth);
        await doc.loadInfo();

        return title ? doc.sheetsByTitle[title] : doc.sheetsByIndex[0];
    } catch (error) {
        console.error(error);
        throw new Error("Read sheet error. Sheet id = " + spreadsheetId);
    }
}

type TaskRowData = {
    id: string;
    title: string;
    description: string;
    status: Status;
    createdDate: Date;
    updatedDate: Date;
}
