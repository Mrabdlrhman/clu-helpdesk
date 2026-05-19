import { useState } from "react";
import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { UserRow } from "@/lib/users";

export default function DeleteUserDialog({ user }: { user: UserRow }) {
  const [open, setOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      await axios.delete(`/api/users/${user.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setSubmitError(null);
      setOpen(false);
    },
    onError: (error) => {
      setSubmitError(extractError(error, "Failed to delete user"));
    },
  });

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setSubmitError(null);
      }}
    >
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Delete user">
          <Trash2 className="text-destructive" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete user</AlertDialogTitle>
          <AlertDialogDescription>
            This will deactivate {user.name} ({user.email}). They will be signed
            out immediately and can't sign in again. This action can't be undone
            from the UI.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {submitError && (
          <Alert variant="destructive">
            <AlertCircle />
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={mutation.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={mutation.isPending}
            onClick={(event) => {
              event.preventDefault();
              setSubmitError(null);
              mutation.mutate();
            }}
          >
            {mutation.isPending ? "Deleting…" : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function extractError(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error) && error.response?.data?.error) {
    return String(error.response.data.error);
  }
  return fallback;
}
