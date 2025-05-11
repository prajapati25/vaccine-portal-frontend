import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Calendar, CheckCircle, AlertCircle, FileText } from "lucide-react";
import axios, { API_ENDPOINTS } from "../api/axios";
import Layout from "../components/ui/Layout";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    vaccinatedStudents: 0,
    vaccinationRate: 0,
    upcomingDrives: [],
    recentVaccinations: [],
    gradeWiseStats: {},
    driveCompletionRate: 0,
    vaccinesDueSoon: 0,
    vaccinesOverdue: 0,
    statusSummary: {
      total: 0,
      completed: 0,
      pending: 0,
      overdue: 0,
      completionRate: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchDashboardData();
  }, [isAuthenticated, navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all dashboard data in parallel
      const [
        studentCountRes,
        vaccinesAdministeredRes,
        vaccinesDueSoonRes,
        vaccinesOverdueRes,
        gradeWiseStatsRes,
        statusSummaryRes,
        upcomingDrivesRes
      ] = await Promise.all([
        axios.get(API_ENDPOINTS.DASHBOARD.STUDENT_COUNT),
        axios.get(API_ENDPOINTS.DASHBOARD.VACCINES_ADMINISTERED),
        axios.get(API_ENDPOINTS.DASHBOARD.VACCINES_DUE_SOON),
        axios.get(API_ENDPOINTS.DASHBOARD.VACCINES_OVERDUE),
        axios.get(API_ENDPOINTS.DASHBOARD.VACCINATIONS_BY_GRADE),
        axios.get(API_ENDPOINTS.DASHBOARD.VACCINATIONS_STATUS),
        axios.get(API_ENDPOINTS.DASHBOARD.UPCOMING_DRIVES)
      ]);

      setStats({
        totalStudents: studentCountRes.data,
        vaccinatedStudents: vaccinesAdministeredRes.data,
        vaccinationRate: studentCountRes.data > 0 
          ? ((vaccinesAdministeredRes.data / studentCountRes.data) * 100).toFixed(1)
          : 0,
        vaccinesDueSoon: vaccinesDueSoonRes.data,
        vaccinesOverdue: vaccinesOverdueRes.data,
        gradeWiseStats: gradeWiseStatsRes.data.stats,
        statusSummary: statusSummaryRes.data,
        upcomingDrives: upcomingDrivesRes.data.drives,
        driveCompletionRate: statusSummaryRes.data.completionRate
      });
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        setError("Failed to load dashboard data. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading dashboard data...</div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="text-red-600">{error}</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="w-full h-full">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
          <p className="text-sm text-gray-600 mt-1">Overview of vaccination statistics and upcoming drives</p>
        </div>

        {/* Statistics Cards - Ensure full width and proper spacing */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard
            title="Total Students"
            value={stats.totalStudents}
            icon={<Users className="text-blue-600" />}
            color="bg-blue-50"
          />
          <StatCard
            title="Vaccinated Students"
            value={stats.vaccinatedStudents}
            icon={<CheckCircle className="text-green-600" />}
            color="bg-green-50"
          />
          <StatCard
            title="Vaccination Rate"
            value={`${stats.vaccinationRate}%`}
            icon={<AlertCircle className="text-yellow-600" />}
            color="bg-yellow-50"
          />
          <StatCard
            title="Drive Completion Rate"
            value={`${stats.driveCompletionRate}%`}
            icon={<FileText className="text-purple-600" />}
            color="bg-purple-50"
          />
        </div>

        {/* Status Summary */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Vaccination Status Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Total</div>
              <div className="text-2xl font-bold text-gray-800">{stats.statusSummary.total}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Completed</div>
              <div className="text-2xl font-bold text-gray-800">{stats.statusSummary.completed}</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Pending</div>
              <div className="text-2xl font-bold text-gray-800">{stats.statusSummary.pending}</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Overdue</div>
              <div className="text-2xl font-bold text-gray-800">{stats.statusSummary.overdue}</div>
            </div>
          </div>
        </div>

        {/* Grade-wise Statistics */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Grade-wise Vaccination Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(stats.gradeWiseStats).map(([grade, data]) => (
              <div key={grade} className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Grade {grade}</div>
                <div className="text-2xl font-bold text-gray-800">{data.vaccinatedStudents}/{data.totalStudents}</div>
                <div className="text-sm text-gray-500">
                  {data.vaccinationRate.toFixed(1)}% vaccinated
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Drives - Full width table with responsive scroll */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Upcoming Vaccination Drives</h2>
          {stats.upcomingDrives.length === 0 ? (
            <div className="text-gray-500 text-center py-4">No upcoming drives scheduled</div>
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vaccine</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Available Doses</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Target Grade</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.upcomingDrives.map((drive) => (
                    <tr key={drive.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(drive.driveDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {drive.vaccine.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {drive.availableDoses}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {drive.applicableGrades}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          {drive.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

const StatCard = ({ title, value, icon, color }) => (
  <div className={`${color} rounded-xl p-6 shadow-sm w-full`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
      </div>
      <div className="p-3 bg-white rounded-lg shadow-sm">
        {icon}
      </div>
    </div>
  </div>
);

export default Dashboard;