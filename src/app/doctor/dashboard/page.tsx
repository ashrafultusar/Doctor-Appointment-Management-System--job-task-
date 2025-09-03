import ProtectedRoute from "@/components/ProtectedRoute";


export default function DoctorDashboard() {
  return (
    <ProtectedRoute requiredRole="DOCTOR">
      <div>
        <h1 className="text-white">Doctor Dashboard</h1>
        {/* Your dashboard content here */}
      </div>
    </ProtectedRoute>
  );
}