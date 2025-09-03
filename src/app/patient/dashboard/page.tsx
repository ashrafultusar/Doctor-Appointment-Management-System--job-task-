import ProtectedRoute from "@/components/ProtectedRoute";

export default function PatientDashboard() {
  return (
    <ProtectedRoute requiredRole="PATIENT">
      <div>
        <h1>Patient Dashboard</h1>
        {/* Your dashboard content here */}
      </div>
    </ProtectedRoute>
  );
}