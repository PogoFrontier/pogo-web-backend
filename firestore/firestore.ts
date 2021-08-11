
import firebase from 'firebase-admin';
import SERVICE_ACCOUNT from '../project-grookey-6a7326cb8d5a';

//initialize firebase and firestore
const serviceAccount: any = SERVICE_ACCOUNT;
firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount)
});
export const firestore = firebase.firestore();