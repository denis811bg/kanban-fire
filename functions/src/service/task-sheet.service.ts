import * as functions from "firebase-functions"
import { getSpreadsheetId, loadTaskList, TaskRowData } from "../utils/sheet.utils";
import { dbTasks } from "../db-collections";
import { Task } from "../model/task";
import { handleErrors, onRequestWithCorsAsync } from "../utils/http.utils";
import { GoogleSpreadsheetRow } from "google-spreadsheet";
import { firestore } from "firebase-admin";
import { TaskDto } from "../dto/task.dto";
import DocumentReference = firestore.DocumentReference;
import DocumentData = firestore.DocumentData;
import DocumentSnapshot = firestore.DocumentSnapshot;

exports.initTaskList = onRequestWithCorsAsync(async (request, response) => {
    try {
        const taskRows: GoogleSpreadsheetRow<TaskRowData>[] = await loadTaskList();
        if (!taskRows || taskRows.length === 0) {
            handleErrors(
                {
                    source: '[task-sheet.service:initTaskList]',
                    description: `Sheet doesn't contain items. Sheet id: ${getSpreadsheetId()}`
                },
                response,
                400
            )
            return;
        }

        const taskList: Task[] = await Promise.all(taskRows.map(async (taskRow: GoogleSpreadsheetRow<TaskRowData>) => {
            const taskDto: TaskDto = {
                title: taskRow.get('title'),
                description: taskRow.get('description'),
                status: taskRow.get('status'),
                createdDate: taskRow.get('createdDate'),
            };

            const docRef: DocumentReference<DocumentData> = await dbTasks.add(taskDto);
            await docRef.update({id: docRef.id});
            const docSnapshot: DocumentSnapshot<DocumentData> = await docRef.get();

            return docSnapshot.data() as Task;
        }));

        functions.logger.log(`Task list initiation completed successfully. Length of the task list is ${taskList.length} items`);
        response.status(200).json({data: taskList});
    } catch (error: any) {
        handleErrors(
            {
                source: '[task-sheet.service:initTaskList]',
                description: 'Error initiation task list.',
                errorMessage: error.message
            },
            response,
            500
        );
    }
});
