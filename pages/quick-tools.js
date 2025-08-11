import QuickTools from "@/components/QuickTools";

export default function QuickToolsPage() {
  return (
    <div className="flex items-center justify-center">
      <div className="w-full flex flex-col max-w-4xl items-left justify-left py-12">
        <h1 className="text-3xl font-bold mb-2">Quick Tools</h1>
        <p className="ml-2 mb-8">
          ✨ A series of simple content generation tools. Perfect for anyone
          just getting started or on a tight budget.
        </p>
        <QuickTools />
      </div>
    </div>
  );
}
