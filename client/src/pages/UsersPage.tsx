import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";
import NavBar from "../components/NavBar";
import CreateUserDialog from "@/components/CreateUserDialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "AGENT";
  createdAt: string;
};

async function fetchUsers(): Promise<UserRow[]> {
  const res = await axios.get<{ users: UserRow[] }>("/api/users");
  return res.data.users;
}

export default function UsersPage() {
  const {
    data: users,
    error,
    isPending,
  } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  const errorMessage =
    error && axios.isAxiosError(error)
      ? String(error.response?.status ?? error.message)
      : error?.message;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <NavBar />
      <main className="p-8 flex justify-center">
        <div className="max-w-5xl w-full space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Users</h1>
            <CreateUserDialog />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle />
              <AlertDescription>
                Failed to load users: {errorMessage}
              </AlertDescription>
            </Alert>
          )}

          {isPending && <p className="text-muted-foreground">Loading…</p>}

          {users && (
            <div className="bg-white rounded-xl border border-slate-200">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.name}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>{u.role}</TableCell>
                      <TableCell>
                        {new Date(u.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                  {users.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center text-muted-foreground"
                      >
                        No users found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
