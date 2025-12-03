const app = require("./app");
const config = require("./config/config");
const { sequelize } = require("./models");

// Test database connection
const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log("✅ Database connection established successfully.");
    } catch (error) {
        console.error("❌ Unable to connect to the database:", error);
        process.exit(1);
    }
};

// Start server
const startServer = async () => {
    try {
        await connectDB();

        const PORT = config.PORT;
        app.listen(PORT, () => {
            console.log(`🚀 Server is running on port ${PORT}`);
            console.log(`📝 Environment: ${config.NODE_ENV}`);
            console.log(`🌐 Health check: ${config.APP_URL}/health`);
        });
    } catch (error) {
        console.error("❌ Failed to start server:", error);
        process.exit(1);
    }
};

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
    console.error("❌ Unhandled Rejection:", err);
    process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
    console.error("❌ Uncaught Exception:", err);
    process.exit(1);
});

startServer();
