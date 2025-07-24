// Utility function for a simple message box instead of alert()
export const showMessageBox = (message, type = "info") => {
    const messageBox = document.createElement("div");
    messageBox.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg text-white z-50 ${
        type === "error"
            ? "bg-red-500"
            : type === "success"
              ? "bg-green-500"
              : "bg-blue-500"
    }`;
    messageBox.textContent = message;
    document.body.appendChild(messageBox);
    setTimeout(() => {
        messageBox.remove();
    }, 3000);
};
