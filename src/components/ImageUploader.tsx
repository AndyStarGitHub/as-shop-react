import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage"
import { useState } from "react"
import { storage } from "../firebase"
import { Box, Button, LinearProgress } from "@mui/material"
import { PhotoCamera } from "@mui/icons-material"


interface ImageUploaderProps {
    onUploadSuccess: (url: string) => void
}

export const ImageUploader = ({ onUploadSuccess }: ImageUploaderProps) => {
  const [progress, setProgress] = useState<number>(0)
  const [uploading, setUploading] = useState<boolean>(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const fileName = `${Date.now()}_${file.name}`   
    const storageRef = ref(storage, `products/${fileName}`) 
    const uploadTask = uploadBytesResumable(storageRef, file)

    setUploading(true)

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const prog = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
        setProgress(prog)
      },
      (error) => {
        console.error('Помилка завантаження:', error)
        setUploading(false)
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          onUploadSuccess(downloadURL)
          setUploading(false)
          setProgress(0)
        })
      }
    )
  }

  return (
    <Box sx={{ mt: 2, mb: 2 }}>
      <Button
        variant='outlined'
        component='label'
        startIcon={<PhotoCamera />}
        disabled={uploading}
        fullWidth
      >
        {uploading ? `Завантаження... ${progress}%` : 'Завантажити фото товару'}        
        <input type='file' hidden accept="image/*" onChange={handleFileChange}/>
      </Button>

      {uploading && (
        <LinearProgress variant="determinate" value={progress} sx={{ mt: 1 }} />
      )}
    </Box>
  )
}
