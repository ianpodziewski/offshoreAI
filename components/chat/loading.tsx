// /components/chat/loading.tsx
import { LoadingIndicator, IndicatorIconType } from "@/types";
import { motion } from "framer-motion";
import { Brain, FileStack, FileSearch, Scan, AlertCircle } from "lucide-react";

export function Pill({
  status,
  icon,
  isError,
  isDone,
}: {
  status: string;
  icon: IndicatorIconType;
  isError: boolean;
  isDone: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
        isError 
          ? "bg-red-900/30 text-red-300" 
          : isDone 
            ? "bg-gray-800/30 text-gray-400" 
            : "bg-blue-900/20 text-blue-300 animate-pulse"
      } shadow-sm max-w-max`}
    >
      {icon === "thinking" && <Brain className="w-4 h-4" />}
      {icon === "searching" && <FileSearch className="w-4 h-4" />}
      {icon === "understanding" && <Scan className="w-4 h-4" />}
      {icon === "documents" && <FileStack className="w-4 h-4" />}
      {icon === "error" && <AlertCircle className="w-4 h-4" />}
      <p className="text-sm">{status}</p>
    </motion.div>
  );
}

export default function Loading({
  indicatorState,
}: {
  indicatorState: LoadingIndicator[];
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="py-3 px-3 rounded-lg flex flex-col gap-2 items-start transition-shadow duration-300"
    >
      {indicatorState.map((indicator, index) => {
        return (
          <Pill
            key={indicator.status}
            status={indicator.status}
            icon={indicator.icon}
            isError={indicator.icon === "error"}
            isDone={index !== indicatorState.length - 1}
          />
        );
      })}
    </motion.div>
  );
}