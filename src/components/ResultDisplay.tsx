
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PredictionResult {
  prediction: "positive" | "negative";
  confidence: number;
  timestamp: string;
}

interface ResultDisplayProps {
  result: PredictionResult | null;
}

const ResultDisplay = ({ result }: ResultDisplayProps) => {
  if (!result) return null;

  const isPositive = result.prediction === "positive";
  const confidencePercent = Math.round(result.confidence * 100);
  
  return (
    <Card className={cn(
      "w-full transition-all", 
      isPositive ? "border-destructive/40" : "border-success/40"
    )}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-xl">
          {isPositive ? (
            <>
              <XCircle className="h-6 w-6 text-destructive" />
              <span>Positive for Cardiomegaly</span>
            </>
          ) : (
            <>
              <CheckCircle className="h-6 w-6 text-success" />
              <span>Negative for Cardiomegaly</span>
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Confidence Score</span>
              <span className="text-sm font-medium">{confidencePercent}%</span>
            </div>
            <Progress 
              value={confidencePercent} 
              className={cn(
                "h-2", 
                isPositive ? "bg-destructive/20" : "bg-success/20"
              )}
              indicatorClassName={cn(
                isPositive ? "bg-destructive" : "bg-success"
              )}
            />
          </div>
          <div className="text-sm text-muted-foreground">
            <p>Analysis completed: {new Date(result.timestamp).toLocaleString()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResultDisplay;
