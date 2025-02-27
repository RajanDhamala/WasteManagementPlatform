import { useState, useEffect } from "react";
import { motion, useMotionValue, animate } from "framer-motion";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Trophy, Crown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";


const AnimatedNumber = ({ number }) => {
  const count = useMotionValue(number);
  const rounded = useMotionValue(number);

  useEffect(() => {
    const animation = animate(count, number, {
      duration: 0.8,
      ease: "easeOut",
      onUpdate: (latest) => {
        rounded.set(Math.round(latest));
      },
    });
    return animation.stop;
  }, [number]);

  return <motion.span>{rounded}</motion.span>;
};

export default function RankingList() {
  const [isPolling, setIsPolling] = useState(true);

  const fetchRanking = async () => {
    const response = await axios.get("http://localhost:8000/community/ranking", {
      withCredentials: true,
    });
    return response.data.data.rankings;
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["ranking"],
    queryFn: fetchRanking,
    staleTime: 1000 * 60 * 5,
    refetchInterval: isPolling ? 10000 : false,
    refetchIntervalInBackground:false,
  });

  const togglePolling = () => {
    setIsPolling((prev) => !prev);
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Trophy className="h-8 w-8 text-yellow-300 animate-pulse" />
            <div>
              <h2 className="text-2xl font-bold text-white animate-pulse">
                Loading Leaderboard...
              </h2>
              <p className="text-sm text-emerald-100 animate-pulse">
                Please wait
              </p>
            </div>
          </div>
          <button
            onClick={togglePolling}
            className="bg-white text-green-600 px-4 py-2 rounded shadow hover:bg-green-50 transition"
          >
            {isPolling ? "Stop Polling" : "Start Polling"}
          </button>
        </div>
        <div className="divide-y">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="group flex items-center p-4 gap-4 transition-all hover:bg-green-50/70 animate-pulse"
            >
              <div className="flex items-center justify-center w-10">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-300" />
              </div>
              <div className="h-12 w-12 bg-gray-300 rounded-full" />
              <div className="flex-grow space-y-1.5">
                <div className="h-4 w-32 bg-gray-300 rounded" />
                <div className="h-3 w-24 bg-gray-200 rounded" />
              </div>
              <div className="flex flex-col items-center min-w-[80px]">
                <div className="h-4 w-12 bg-gray-300 rounded" />
                <div className="h-3 w-16 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="w-full max-w-2xl mx-auto shadow-lg overflow-hidden p-6">
        <p>Error loading rankings: {error.message}</p>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Trophy className="h-8 w-8 text-yellow-300" />
          <div>
            <h2 className="text-2xl font-bold text-white">
              Global Eco Leaderboard
            </h2>
            <p className="text-sm text-emerald-100">
              Top Waste Management Champions
            </p>
          </div>
        </div>
        <button
          onClick={togglePolling}
          className="bg-white text-green-600 px-4 py-2 rounded shadow hover:bg-green-50 transition"
        >
          {isPolling ? "Stop Polling" : "Start Polling"}
        </button>
      </div>
      <div className="divide-y">
        {data.map((user, index) => (
          <div
            key={user._id || index}
            className={cn(
              "group flex items-center p-4 gap-4 transition-all hover:bg-green-50/70",
              "hover:shadow-md cursor-pointer"
            )}
          >
            <div className="flex items-center justify-center w-10">
              <div
                className={cn(
                  "flex items-center justify-center h-8 w-8 rounded-full",
                  index === 0
                    ? "bg-gradient-to-b from-yellow-500 to-amber-600 shadow-glow"
                    : index === 1
                    ? "bg-gradient-to-b from-gray-400 to-slate-600"
                    : index === 2
                    ? "bg-gradient-to-b from-amber-700 to-amber-800"
                    : "bg-muted"
                )}
              >
                {index < 3 ? (
                  <Crown
                    className={cn(
                      "h-4 w-4",
                      index === 0
                        ? "text-white"
                        : index === 1
                        ? "text-white"
                        : "text-amber-100"
                    )}
                  />
                ) : (
                  <span className="text-sm font-bold text-foreground">
                    {index + 1}
                  </span>
                )}
              </div>
            </div>

            <Avatar className="h-12 w-12 border-2 border-emerald-100 shadow-md group-hover:border-green-300 transition-colors">
            <AvatarImage
  src={user.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.name}`}
  alt={user.username}
  onError={(e) => {
    console.log("Image failed to load", e);
    e.target.src = "/path/to/your/default-image.png";  // Optional: set a default fallback image
  }}
/>

              <AvatarFallback className="bg-green-100">
                {user.name?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-grow space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-green-900">
                  {user.username}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-center min-w-[80px]">
              <span className="text-lg font-bold text-green-900">
                <AnimatedNumber number={user.points || user.Points || 0} />
              </span>
              <span className="text-xs text-muted-foreground">eco points</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
