import * as admin from "firebase-admin";
import { firestore, messaging } from "firebase-admin";

export const app = admin.initializeApp();
export const db = firestore();
export const fcm = messaging();
