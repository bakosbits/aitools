import React from "react";

const LoadingSpinner = () => (
    <div className="flex justify-center items-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <p className="ml-2 text-gray-700">Loading...</p>
    </div>
);

export default LoadingSpinner;
