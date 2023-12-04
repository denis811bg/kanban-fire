import * as admin from "firebase-admin";
import { database, firestore, messaging } from "firebase-admin";

export const app = admin.initializeApp();
export const db = firestore();
export const fcm = messaging();
export const rtdb = database();
