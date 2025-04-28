/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  ChartBar,
  Activity,
  ThumbsUp,
  ThumbsDown,
  Clock,
  Car,
  MapPin,
  Database
} from "lucide-react";
import {
  LineChart,
  BarChart,
  PieChart,
  Legend,
  Tooltip,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Area,
  AreaChart,
  Label,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend,
  Line,
  Bar,
} from "recharts";

// Color palette for charts
const COLORS = [
  "#0088FE", // Blue
  "#00C49F", // Green
  "#FFBB28", // Yellow
  "#FF8042", // Orange
  "#8884d8", // Purple
  "#82ca9d", // Light Green
  "#FF6B6B", // Red
  "#747EF7", // Indigo
  "#4ECDC4", // Teal
  "#F7B801", // Gold
];

const STATUS_COLORS = {
  active: "#10B981", // Green
  inactive: "#F87171", // Red
  pending: "#F59E0B", // Amber
  completed: "#3B82F6", // Blue
  inProgress: "#8B5CF6", // Purple
  canceled: "#6B7280", // Gray
  success: "#10B981", // Green
  failed: "#F87171", // Red
  error: "#EF4444", // Bright Red
};

const BASE_URL = "http://127.0.0.1:8000";

function AdminDashboard() {
  const navigate = useNavigate();

 // Fixed adapter functions
const adaptUsersData = (backendUsers) => {
  // Correctly handle array structure that's already working
  return backendUsers.map(user => ({
    id: user.id,
    role: user.role || 'user',
    created_at: user.created_at || user.date_joined,
    // Other fields as needed
  }));
};

const adaptVehicleData = (backendVehicles) => {
  // Handle the case where vehicles is an array of objects without nested structure
  // Based on the console logs, vehicles are direct objects not in a nested 'vehicles' property
  return backendVehicles.map((vehicle) => ({
    id: vehicle.id,
    type: vehicle.type || 'unknown',
    vehicle_status: vehicle.status || "active", // Use status if available
    created_date: vehicle.created_at || vehicle.created_date, // Handle different date field names
    plate_number: vehicle.plate_number,
    prediction_size: vehicle.prediction_size,
    driving_category: vehicle.driving_category,
  }));
};

const adaptFeedbackData = (backendFeedbacks) => {
  // Handle the case where feedbacks is an array of objects without nested structure
  return backendFeedbacks.map(feedback => {
    // More robust rating extraction
    let rating = 0;
    if (typeof feedback.rating === 'number') {
      rating = feedback.rating;
    } else if (typeof feedback.rating === 'string' && !isNaN(parseFloat(feedback.rating))) {
      rating = parseFloat(feedback.rating);
    } else if (typeof feedback.rate === 'number') {
      rating = feedback.rate;
    } else if (typeof feedback.rate === 'string' && !isNaN(parseFloat(feedback.rate))) {
      rating = parseFloat(feedback.rate);
    }

    return {
      id: feedback.id,
      rating: rating,
      created_at: feedback.created_at || new Date().toISOString(),
    };
  });
};

// Modified function to handle predictions data correctly
const adaptPredictionsData = (predictionsData) => {
  // Handle direct array of prediction objects
  return predictionsData.map(prediction => ({
    id: prediction.id,
    status: prediction.status || 'pending',
    created_at: prediction.created_at || prediction.date || new Date().toISOString(),
    location: prediction.location || prediction.pickup_location || 'Unknown',
    // Add other relevant fields
    destination: prediction.destination || prediction.dropoff_location,
  }));
};

  // State Management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState([]);
  const [vehicleData, setVehicleData] = useState([]);
  const [predictionData, setPredictionData] = useState([]);
  const [feedbackData, setFeedbackData] = useState([]);
  const [datasetData, setDatasetData] = useState([]);

  // Time-based metrics state
  const [timeMetrics, setTimeMetrics] = useState({
    daily: {
      users: [],
      predictions: [],
      feedbacks: [],
    },
    weekly: {
      users: [],
      predictions: [],
      feedbacks: [],
    },
    monthly: {
      users: [],
      predictions: [],
      feedbacks: [],
    },
  });

  // Feedback metrics state
  const [feedbackMetrics, setFeedbackMetrics] = useState({
    overallRating: 0,
    positiveCount: 0,
    negativeCount: 0,
    ratingDistribution: [],
    ratingTrend: [],
  });

  // Time period selector
  const [selectedTimePeriod, setSelectedTimePeriod] = useState("weekly");

  // Process location metrics
  // Update the processLocationMetrics function to handle null locations
  const processLocationMetrics = (predictions) => {
    try {
      if (!predictions || !predictions.length) {
        return [];
      }

      // Group predictions by location with better null handling
      const locationCounts = {};
      predictions.forEach((prediction) => {
        const location = prediction.location || "Unknown";
        if (!locationCounts[location]) {
          locationCounts[location] = {
            count: 0,
            completed: 0,
            pending: 0,
            canceled: 0,
            in_progress: 0,
          };
        }
        locationCounts[location].count++;

        // Check both uppercase and lowercase status values
        const status = (prediction.status || "").toLowerCase();

        if (status === "completed") {
          locationCounts[location].completed++;
        } else if (status === "pending") {
          locationCounts[location].pending++;
        } else if (status === "canceled") {
          locationCounts[location].canceled++;
        } else if (status === "in_progress" || status === "inprogress") {
          locationCounts[location].in_progress++;
        }
      });

      return Object.entries(locationCounts)
        .map(([location, data]) => ({
          location,
          count: data.count,
          completed: data.completed,
          pending: data.pending,
          canceled: data.canceled,
          in_progress: data.in_progress,
          completionRate:
            data.count > 0
              ? Math.round((data.completed / data.count) * 100)
              : 0,
        }))
        .sort((a, b) => b.count - a.count);
    } catch (error) {
      console.error("Error processing location metrics:", error);
      return [];
    }
  };

  // 3. Fix the processStatusDistribution function
  // You'll also want to update the processStatusDistribution to handle prediction status
  const processStatusDistribution = (users, predictions, feedbacks) => {
    try {
      // Helper function with improved status detection
      const countByStatus = (items, statusField = "status", defaultValue = "unknown") => {
        if (!items || !items.length) return [];

        const statusCounts = {};
        items.forEach((item) => {
          let status;

          if (statusField === "vehicle_status") {
            // More robust detection for vehicle status
            status = item.vehicle_status || "active";
          } else if (statusField === "availability_status") {
            status = item.availability_status || item.status || defaultValue;
          } else if (statusField === "role") {
            status = item.role || defaultValue;
          } else {
            status = item[statusField] || defaultValue;
          }

          // Normalize status to lowercase for consistency
          status = String(status).toLowerCase();

          statusCounts[status] = (statusCounts[status] || 0) + 1;
        });

        return Object.entries(statusCounts).map(([status, count]) => ({
          status,
          count,
          percentage: items.length ? Math.round((count / items.length) * 100) : 0,
        }));
      };

      // Process with improved status detection
      return {
        users: countByStatus(users, "role", "user"),
        predictions: countByStatus(predictions, "status", "pending"),
      };
    } catch (error) {
      console.error("Error processing status distribution:", error);
      return {
        users: [], predictions: []
      };
    }
  };

  // 4. Fix the processFeedbackMetrics function
  const processFeedbackMetrics = (feedbacks) => {
    try {
      // Skip processing if no feedback data
      if (!feedbacks || !feedbacks.length) {
        return {
          overallRating: "0.0",
          positiveCount: 0,
          negativeCount: 0,
          ratingDistribution: [],
          ratingTrend: [],
        };
      }

      // Helper function to safely extract rating value
      const getRating = (feedback) => {
        // First try the primary rating field
        if (typeof feedback.rating === 'number') return feedback.rating;

        // Next try to parse it as a number if it's a string
        if (typeof feedback.rating === 'string') {
          const parsed = parseFloat(feedback.rating);
          if (!isNaN(parsed)) return parsed;
        }

        // Fall back to rate field
        if (typeof feedback.rate === 'number') return feedback.rate;

        // Try to parse rate as number if it's a string
        if (typeof feedback.rate === 'string') {
          const parsed = parseFloat(feedback.rate);
          if (!isNaN(parsed)) return parsed;
        }

        // Default to 0
        return 0;
      };

      // Calculate overall rating with improved parsing
      const ratings = feedbacks.map(feedback => getRating(feedback));
      const validRatings = ratings.filter(r => r > 0);

      let overallRating = "0.0";
      if (validRatings.length > 0) {
        const totalRating = validRatings.reduce((sum, rating) => sum + rating, 0);
        overallRating = (totalRating / validRatings.length).toFixed(1);
      }

      // Count positive (≥3) and negative (<3) feedbacks
      const positiveCount = ratings.filter(r => r >= 3).length;
      const negativeCount = ratings.filter(r => r > 0 && r < 3).length;

      // Create rating distribution with improved parsing
      const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      feedbacks.forEach((feedback) => {
        const rating = Math.round(getRating(feedback));
        if (rating >= 1 && rating <= 5) {
          ratingCounts[rating]++;
        }
      });

      const ratingDistribution = Object.entries(ratingCounts).map(([rating, count]) => ({
        rating: parseInt(rating),
        count,
        percentage: validRatings.length ? Math.round((count / validRatings.length) * 100) : 0,
      }));

      // Create rating trend (monthly)
      const ratingByMonth = {};
      const countByMonth = {};

      feedbacks.forEach((feedback) => {
        // More robust date handling
        if (!feedback.created_at) return;

        const date = new Date(feedback.created_at);
        if (isNaN(date.getTime())) return;

        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const rating = getRating(feedback);
        if (rating <= 0) return;

        if (!ratingByMonth[monthKey]) {
          ratingByMonth[monthKey] = 0;
          countByMonth[monthKey] = 0;
        }

        ratingByMonth[monthKey] += rating;
        countByMonth[monthKey]++;
      });

      const ratingTrend = Object.entries(ratingByMonth)
        .map(([month, totalRating]) => ({
          month,
          avgRating: (totalRating / countByMonth[month]).toFixed(1),
          count: countByMonth[month],
        }))
        .sort((a, b) => a.month.localeCompare(b.month));

      return {
        overallRating,
        positiveCount,
        negativeCount,
        ratingDistribution,
        ratingTrend,
      };
    } catch (error) {
      console.error("Error processing feedback metrics:", error);
      return {
        overallRating: "0.0",
        positiveCount: 0,
        negativeCount: 0,
        ratingDistribution: [],
        ratingTrend: [],
      };
    }
  };

  const processTimeMetrics = (users, predictions, feedbacks) => {
    try {
      // Helper function to get date strings
      const getDateString = (dateObj) => {
        if (!dateObj) return null;
        const date = new Date(dateObj);
        if (isNaN(date.getTime())) return null;
        return date.toISOString().split("T")[0];
      };
  
      // Helper function to create date buckets
      const createDateBuckets = (daysAgo) => {
        const dates = [];
        for (let i = daysAgo; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          dates.push(getDateString(date));
        }
        return dates;
      };
  
      // Generic helper for other data types - with added null safety
      const countItemsByDate = (items, dates, dateField = "created_at") => {
        // Ensure items is an array before processing
        if (!items || !Array.isArray(items)) {
          return dates.map(date => ({ date, count: 0 }));
        }
  
        return dates.map((date) => {
          // More robust checking for various date field names
          const count = items.filter((item) => {
            if (!item) return false;
            
            // Check different possible date field names
            const itemDateRaw = item[dateField] || item.created_date || item.date_created || item.date_joined;
            if (!itemDateRaw) return false;
  
            const itemDate = getDateString(new Date(itemDateRaw));
            return itemDate === date;
          }).length;
  
          return {
            date,
            count,
          };
        });
      };
  
      // Create daily, weekly, and monthly date buckets
      const dailyDates = createDateBuckets(6); // Last 7 days
      const weeklyDates = createDateBuckets(28); // Last 4 weeks
      const monthlyDates = createDateBuckets(180); // Last 6 months
  
      // Process metrics for each time period
      const daily = {
        users: countItemsByDate(users || [], dailyDates, "created_at"),
        predictions: countItemsByDate(predictions || [], dailyDates, "created_at"),
        feedbacks: countItemsByDate(feedbacks || [], dailyDates, "created_at"),
      };
  
      const weekly = {
        users: countItemsByDate(users || [], weeklyDates, "created_at"),
        predictions: countItemsByDate(predictions || [], weeklyDates, "created_at"),
        feedbacks: countItemsByDate(feedbacks || [], weeklyDates, "created_at"),
      };
  
      const monthly = {
        users: countItemsByDate(users || [], monthlyDates, "created_at"),
        predictions: countItemsByDate(predictions || [], monthlyDates, "created_at"),
        feedbacks: countItemsByDate(feedbacks || [], monthlyDates, "created_at"),
      };
  
      return { daily, weekly, monthly };
    } catch (error) {
      console.error("Error processing time metrics:", error);
      return {
        daily: {
          users: [], predictions: [], feedbacks: []
        },
        weekly: {
          users: [], predictions: [], feedbacks: []
        },
        monthly: {
          users: [], predictions: [], feedbacks: []
        }
      };
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
  
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };
  
      try {
        // Correctly destructure all 4 responses
        const [usersRes, predictionsRes, feedbacksRes, datasetRes] = await Promise.all([
          fetch(`${BASE_URL}/users/`, { headers }),
          fetch(`${BASE_URL}/weather/predictions/`, { headers }),
          fetch(`${BASE_URL}/feedback/feedbacks/`, { headers }),
          fetch(`${BASE_URL}/dataset/datasets/`, { headers }),
        ]);
  
        // Parse JSON for all responses
        const [usersData, predictionsData, feedbacksData, datasetData] = await Promise.all([
          usersRes.json(),
          predictionsRes.json(),
          feedbacksRes.json(),
          datasetRes.json(),
        ]);
  
        // Log the raw data
        console.log("Users Data:", usersData);
        console.log("Predictions Data:", predictionsData);
        console.log("Feedbacks Data:", feedbacksData);
        console.log("Dataset Data:", datasetData);
  
        // Use adapter functions with correct input structure
        const adaptedUsers = adaptUsersData(usersData?.users || usersData || []);
        const adaptedPredictions = adaptPredictionsData(predictionsData?.predictions || predictionsData || []);
        
        // For feedbacks, use the direct array if no nested feedbacks property
        const feedbacksToAdapt = Array.isArray(feedbacksData) ? feedbacksData : 
                               (feedbacksData?.feedbacks || []);
        const adaptedFeedbacks = adaptFeedbackData(feedbacksToAdapt);
  
        // Set state with the adapted data
        setUserData(adaptedUsers);
        setPredictionData(adaptedPredictions);
        setFeedbackData(adaptedFeedbacks);
        setDatasetData(datasetData?.datasets || datasetData || []); // Make sure to also set the dataset data
  
        // Process status distribution
        const statusDistData = processStatusDistribution(
          adaptedUsers,
          adaptedPredictions
        );

        // Process time metrics
        const timeMetricsData = processTimeMetrics(
          adaptedUsers,
          adaptedPredictions,
          adaptedFeedbacks
        );
        setTimeMetrics(timeMetricsData);
       
        // Process feedback metrics
        const feedbackMetricsData = processFeedbackMetrics(adaptedFeedbacks);
        setFeedbackMetrics(feedbackMetricsData);
  
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
  
    fetchAllData();
  }, [navigate]);

  // Format display date
  const formatDisplayDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  if (loading) {
    return (
      <div className="mt-20 p-6 flex items-center justify-center">
        <div className="text-lg font-semibold text-gray-600">
          Loading dashboard data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-20 p-6 flex items-center justify-center">
        <div className="text-lg font-semibold text-green-600">Error: {error}</div>
      </div>
    );
  }

  const activeMetrics = timeMetrics[selectedTimePeriod] ||
    timeMetrics.weekly || {
    users: [],
    predictions: [],
    feedbacks: [],
  };

  return (
    <div className="p-6 space-y-6 bg-gray-950 min-h-screen text-gray-300">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-green-500">Admin Dashboard</h1>
        <div className="flex space-x-4">
          <select
            className="bg-gray-800 text-gray-300 rounded-md border border-gray-700 px-3 py-2"
            value={selectedTimePeriod}
            onChange={(e) => setSelectedTimePeriod(e.target.value)}
          >
            <option value="daily">Last 7 Days</option>
            <option value="weekly">Last 4 Weeks</option>
            <option value="monthly">Last 6 Months</option>
          </select>
        </div>
      </div>
  
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Users Card */}
        <div className="bg-gray-900 rounded-xl shadow-md overflow-hidden border border-gray-800 hover:border-gray-700 transition-all">
          <div className="p-5">
            <div className="flex items-center">
              <div className="rounded-full bg-gray-800 p-3">
                <Users className="h-6 w-6 text-green-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-400">Total Users</p>
                <p className="text-2xl font-bold text-gray-200">
                  {userData.length}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">New Today</span>
                <span className="text-blue-400">
                  {activeMetrics.users[6]?.count || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Predictions Card */}
        <div className="bg-gray-900 rounded-xl shadow-md overflow-hidden border border-gray-800 hover:border-gray-700 transition-all">
          <div className="p-5">
            <div className="flex items-center">
              <div className="rounded-full bg-gray-800 p-3">
                <MapPin className="h-6 w-6 text-green-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-400">Predictions</p>
                <p className="text-2xl font-bold text-gray-200">
                  {predictionData.length}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">New Today</span>
                <span className="text-blue-400">
                  {activeMetrics.predictions[6]?.count || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
  
        {/* Feedback Card */}
        <div className="bg-gray-900 rounded-xl shadow-md overflow-hidden border border-gray-800 hover:border-gray-700 transition-all">
          <div className="p-5">
            <div className="flex items-center">
              <div className="rounded-full bg-gray-800 p-3">
                <Activity className="h-6 w-6 text-green-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-400">Feedbacks</p>
                <p className="text-2xl font-bold text-gray-200">
                  {feedbackData.length}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm">
                <div className="flex items-center">
                  <ThumbsUp className="h-4 w-4 text-green-400 mr-1" />
                  <span className="text-gray-400">
                    {feedbackMetrics.positiveCount || 0}
                  </span>
                  <ThumbsDown className="h-4 w-4 text-green-400 ml-3 mr-1" />
                  <span className="text-gray-400">
                    {feedbackMetrics.negativeCount || 0}
                  </span>
                </div>
                <span className="text-blue-400">
                  {feedbackMetrics.overallRating || "0"}/5
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Datasets Card */}
        <div className="bg-gray-900 rounded-xl shadow-md overflow-hidden border border-gray-800 hover:border-gray-700 transition-all">
          <div className="p-5">
            <div className="flex items-center">
              <div className="rounded-full bg-gray-800 p-3">
                <Database className="h-6 w-6 text-green-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-400">Datasets</p>
                <p className="text-2xl font-bold text-gray-200">
                  {datasetData.length}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Total Files</span>
                <span className="text-blue-400">{datasetData.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
  
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Time Series Chart - Activity Over Time */}
        <div className="bg-gray-900 p-6 rounded-xl shadow-md border border-gray-800">
          <h3 className="text-lg font-semibold mb-4 text-green-500">
            Activity Over Time
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={activeMetrics.users.map((day, index) => ({
                  date: formatDisplayDate(day.date),
                  Users: day.count,
                  Predictions: activeMetrics.predictions[index]?.count || 0,
                  Feedbacks: activeMetrics.feedbacks[index]?.count || 0,
                }))}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12, fill: "#9CA3AF" }}
                  padding={{ left: 10, right: 10 }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: "#9CA3AF" }}
                  label={{ 
                    value: 'Count', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { fill: '#9CA3AF' } 
                  }}
                />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#E5E7EB' }}
                  formatter={(value, name) => [`${value}`, `${name}`]} 
                />
                <RechartsLegend wrapperStyle={{ color: '#9CA3AF' }} />
                <Line
                  type="monotone"
                  dataKey="Users"
                  stroke="#3B82F6" // Blue
                  strokeWidth={2}
                  dot={{ r: 5 }}
                  activeDot={{ r: 7 }}
                />
                <Line
                  type="monotone"
                  dataKey="Predictions"
                  stroke="#10B981" // Green
                  strokeWidth={2}
                  dot={{ r: 5 }}
                  activeDot={{ r: 7 }}
                />
                <Line
                  type="monotone"
                  dataKey="Feedbacks"
                  stroke="#F59E0B" // Amber
                  strokeWidth={2}
                  dot={{ r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
  
        {/* User Distribution Chart */}
        <div className="bg-gray-900 p-6 rounded-xl shadow-md border border-gray-800">
          <h3 className="text-lg font-semibold mb-4 text-green-500">
            User Role Distribution
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={userData.reduce((acc, user) => {
                  const role = user.role?.toLowerCase() || 'user';
                  const existing = acc.find(item => item.role === role);
                  if (existing) {
                    existing.count++;
                  } else {
                    acc.push({ role, count: 1 });
                  }
                  return acc;
                }, [])}
                margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="role" 
                  tick={{ fontSize: 12, fill: "#9CA3AF" }}
                  label={{ 
                    value: 'User Roles', 
                    position: 'insideBottom', 
                    offset: -10,
                    style: { fill: '#9CA3AF' } 
                  }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: "#9CA3AF" }}
                  label={{ 
                    value: 'Number of Users', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { fill: '#9CA3AF' } 
                  }}
                />
                <RechartsTooltip
  contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#E5E7EB' }}
  formatter={(value, name) => [`${value} users`, `${name}`]} 
/>
<RechartsLegend wrapperStyle={{ color: '#9CA3AF' }} />
<Bar 
  dataKey="count" 
  fill="#3B82F6"
  name="User Count"
  radius={[4, 4, 0, 0]}
>
  {userData.reduce((acc, user) => {
    const role = user.role?.toLowerCase() || 'user';
    const existing = acc.find(item => item.role === role);
    if (existing) {
      existing.count++;
    } else {
      acc.push({ role, count: 1 });
    }
    return acc;
  }, []).map((entry, index) => (
    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
  ))}
</Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
  
        {/* Feedback Distribution Chart */}
        <div className="bg-gray-900 p-6 rounded-xl shadow-md border border-gray-800">
          <h3 className="text-lg font-semibold mb-4 text-green-500">
            Feedback Rating Distribution
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={feedbackMetrics.ratingDistribution}
                  dataKey="count"
                  nameKey="rating"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  label={({ rating, percentage }) =>
                    `${rating} ★ (${percentage}%)`
                  }
                  labelLine={{ stroke: "#9CA3AF" }}
                >
                  {feedbackMetrics.ratingDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.rating >= 3 ? "#10B981" : "#EF4444"}
                    />
                  ))}
                </Pie>
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#E5E7EB' }}
                  formatter={(value, name) => [
                    `${value} ratings`,
                    `${name} stars`,
                  ]}
                />
                <RechartsLegend 
                  content={({ payload }) => (
                    <div className="flex justify-center mt-4 flex-wrap">
                      {payload.map((entry, index) => (
                        <div key={`legend-${index}`} className="flex items-center mx-2 mb-2">
                          <div className="w-3 h-3 mr-1" style={{ backgroundColor: entry.color }}></div>
                          <span className="text-sm text-gray-300">
                            {entry.payload.rating} Stars - {entry.payload.count} ratings ({entry.payload.percentage}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
  
        {/* Feedback Trend Chart */}
        <div className="bg-gray-900 p-6 rounded-xl shadow-md border border-gray-800">
          <h3 className="text-lg font-semibold mb-4 text-green-500">
            Feedback Rating Trend
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart 
                data={feedbackMetrics.ratingTrend}
                margin={{ top: 10, right: 30, left: 0, bottom: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: "#9CA3AF" }}
                  label={{ 
                    value: 'Time Period', 
                    position: 'insideBottom', 
                    offset: -10,
                    style: { fill: '#9CA3AF' } 
                  }}
                />
                <YAxis 
                  domain={[0, 5]} 
                  tick={{ fill: "#9CA3AF" }} 
                  label={{ 
                    value: 'Rating Value', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { fill: '#9CA3AF' } 
                  }}
                />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#E5E7EB' }}
                  formatter={(value, name) => {
                    if (name === "avgRating") return [`${value}/5`, "Average Rating"];
                    return [`${value}`, "Number of Feedbacks"];
                  }} 
                />
                <RechartsLegend wrapperStyle={{ color: '#9CA3AF' }} />
                <Area
                  type="monotone"
                  dataKey="avgRating"
                  stroke="#EF4444"
                  fill="#EF4444"
                  fillOpacity={0.2}
                  name="Average Rating"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.2}
                  name="Number of Feedbacks"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Prediction Status Distribution */}
        <div className="bg-gray-900 p-6 rounded-xl shadow-md border border-gray-800">
          <h3 className="text-lg font-semibold mb-4 text-green-500">
            Prediction Status Distribution
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={predictionData.reduce((acc, prediction) => {
                    const status = prediction.status?.toLowerCase() || 'pending';
                    const existing = acc.find(item => item.name === status);
                    if (existing) {
                      existing.value++;
                    } else {
                      acc.push({ name: status, value: 1 });
                    }
                    return acc;
                  }, [])}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={{ stroke: "#9CA3AF" }}
                >
                  {predictionData.reduce((acc, prediction) => {
                    const status = prediction.status?.toLowerCase() || 'pending';
                    const existing = acc.find(item => item.name === status);
                    if (existing) {
                      existing.value++;
                    } else {
                      acc.push({ name: status, value: 1 });
                    }
                    return acc;
                  }, []).map((entry, index) => {
                    let color = COLORS[index % COLORS.length];
                    if (STATUS_COLORS[entry.name]) {
                      color = STATUS_COLORS[entry.name];
                    }
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Pie>
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#E5E7EB' }}
                  formatter={(value, name) => [
                    `${value} predictions`,
                    `Status: ${name}`,
                  ]}
                />
                <RechartsLegend 
                  verticalAlign="bottom"
                  height={36}
                  wrapperStyle={{ color: '#9CA3AF' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dataset Statistics */}
        <div className="bg-gray-900 p-6 rounded-xl shadow-md border border-gray-800">
          <h3 className="text-lg font-semibold mb-4 text-green-500">
            Dataset Statistics
          </h3>
          <div className="h-80 flex flex-col justify-center">
            {datasetData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={datasetData.reduce((acc, dataset, index) => {
                    // Use dataset categories or create arbitrary groupings if needed
                    const category = dataset.category || dataset.type || `Dataset ${index + 1}`;
                    const existing = acc.find(item => item.name === category);
                    if (existing) {
                      existing.value++;
                    } else {
                      acc.push({ name: category, value: 1 });
                    }
                    return acc;
                  }, [])}
                  margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12, fill: "#9CA3AF" }}
                    label={{ 
                      value: 'Dataset Categories', 
                      position: 'insideBottom', 
                      offset: -10,
                      style: { fill: '#9CA3AF' } 
                    }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: "#9CA3AF" }}
                    label={{ 
                      value: 'Count', 
                      angle: -90, 
                      position: 'insideLeft',
                      style: { fill: '#9CA3AF' } 
                    }}
                  />
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#E5E7EB' }}
                    formatter={(value) => [`${value} datasets`]} 
                  />
                  <Bar 
                    dataKey="value" 
                    name="Dataset Count"
                    radius={[4, 4, 0, 0]}
                  >
                    {datasetData.reduce((acc, dataset, index) => {
                      const category = dataset.category || dataset.type || `Dataset ${index + 1}`;
                      const existing = acc.find(item => item.name === category);
                      if (existing) {
                        existing.value++;
                      } else {
                        acc.push({ name: category, value: 1 });
                      }
                      return acc;
                    }, []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <Database className="h-16 w-16 text-gray-600 mb-4" />
                <p className="text-gray-500 text-center text-lg">
                  {datasetData.length} datasets available
                </p>
                <p className="text-gray-600 text-center mt-2">
                  Dataset information displayed here
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Additional Statistics Section */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-green-500 mb-4">System Overview</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Growth */}
          <div className="bg-gray-900 p-6 rounded-xl shadow-md border border-gray-800">
            <h3 className="text-lg font-semibold mb-4 text-green-400">User Growth</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total Users</span>
                <span className="text-lg font-semibold text-gray-200">{userData.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">New This Week</span>
                <span className="text-lg font-semibold text-gray-200">
                  {activeMetrics.users.slice(-7).reduce((sum, day) => sum + day.count, 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Growth Rate</span>
                <span className="text-lg font-semibold text-green-400">
                  {userData.length > 0 ? 
                    `+${((activeMetrics.users.slice(-7).reduce((sum, day) => sum + day.count, 0) / userData.length) * 100).toFixed(1)}%` : 
                    '0%'}
                </span>
              </div>
            </div>
          </div>

          {/* Prediction Statistics */}
          <div className="bg-gray-900 p-6 rounded-xl shadow-md border border-gray-800">
            <h3 className="text-lg font-semibold mb-4 text-green-400">Prediction Statistics</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total Predictions</span>
                <span className="text-lg font-semibold text-gray-200">{predictionData.length}</span>
              </div>
              {/* <div className="flex justify-between items-center">
                <span className="text-gray-400">Completed Predictions</span>
                <span className="text-lg font-semibold text-gray-200">
                  {predictionData.filter(p => p.status?.toLowerCase() === 'completed').length}
                </span>
              </div> */}
              {/* <div className="flex justify-between items-center">
                <span className="text-gray-400">Completion Rate</span>
                <span className="text-lg font-semibold text-blue-400">
                  {predictionData.length > 0 ? 
                    `${((predictionData.filter(p => p.status?.toLowerCase() === 'completed').length / predictionData.length) * 100).toFixed(1)}%` : 
                    '0%'}
                </span>
              </div> */}
            </div>
          </div>

          {/* Feedback Summary */}
          <div className="bg-gray-900 p-6 rounded-xl shadow-md border border-gray-800">
            <h3 className="text-lg font-semibold mb-4 text-green-400">Feedback Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Average Rating</span>
                <span className="text-lg font-semibold text-yellow-400">
                  {feedbackMetrics.overallRating}/5 ★
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total Feedbacks</span>
                <span className="text-lg font-semibold text-gray-200">{feedbackData.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Satisfaction Rate</span>
                <span className="text-lg font-semibold text-green-400">
                  {feedbackData.length > 0 ? 
                    `${((feedbackMetrics.positiveCount / feedbackData.length) * 100).toFixed(1)}%` : 
                    '0%'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;