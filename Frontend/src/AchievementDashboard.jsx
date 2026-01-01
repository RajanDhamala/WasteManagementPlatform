
import { useState, useEffect } from "react";
import {
  Award,
  Crown,
  Star,
  Users,
  Handshake,
  Sun,
  Clock,
  MessageSquare,
  HeartHandshake,
  Leaf,
  Recycle,
} from "lucide-react";

export default function AchievementsDashboard() {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Icon + color map
  const iconMap = {
    "bronze-medal": { icon: <Award className="w-10 h-10 text-orange-600" />, bg: "from-orange-50 to-orange-100" },
    "silver-medal": { icon: <Award className="w-10 h-10 text-gray-500" />, bg: "from-gray-50 to-gray-100" },
    "diamond-medal": { icon: <Crown className="w-10 h-10 text-blue-600" />, bg: "from-blue-50 to-blue-100" },
    "heroic-badge": { icon: <Star className="w-10 h-10 text-purple-600" />, bg: "from-purple-50 to-purple-100" },
    "leadership-icon": { icon: <Users className="w-10 h-10 text-green-600" />, bg: "from-green-50 to-green-100" },
    "helpfulness-icon": { icon: <HeartHandshake className="w-10 h-10 text-teal-600" />, bg: "from-teal-50 to-teal-100" },
    "teamwork-icon": { icon: <Handshake className="w-10 h-10 text-indigo-600" />, bg: "from-indigo-50 to-indigo-100" },
    "enthusiasm-icon": { icon: <Sun className="w-10 h-10 text-yellow-600" />, bg: "from-yellow-50 to-yellow-100" },
    "punctuality-icon": { icon: <Clock className="w-10 h-10 text-emerald-600" />, bg: "from-emerald-50 to-emerald-100" },
    "communication-icon": { icon: <MessageSquare className="w-10 h-10 text-sky-600" />, bg: "from-sky-50 to-sky-100" },
    "eco-icon": { icon: <Leaf className="w-10 h-10 text-green-700" />, bg: "from-green-50 to-green-100" },
    "recycle-icon": { icon: <Recycle className="w-10 h-10 text-lime-600" />, bg: "from-lime-50 to-lime-100" },
  };

  // Fetch achievements from API
  useEffect(() => {
    async function fetchAchievements() {
      try {
        const res = await fetch("http://localhost:8000/achivement/get", {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        if (data.success && data.data.achievements) {
          setAchievements(data.data.achievements);
        } else {
          setAchievements([]);
        }
      } catch (err) {
        console.error("Error fetching achievements:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAchievements();
  }, []);

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!achievements.length) return <p className="text-center mt-10 text-gray-500">No achievements earned yet.</p>;

  // Separate milestone vs custom awards
  const milestones = achievements.filter(a => a.achievement.type === "point-milestone");
  const customs = achievements.filter(a => a.achievement.type === "custom");

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-10 text-center text-green-700">🌱 My Achievements</h2>

      {/* Milestone Achievements */}
      {milestones.length > 0 && (
        <section className="mb-12">
          <h3 className="text-xl font-semibold mb-6 text-gray-800 text-center">Point Milestones</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {milestones.map((ach) => {
              const style = iconMap[ach.achievement.iconName] || iconMap["eco-icon"];
              return <AchievementCard key={ach._id} ach={ach} style={style} />;
            })}
          </div>
        </section>
      )}

      {/* Custom Awards */}
      {customs.length > 0 && (
        <section>
          <h3 className="text-xl font-semibold mb-6 text-gray-800 text-center">Community Awards</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {customs.map((ach) => {
              const style = iconMap[ach.achievement.iconName] || iconMap["eco-icon"];
              return <AchievementCard key={ach._id} ach={ach} style={style} />;
            })}
          </div>
        </section>
      )}
    </div>
  );
}

// Achievement Card Component
function AchievementCard({ ach, style }) {
  const { achievement, earnedAt } = ach;
  return (
    <div className="relative rounded-2xl p-6 bg-white/80 backdrop-blur-sm border border-green-100 shadow-md hover:shadow-lg hover:-translate-y-1 transition transform duration-300">
      {/* Icon */}
      <div className={`mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-br ${style.bg} shadow-inner`}>
        {style.icon}
      </div>

      {/* Name */}
      <h3 className="text-lg font-semibold mt-4 text-gray-800 text-center">{achievement.name}</h3>

      {/* Description */}
      <p className="text-sm text-gray-600 mt-1 text-center">{achievement.description}</p>

      {/* Type + Unlock Condition */}
      <div className="mt-4 flex flex-col items-center space-y-2">
        <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 capitalize">
          {achievement.type.replace("-", " ")}
        </span>
        {achievement.type === "point-milestone" && (
          <span className="px-3 py-1 text-xs rounded-full bg-blue-50 text-blue-700 font-medium">
            Unlocked at {achievement.criteria?.minPoints} points
          </span>
        )}
        {/* Show earned date */}
        <span className="text-xs text-gray-500">
          Earned on {new Date(earnedAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}
