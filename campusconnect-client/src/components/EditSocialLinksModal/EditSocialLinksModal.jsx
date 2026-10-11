import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Box } from "@mui/material";
import { updateUser } from "../../services/userService";
import { showError } from "../../redux/uiSlice";
import { getErrorMessage } from "../../services/api";

export default function EditSocialLinksModal({ open, onClose, profile, onSaved }) {
  const dispatch = useDispatch();
  const [values, setValues] = useState({
    location: profile?.location || "",
    occupation: profile?.occupation || "",
    batch: profile?.batch || "",
    githubUrl: profile?.githubUrl || "",
    linkedinUrl: profile?.linkedinUrl || "",
    portfolioUrl: profile?.portfolioUrl || "",
  });
  const [saving, setSaving] = useState(false);

  function handleChange(key) {
    return (e) => setValues((v) => ({ ...v, [key]: e.target.value }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await updateUser(profile._id, values);
      onSaved();
      onClose();
    } catch (err) {
      dispatch(showError(getErrorMessage(err)));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Edit profile details</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2} mt={0.5}>
          <TextField label="Location" value={values.location} onChange={handleChange("location")} fullWidth size="small" />
          {profile?.role === "alumni" ? (
            <TextField label="Occupation" value={values.occupation} onChange={handleChange("occupation")} fullWidth size="small" />
          ) : (
            <TextField label="Batch" value={values.batch} onChange={handleChange("batch")} fullWidth size="small" />
          )}
          <TextField label="GitHub URL" value={values.githubUrl} onChange={handleChange("githubUrl")} fullWidth size="small" />
          <TextField label="LinkedIn URL" value={values.linkedinUrl} onChange={handleChange("linkedinUrl")} fullWidth size="small" />
          <TextField label="Portfolio URL" value={values.portfolioUrl} onChange={handleChange("portfolioUrl")} fullWidth size="small" />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={saving}>Save</Button>
      </DialogActions>
    </Dialog>
  );
}
