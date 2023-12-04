import * as cors from "cors";
import * as functions from "firebase-functions";

const corsMiddleware = cors({origin: true});

export const onRequestWithCorsAsync = (handler: (request: functions.Request, response: functions.Response) => Promise<void>) =>
    functions.https.onRequest(async (request, response) => {
        corsMiddleware(request, response, async () => {
            await handler(request, response);
        });
    });

export const handleErrors = (errorData: ErrorData, response: functions.Response, statusCode: number): void => {
    functions.logger.error(errorData.source + ' ' + errorData.description);
    response.status(statusCode).json({error: errorData.errorMessage});
};

export type ErrorData = {
    source: string;
    description: string;
    errorMessage?: string;
}
