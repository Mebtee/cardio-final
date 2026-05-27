import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Filter, X } from "lucide-react";

interface RequestFiltersProps {
  dateFilter: string;
  setDateFilter: (date: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  onClear: () => void;
  statusOptions?: { value: string; label: string }[];
}

const RequestFilters = ({
  dateFilter,
  setDateFilter,
  statusFilter,
  setStatusFilter,
  onClear,
  statusOptions = [
    { value: "all", label: "All Status" },
    { value: "pending", label: "Pending" },
    { value: "completed", label: "Completed" },
    { value: "in_progress", label: "In Progress" },
  ],
}: RequestFiltersProps) => {
  const hasFilters = dateFilter || (statusFilter && statusFilter !== "all");

  return (
    <div className="flex flex-wrap items-center gap-4 mb-4">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">Filters:</span>
      </div>
      <Input
        type="date"
        value={dateFilter}
        onChange={(e) => setDateFilter(e.target.value)}
        className="w-auto"
        placeholder="Filter by date"
      />
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Select status" />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={onClear}>
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
};

export default RequestFilters;
