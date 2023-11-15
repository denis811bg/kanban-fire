import * as functions from "firebase-functions"
import { loadTaskList } from "../utils/sheet.utils";
import { Status } from "../enum/Status";
import * as cors from "cors";
import { dbTasks } from "../db-collections";
import { Task } from "../model/Task";
import { Timestamp } from "@google-cloud/firestore"

const MISSING_TASK_DATA_ERROR = "Missing task list data in the google sheet. Something went wrong or sheet is empty.";

const corsMiddleware = cors({origin: true});

exports.initTaskList = functions.https.onRequest((request, response) => {
    corsMiddleware(request, response, async () => {
        try {
            const taskRows = await loadTaskList();
            if (!taskRows || taskRows.length === 0) {
                functions.logger.error(MISSING_TASK_DATA_ERROR);
                response.status(400).json({error: MISSING_TASK_DATA_ERROR});
                return;
            }

            const taskList: Task[] = await Promise.all(taskRows.map(async (taskRow) => {
                const newTask: Task = {
                    title: taskRow.get('title'),
                    description: taskRow.get('description'),
                    status: Status.TODO,
                    createdDate: Timestamp.now(),
                };

                const docRef = await dbTasks.add(newTask);
                newTask.id = docRef.id;

                return newTask;
            }));

            functions.logger.log("Task list initiation completed successfully.");
            response.status(200).json({data: taskList});
        } catch (error: any) {
            functions.logger.error("Error initiation task list.", error.message);
            response.status(500).json({error: error.message});
        }
    });
});
