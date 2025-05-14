import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './config';

// Upload profile image
export const uploadProfileImage = async (userId, file) => {
    try {
        const fileExtension = file.name.split('.').pop();
        const storageRef = ref(storage, `profile_images/${userId}.${fileExtension}`);

        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);

        return downloadURL;
    } catch (error) {
        throw error;
    }
};

// Upload destination image
export const uploadDestinationImage = async (destinationId, file) => {
    try {
        const fileExtension = file.name.split('.').pop();
        const storageRef = ref(storage, `destination_images/${destinationId}.${fileExtension}`);

        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);

        return downloadURL;
    } catch (error) {
        throw error;
    }
};

// Delete image from storage
export const deleteImage = async (imageUrl) => {
    try {
        // Extract the path from the URL
        const decodedUrl = decodeURIComponent(imageUrl);
        const startIndex = decodedUrl.indexOf('/o/') + 3;
        const endIndex = decodedUrl.indexOf('?');
        const storagePath = decodedUrl.substring(startIndex, endIndex);

        // Create a reference to the file to delete
        const imageRef = ref(storage, storagePath);

        await deleteObject(imageRef);
        return true;
    } catch (error) {
        throw error;
    }
};

// Upload multiple images
export const uploadMultipleImages = async (folderPath, files) => {
    try {
        const uploadPromises = files.map(async (file, index) => {
            const fileExtension = file.name.split('.').pop();
            const fileName = `${Date.now()}_${index}.${fileExtension}`;
            const storageRef = ref(storage, `${folderPath}/${fileName}`);

            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);

            return downloadURL;
        });

        const downloadURLs = await Promise.all(uploadPromises);
        return downloadURLs;
    } catch (error) {
        throw error;
    }
};