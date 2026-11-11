import "dotenv/config";
import app from "./app.js";

const PORT = process.env.PORT || 5005;

// Start the backend so it can receive requests.
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
