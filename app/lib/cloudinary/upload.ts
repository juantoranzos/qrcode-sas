// Subida de imágenes a Cloudinary (Client side o Server side)
// Aprovechamos los unsigned uploads de Cloudinary para no exponer secret keys en el frontend.

export async function uploadImageToCloudinary(file: File): Promise<string> {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
        throw new Error('Faltan credenciales de Cloudinary en el archivo .env.local');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    try {
        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Error al subir la imagen a Cloudinary');
        }

        const data = await response.json();
        return data.secure_url; // Devolvemos la URL pública final de la imagen
    } catch (error) {
        console.error('Error en uploadImageToCloudinary:', error);
        throw error;
    }
}
