import { Badge } from "@/components/ui/badge";

interface KeywordChipsProps {
  keywords: string[];
  onKeywordClick: (keyword: string) => void;
}

const KeywordChips = ({ keywords, onKeywordClick }: KeywordChipsProps) => {
  if (!keywords || keywords.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {keywords.map((keyword, index) => (
        <button
          key={index}
          onClick={() => onKeywordClick(keyword)}
          className="px-3 py-1 text-xs rounded-full bg-white/20 hover:bg-white/30 text-white border border-white/40 transition-all cursor-pointer"
        >
          {keyword}
        </button>
      ))}
    </div>
  );
};

export default KeywordChips;
