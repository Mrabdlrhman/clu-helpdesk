import { useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Pencil, Plus } from "lucide-react";
import {
  createUserSchema,
  updateUserSchema,
  type CreateUserInput,
  type UpdateUserInput,
} from "@helpdesk/core";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { UserRow } from "@/lib/users";

type Props =
  | { mode: "create" }
  | { mode: "edit"; user: UserRow };

export default function UserFormDialog(props: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {props.mode === "create" ? (
          <Button>
            <Plus />
            New user
          </Button>
        ) : (
          <Button variant="ghost" size="icon" aria-label="Edit user">
            <Pencil />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        {props.mode === "create" ? (
          <CreateForm onDone={() => setOpen(false)} />
        ) : (
          <EditForm user={props.user} onDone={() => setOpen(false)} />
        )}
      </DialogContent>
    </Dialog>
  );
}

function CreateForm({ onDone }: { onDone: () => void }) {
  const queryClient = useQueryClient();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const mutation = useMutation({
    mutationFn: async (data: CreateUserInput) => {
      await axios.post("/api/users", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      reset();
      setSubmitError(null);
      onDone();
    },
    onError: (error) => {
      setSubmitError(extractError(error, "Failed to create user"));
    },
  });

  return (
    <>
      <DialogHeader>
        <DialogTitle>Create user</DialogTitle>
        <DialogDescription>
          New users are created with the AGENT role.
        </DialogDescription>
      </DialogHeader>
      <form
        onSubmit={handleSubmit((data) => {
          setSubmitError(null);
          mutation.mutate(data);
        })}
        className="flex flex-col gap-4"
        noValidate
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="create-user-name">Name</Label>
          <Input
            id="create-user-name"
            autoComplete="name"
            aria-invalid={errors.name ? "true" : "false"}
            {...register("name")}
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="create-user-email">Email</Label>
          <Input
            id="create-user-email"
            type="email"
            autoComplete="email"
            aria-invalid={errors.email ? "true" : "false"}
            {...register("email")}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="create-user-password">Password</Label>
          <Input
            id="create-user-password"
            type="password"
            autoComplete="new-password"
            aria-invalid={errors.password ? "true" : "false"}
            {...register("password")}
          />
          {errors.password && (
            <p className="text-sm text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>
        {submitError && (
          <Alert variant="destructive">
            <AlertCircle />
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}
        <DialogFooter>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Creating…" : "Create user"}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}

function EditForm({ user, onDone }: { user: UserRow; onDone: () => void }) {
  const queryClient = useQueryClient();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateUserInput>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: { name: user.name, email: user.email, password: "" },
  });

  const mutation = useMutation({
    mutationFn: async (data: UpdateUserInput) => {
      await axios.patch(`/api/users/${user.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setSubmitError(null);
      onDone();
    },
    onError: (error) => {
      setSubmitError(extractError(error, "Failed to update user"));
    },
  });

  return (
    <>
      <DialogHeader>
        <DialogTitle>Edit user</DialogTitle>
        <DialogDescription>
          Leave password blank to keep it unchanged.
        </DialogDescription>
      </DialogHeader>
      <form
        onSubmit={handleSubmit((data) => {
          setSubmitError(null);
          mutation.mutate(data);
        })}
        className="flex flex-col gap-4"
        noValidate
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="edit-user-name">Name</Label>
          <Input
            id="edit-user-name"
            autoComplete="name"
            aria-invalid={errors.name ? "true" : "false"}
            {...register("name")}
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="edit-user-email">Email</Label>
          <Input
            id="edit-user-email"
            type="email"
            autoComplete="email"
            aria-invalid={errors.email ? "true" : "false"}
            {...register("email")}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="edit-user-password">Password</Label>
          <Input
            id="edit-user-password"
            type="password"
            autoComplete="new-password"
            placeholder="Leave blank to keep current"
            aria-invalid={errors.password ? "true" : "false"}
            {...register("password")}
          />
          {errors.password && (
            <p className="text-sm text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>
        {submitError && (
          <Alert variant="destructive">
            <AlertCircle />
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}
        <DialogFooter>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Saving…" : "Save changes"}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}

function extractError(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error) && error.response?.data?.error) {
    return String(error.response.data.error);
  }
  return fallback;
}
