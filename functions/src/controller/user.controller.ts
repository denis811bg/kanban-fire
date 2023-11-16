import * as functions from "firebase-functions";
import { dbUsers } from "../db-collections";
import * as cors from "cors";
import { User } from "../model/user";
import { Timestamp } from "@google-cloud/firestore";

const MISSING_TASK_DATA_ERROR = "Missing user data in the request body.";

const corsMiddleware = cors({origin: true});

exports.getUser = functions.https.onRequest((request, response) => {
    corsMiddleware(request, response, async () => {
        try {
            const requestData = request.body.data;
            if (!requestData) {
                functions.logger.error(MISSING_TASK_DATA_ERROR);
                response.status(400).json({error: MISSING_TASK_DATA_ERROR});
                return;
            }

            const querySnapshot = await dbUsers.get();
            const user: User | undefined = querySnapshot.docs
                .map((docRef) => docRef.data() as User)
                .find((user) => user.uid === requestData.uid);

            if (user) {
                functions.logger.log("User found successfully.");
                response.status(200).json({data: user});
            } else {
                await createNewUser(requestData, response);
            }
        } catch (error: any) {
            functions.logger.error("Error finding user.", error.message);
            response.status(500).json({error: error.message});
        }
    });
});

exports.createUser = functions.https.onRequest((request, response) => {
    corsMiddleware(request, response, async () => {
        try {
            const requestData = request.body.data;
            if (!requestData) {
                functions.logger.error(MISSING_TASK_DATA_ERROR);
                response.status(400).json({error: MISSING_TASK_DATA_ERROR});
                return;
            }

            await createNewUser(requestData, response);
        } catch (error: any) {
            functions.logger.error("Error creating a new user.", error.message);
            response.status(500).json({error: error.message});
        }
    });
});

async function createNewUser(requestData: any, response: functions.Response): Promise<void> {
    const docRef = await dbUsers.add(buildNewUser(requestData));
    const docSnapshot = await docRef.get();

    if (docSnapshot.exists) {
        const newUser: User = docSnapshot.data() as User;

        functions.logger.log("User created successfully.");
        response.status(200).json({data: newUser});
    } else {
        functions.logger.log("User does not exist.");
        response.status(200).json({data: {}});
    }
}

function buildNewUser(requestData: any): User {
    return {
        displayName: requestData.displayName,
        email: requestData.email,
        phoneNumber: requestData.phoneNumber,
        photoURL: requestData.photoURL,
        providerId: requestData.providerId,
        uid: requestData.uid,
        createdDate: Timestamp.now()
    };
}
