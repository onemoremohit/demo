import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
    GoogleAuthProvider,
    signInWithPopup,
    sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from './config';
import { setDoc, doc, getDoc } from 'firebase/firestore';
import { db } from './config';

// Register with email and password
export const registerWithEmailAndPassword = async (email, password, displayName) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Update profile with display name
        await updateProfile(user, {
            displayName
        });

        // Create user document in Firestore
        await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            displayName,
            email,
            photoURL: user.photoURL || '',
            interests: [],
            bio: '',
            createdAt: new Date(),
            likedUsers: [],
            dislikedUsers: [],
            matches: []
        });

        return user;
    } catch (error) {
        throw error;
    }
};

// Sign in with email and password
export const loginWithEmailAndPassword = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error) {
        throw error;
    }
};

// Sign in with Google
export const signInWithGoogle = async () => {
    try {
        const provider = new GoogleAuthProvider();
        const userCredential = await signInWithPopup(auth, provider);
        const user = userCredential.user;

        // Check if user document exists
        const userDoc = await getDoc(doc(db, 'users', user.uid));

        // If user document doesn't exist, create it
        if (!userDoc.exists()) {
            await setDoc(doc(db, 'users', user.uid), {
                uid: user.uid,
                displayName: user.displayName || '',
                email: user.email,
                photoURL: user.photoURL || '',
                interests: [],
                bio: '',
                createdAt: new Date(),
                likedUsers: [],
                dislikedUsers: [],
                matches: []
            });
        }

        return user;
    } catch (error) {
        throw error;
    }
};

// Sign out
export const logoutUser = async () => {
    try {
        await signOut(auth);
        return true;
    } catch (error) {
        throw error;
    }
};

// Send password reset email
export const resetPassword = async (email) => {
    try {
        await sendPasswordResetEmail(auth, email);
        return true;
    } catch (error) {
        throw error;
    }
};

// Get current user
export const getCurrentUser = () => {
    return auth.currentUser;
};