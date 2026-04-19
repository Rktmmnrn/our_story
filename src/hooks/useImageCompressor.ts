import imageCompression from 'browser-image-compression';

export const useImageCompressor = () => {
  const compressImage = async (file: File): Promise<File> => {
    // On ne compresse que les images
    if (!file.type.startsWith('image/')) return file;

    const options = {
      maxSizeMB: 1.8,           // max 1.8 Mo (très bon compromis)
      maxWidthOrHeight: 1920,   // résolution suffisante pour la galerie
      useWebWorker: true,
      preserveExif: true,
      initialQuality: 0.85,
    };

    try {
      const compressedFile = await imageCompression(file, options);
      console.log(`📸 Compressé : ${file.name} → ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);
      return compressedFile;
    } catch (err) {
      console.warn('Compression échouée → envoi fichier original', err);
      return file;
    }
  };

  return { compressImage };
};