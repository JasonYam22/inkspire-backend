export const notFoundHandler = (req, res, next) => {
    res.status(404).json({ message: "Route not found" });
};
export const errorHandler = (error, req, res, next) => {
    if (error.code === "P2025") {
        res.status(404).json({ message: "Not found" });
        return;
    }
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
};
//# sourceMappingURL=index.js.map