import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";

type ConfirmDeleteDialogProps = {
  open: boolean;
  title?: string;
  message?: string;
  id:string;
  onYes: (id:string) => void;
  onNo: () => void; // also used for closing
};

export function ConfirmDeleteDialog({
  open,
  title = "Delete item?",
  message = "This action cannot be undone.",
  id,
  onYes,
  onNo,
}: ConfirmDeleteDialogProps) {
  return (
    <Dialog open={open} onClose={onNo} aria-labelledby="confirm-delete-title">
      <DialogTitle id="confirm-delete-title">{title}</DialogTitle>

      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>

      <DialogActions>
        <Button onClick={onNo} variant="outlined">
          No
        </Button>
        <Button onClick={() => onYes(id)} variant="contained" color="error" autoFocus>
          Yes, delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}
