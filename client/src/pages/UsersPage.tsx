import NavBar from "../components/NavBar";

export default function UsersPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <NavBar />
      <main className="p-8 flex justify-center">
        <div className="max-w-xl w-full">
          <h1 className="text-3xl font-bold">Users</h1>
        </div>
      </main>
    </div>
  );
}
