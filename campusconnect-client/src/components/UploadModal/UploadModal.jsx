import React, { useRef, useState } from "react";
import { useDispatch } from "react-redux";
import {
  Dialog, DialogTitle, DialogContent, Box, Typography, LinearProgress, Button, IconButton,
} from "@mui/material";
import { Close, CloudUpload } from "@mui/icons-material";
import { uploadMedia } from "../../services/mediaService";
import { showError } from "../../redux/uiSlice";
import { getErrorMessage } from "../../services/api";

/**
 * Interactive upload modal with a REAL Cloudinary progress bar — driven
 * by axios's onUploadProgress, not a fake timer. Used by all four
 * composer buttons (Image / Clip / Attachment / Audio), each passing a
 * different `accept` filter and `label`.
 */
export default function UploadModal({ open, onClose, accept, label, onUploaded }) {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  function reset() {
    setFile(null); setPreview(null); setProgress(0); setUploading(false);
  }

  function handleClose() {
    if (uploading) return; // don't let them close mid-upload
    reset();
    onClose();
  }

  function handlePick(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    if (f.type.startsWith("image") || f.type.startsWith("video")) {
      setPreview({ url: URL.createObjectURL(f), isVideo: f.type.startsWith("video") });
    }
  }

  async function startUpload() {
    if (!file) return;
    setUploading(true);
    setProgress(0);
    try {
      const { url, mediaType } = await uploadMedia(file, setProgress);
      onUploaded(url, mediaType);
      reset();
      onClose();
    } catch (err) {
      dispatch(showError(getErrorMessage(err)));
      setUploading(false);
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {label}
        <IconButton size="small" onClick={handleClose} disabled={uploading}><Close fontSize="small" /></IconButton>
      </DialogTitle>
      <DialogContent>
        <input ref={fileInputRef} type="file" accept={accept} hidden onChange={handlePick} />

        {!file && (
          <Box
            onClick={() => fileInputRef.current?.click()}
            sx={{
              border: "2px dashed", borderColor: "divider", borderRadius: 3, py: 6, textAlign: "center",
              cursor: "pointer", color: "text.secondary", "&:hover": { borderColor: "primary.main", color: "primary.main" },
            }}
          >
            <CloudUpload sx={{ fontSize: 32, mb: 1 }} />
            <Typography variant="body2">Click to choose a file</Typography>
          </Box>
        )}

        {file && preview && (
          preview.isVideo ? (
            <video src={preview.url} controls style={{ width: "100%", maxHeight: 240, borderRadius: 10 }} />
          ) : (
            <img src={preview.url} alt="preview" style={{ width: "100%", maxHeight: 240, objectFit: "cover", borderRadius: 10 }} />
          )
        )}
        {file && !preview && (
          <Typography variant="body2" sx={{ p: 2, bgcolor: "action.hover", borderRadius: 2 }}>{file.name}</Typography>
        )}

        {uploading && (
          <Box mt={2}>
            <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
            <Typography variant="caption" color="text.secondary" mt={0.5} display="block">
              Uploading to Cloudinary… {progress}%
            </Typography>
          </Box>
        )}

        {file && !uploading && (
          <Button fullWidth variant="contained" sx={{ mt: 2 }} onClick={startUpload}>
            Upload
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
